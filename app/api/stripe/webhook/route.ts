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

// Credit amounts for each product (map your Stripe price IDs to credits)
const CREDIT_AMOUNTS: Record<string, number> = {
  // Add your Stripe price IDs here
  // 'price_xxx': 100, // 100 credits for this price
  // 'price_yyy': 500, // 500 credits for this price
};

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
        
        // Get customer email from session
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string;
        
        if (!customerEmail) {
          console.error('No customer email in session');
          break;
        }

        // Find user by email
        const { data: user, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id, credits')
          .eq('email', customerEmail)
          .single();

        if (userError || !user) {
          // Try finding by user's auth email
          const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
          const foundUser = authUser?.users?.find(u => u.email === customerEmail);
          
          if (!foundUser) {
            console.error('User not found for email:', customerEmail);
            break;
          }

          // Use auth user id to find/create profile
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, credits')
            .eq('id', foundUser.id)
            .single();

          if (profile) {
            await handleCreditPurchase(stripe, supabaseAdmin, session, profile.id, profile.credits || 0);
          }
        } else {
          await handleCreditPurchase(stripe, supabaseAdmin, session, user.id, user.credits || 0);
        }
        
        // Update Stripe customer ID on user profile
        if (customerId && user) {
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id);
        }
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabaseAdmin, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabaseAdmin, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle recurring subscription payment
        console.log('Recurring payment succeeded for invoice:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for invoice:', invoice.id);
        // Optionally notify user or update their status
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCreditPurchase(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  session: Stripe.Checkout.Session,
  userId: string,
  currentCredits: number
) {
  // Get line items to determine credits purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  
  let totalCredits = 0;
  
  for (const item of lineItems.data) {
    const priceId = item.price?.id;
    if (priceId && CREDIT_AMOUNTS[priceId]) {
      totalCredits += CREDIT_AMOUNTS[priceId] * (item.quantity || 1);
    } else {
      // Fallback: calculate from amount (assuming $1 = 10 credits or similar)
      const amount = item.amount_total || 0;
      // Adjust this ratio based on your pricing
      totalCredits += Math.floor(amount / 10); // cents to credits
    }
  }

  if (totalCredits > 0) {
    const newCredits = currentCredits + totalCredits;
    
    await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    // Log the transaction
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: userId,
      amount: totalCredits,
      type: 'purchase',
      description: `Purchased via Stripe (${session.id})`,
      stripe_session_id: session.id,
    });

    console.log(`Added ${totalCredits} credits to user ${userId}. New balance: ${newCredits}`);
  }
}

async function handleSubscriptionUpdate(supabaseAdmin: SupabaseClient, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const status = subscription.status;

  // Get current period end from subscription items
  const currentPeriodEnd = (subscription as any).current_period_end;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_price_id: priceId,
      subscription_id: subscription.id,
      ...(currentPeriodEnd && { subscription_current_period_end: new Date(currentPeriodEnd * 1000).toISOString() }),
    })
    .eq('id', user.id);

  console.log(`Updated subscription for user ${user.id}: ${status}`);
}

async function handleSubscriptionCancelled(supabaseAdmin: SupabaseClient, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_id: null,
      subscription_price_id: null,
    })
    .eq('id', user.id);

  console.log(`Cancelled subscription for user ${user.id}`);
}
