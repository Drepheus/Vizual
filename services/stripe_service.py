import stripe
import os
from flask import current_app

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

def create_payment_intent(plan_type='premium', user_id=None):
    try:
        # Set amount based on plan type
        if plan_type == 'pro':
            amount = 2000  # $20.00
        elif plan_type == 'premium':
            amount = 4000  # $40.00
        else:
            amount = 2000  # Default to pro if unspecified
            
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            payment_method_types=['card'],
            metadata={
                'product': f'{plan_type}_subscription',
                'user_id': str(user_id) if user_id else None
            }
        )
        return intent
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")

def handle_webhook(payload, sig_header):
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET')
        )
        
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            handle_successful_payment(payment_intent)
            
    except Exception as e:
        raise Exception(f"Webhook error: {str(e)}")

def handle_successful_payment(payment_intent):
    from models import User, Payment
    from app import db
    
    user_id = payment_intent.metadata.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            # Set the subscription type based on the product metadata
            subscription_type = payment_intent.metadata.get('product', 'premium_subscription')
            if 'pro' in subscription_type:
                user.subscription_type = 'pro'
            elif 'premium' in subscription_type:
                user.subscription_type = 'premium'
            
            # All paid plans are premium in terms of feature access
            user.is_premium = True
            
            # Reset query limits
            user.query_count = 0
            
            payment = Payment(
                user_id=user_id,
                stripe_payment_id=payment_intent.id,
                amount=payment_intent.amount,
                status='succeeded'
            )
            db.session.add(payment)
            db.session.commit()
