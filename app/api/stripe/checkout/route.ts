import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAuthUser, ensureDbUser, unauthorized } from "@/lib/auth";
import { updateUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) return unauthorized();

  try {
    const stripe = getStripe();
    const user = await ensureDbUser(authUser);

    const body = await request.json().catch(() => ({}));
    const referralCode = body.referralCode as string | undefined;

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await updateUser(user.id, { stripeCustomerId: customerId });
    }

    const sessionParams: Record<string, unknown> = {
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {} as Record<string, string>,
    };

    if (referralCode) {
      (sessionParams.metadata as Record<string, string>).referralCode = referralCode;
      sessionParams.discounts = [{ coupon: "referral-20-off-first" }];
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
