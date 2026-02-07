import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Stripe lazily to avoid build-time errors
let stripeInstance: Stripe | null = null;
const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

// Initialize Supabase admin lazily
let supabaseAdminInstance: SupabaseClient | null = null;
const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdminInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseAdminInstance;
};

// Map Stripe Price IDs to plan tiers and credit amounts
// IMPORTANT: Update these with your actual Stripe Price IDs from your Payment Links
const PRICE_TO_PLAN: Record<string, { tier: string; credits: number }> = {
  // Will be auto-populated by amount fallback below
};

// Fallback: Map plan amounts (in cents) to tiers
const AMOUNT_TO_PLAN: Record<number, { tier: string; credits: number }> = {
  1000: { tier: 'basic', credits: 500 },    // $10/month = Basic
  2000: { tier: 'pro', credits: 2000 },      // $20/month = Pro
  6000: { tier: 'ultra', credits: 5000 },     // $60/month = Ultra
};

/**
 * Find the user by email across the `users` table and auth.users
 */
async function findUserByEmail(supabaseAdmin: SupabaseClient, email: string): Promise<string | null> {
  // Try users table first
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (user) return user.id;

  // Fallback: search auth.users
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  const foundUser = authData?.users?.find(u => u.email === email);
  return foundUser?.id || null;
}

/**
 * Find user by Stripe customer ID
 */
async function findUserByCustomerId(supabaseAdmin: SupabaseClient, customerId: string): Promise<string | null> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  return user?.id || null;
}

/**
 * Determine the plan tier from a Stripe price or amount
 */
function determinePlanFromPrice(priceId: string, amount?: number): { tier: string; credits: number } | null {
  if (priceId && PRICE_TO_PLAN[priceId]) {
    return PRICE_TO_PLAN[priceId];
  }

  if (amount) {
    if (AMOUNT_TO_PLAN[amount]) return AMOUNT_TO_PLAN[amount];
    // Fuzzy match for common recurring amounts
    if (amount >= 5500 && amount <= 6500) return { tier: 'ultra', credits: 5000 };
    if (amount >= 1500 && amount <= 2500) return { tier: 'pro', credits: 2000 };
    if (amount >= 800 && amount <= 1200) return { tier: 'basic', credits: 500 };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, supabaseAdmin, session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(stripe, supabaseAdmin, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabaseAdmin, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          await handleRecurringPayment(stripe, supabaseAdmin, invoice);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for invoice:', invoice.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle checkout.session.completed — fires when customer completes a Stripe Payment Link.
 * This is the PRIMARY handler for plan upgrades.
 * Updates the `users` table (NOT profiles) with new tier, credits, and status.
 */
async function handleCheckoutCompleted(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const customerEmail = session.customer_details?.email;
  const customerId = session.customer as string;

  if (!customerEmail) {
    console.error('No customer email in checkout session');
    return;
  }

  console.log(`Checkout completed for ${customerEmail}, customer: ${customerId}`);

  // Find the user in the users table
  const userId = await findUserByEmail(supabaseAdmin, customerEmail);
  if (!userId) {
    console.error('User not found for email:', customerEmail);
    return;
  }

  // Get the line items to determine what plan was purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  let plan: { tier: string; credits: number } | null = null;

  for (const item of lineItems.data) {
    const priceId = item.price?.id || '';
    const unitAmount = item.price?.unit_amount || 0;
    plan = determinePlanFromPrice(priceId, unitAmount);
    if (plan) {
      console.log(`Detected plan from price ${priceId} (amount: ${unitAmount}): ${plan.tier} with ${plan.credits} credits`);
      break;
    }
  }

  if (!plan) {
    const sessionAmount = session.amount_total || 0;
    plan = determinePlanFromPrice('', sessionAmount);
    console.log(`Fallback plan detection from session amount ${sessionAmount}:`, plan);
  }

  if (!plan) {
    console.error('Could not determine plan. Defaulting to basic.');
    plan = { tier: 'basic', credits: 500 };
  }

  // Update the users table with the new subscription
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      subscription_tier: plan.tier,
      subscription_status: 'active',
      stripe_customer_id: customerId,
      credits: plan.credits,
      credits_used: 0,
      credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user subscription:', updateError);
    // Try using the upgrade_user_tier RPC as fallback
    const { error: rpcError } = await supabaseAdmin.rpc('upgrade_user_tier', {
      p_user_id: userId,
      p_new_tier: plan.tier,
    });
    if (rpcError) {
      console.error('RPC upgrade_user_tier also failed:', rpcError);
    } else {
      console.log(`Used RPC to upgrade user ${userId} to ${plan.tier}`);
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
  } else {
    console.log(`✅ Upgraded user ${userId} to ${plan.tier} with ${plan.credits} credits`);
  }

  // Log the transaction (best effort)
  try {
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: userId,
      amount: plan.credits,
      type: 'subscription_upgrade',
      description: `Upgraded to ${plan.tier} plan via Stripe (${session.id})`,
    });
  } catch (e) {
    console.log('Could not log credit transaction (table may not exist)');
  }
}

/**
 * Handle subscription.created / subscription.updated
 * Updates the users table with new subscription status and tier.
 */
async function handleSubscriptionUpdate(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  let userId = await findUserByCustomerId(supabaseAdmin, customerId);

  if (!userId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted && customer.email) {
        userId = await findUserByEmail(supabaseAdmin, customer.email);
      }
    } catch (e) {
      console.error('Could not retrieve Stripe customer:', e);
    }
  }

  if (!userId) {
    console.error('User not found for Stripe customer:', customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id || '';
  const unitAmount = subscription.items.data[0]?.price?.unit_amount || 0;
  const status = subscription.status;
  const plan = determinePlanFromPrice(priceId, unitAmount);

  const updateData: Record<string, any> = {
    subscription_status: status,
    stripe_customer_id: customerId,
  };

  // Only update tier and credits if subscription is active and plan is known
  if (status === 'active' && plan) {
    updateData.subscription_tier = plan.tier;
    updateData.credits = plan.credits;
    updateData.credits_used = 0;
    updateData.credits_reset_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log(`✅ Updated subscription for user ${userId}: status=${status}, tier=${plan?.tier || 'unchanged'}`);
  }
}

/**
 * Handle subscription.deleted — downgrade to free tier
 */
async function handleSubscriptionCancelled(supabaseAdmin: SupabaseClient, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = await findUserByCustomerId(supabaseAdmin, customerId);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: 'free',
      credits: 10,
      credits_used: 0,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error cancelling subscription:', error);
  } else {
    console.log(`✅ Cancelled subscription for user ${userId}, downgraded to free`);
  }
}

/**
 * Handle recurring invoice.payment_succeeded — refresh credits monthly
 */
async function handleRecurringPayment(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;
  const userId = await findUserByCustomerId(supabaseAdmin, customerId);
  if (!userId) return;

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (userData?.subscription_tier && userData.subscription_tier !== 'free') {
    const plan = determinePlanFromPrice('', invoice.amount_paid || 0);
    const credits = plan?.credits || (
      userData.subscription_tier === 'ultra' ? 5000 :
      userData.subscription_tier === 'pro' ? 2000 :
      userData.subscription_tier === 'basic' ? 500 : 10
    );

    await supabaseAdmin
      .from('users')
      .update({
        credits: credits,
        credits_used: 0,
        credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', userId);

    console.log(`✅ Refreshed ${credits} credits for user ${userId} (recurring payment)`);
  }
}
