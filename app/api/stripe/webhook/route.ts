import { NextRequest, NextResponse } from "next/server";
import { getStripe, type Stripe } from "@/lib/stripe";
import {
  getUserByStripeCustomer,
  getUserByReferralCode,
  getUserById,
  updateUser,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (error) {
    console.error(`Error handling ${event.type}:`, error);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const user = await getUserByStripeCustomer(customerId);
  if (!user) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await updateUser(user.id, {
    subscriptionId,
    subscriptionStatus: "active",
    subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
  });

  // Handle referral
  const referralCode = session.metadata?.referralCode;
  if (referralCode) {
    const referrer = await getUserByReferralCode(referralCode);
    if (referrer && referrer.id !== user.id) {
      // Credit the referrer
      await updateUser(referrer.id, {
        referralCredits: referrer.referralCredits + 1,
      });

      // Apply coupon to referrer's next invoice
      if (referrer.stripeCustomerId) {
        try {
          await stripe.customers.update(referrer.stripeCustomerId, {
            coupon: "referral-1-month-free",
          });
        } catch (err) {
          console.error("Failed to apply referral coupon:", err);
        }
      }

      // Mark the new user as referred
      await updateUser(user.id, { referredBy: referrer.id });
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByStripeCustomer(customerId);
  if (!user) return;

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    trialing: "trialing",
    incomplete: "none",
    incomplete_expired: "none",
    unpaid: "past_due",
    paused: "canceled",
  };

  await updateUser(user.id, {
    subscriptionStatus: statusMap[subscription.status] || "none",
    subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByStripeCustomer(customerId);
  if (!user) return;

  await updateUser(user.id, { subscriptionStatus: "canceled" });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const user = await getUserByStripeCustomer(customerId);
  if (!user) return;

  await updateUser(user.id, { subscriptionStatus: "past_due" });
}
