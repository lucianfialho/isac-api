"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PricingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const referralCode = searchParams.get("ref") || "";
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(referralCode ? { referralCode } : {}),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">&#127881;</div>
          <h1 className="text-2xl font-bold text-white">Welcome to ISAC!</h1>
          <p className="text-zinc-400">
            Your subscription is active. Head back to your terminal and start
            replicating pages.
          </p>
          <code className="block bg-zinc-900 rounded-lg p-4 text-green-400 text-sm">
            $ isac replicate https://example.com
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            ISAC
          </h1>
          <p className="text-zinc-400 text-lg">
            Intelligent Site Automated Cloner
          </p>
        </div>

        {canceled && (
          <p className="text-yellow-400 text-sm text-center">
            Checkout was canceled. You can try again anytime.
          </p>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-zinc-400 text-sm uppercase tracking-wider">
              Pro Plan
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-white">$29</span>
              <span className="text-zinc-500">/month</span>
            </div>
          </div>

          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">&#10003;</span>
              <span>Unlimited page replications</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">&#10003;</span>
              <span>Multi-phase AI pipeline (screenshot, tokens, animations, planning, implementation)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">&#10003;</span>
              <span>Visual verification with retry loop</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">&#10003;</span>
              <span>Design system extraction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">&#10003;</span>
              <span>Animation detection &amp; replication</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">&#10003;</span>
              <span>7-day offline grace period</span>
            </li>
          </ul>

          {referralCode && (
            <div className="bg-green-950 border border-green-800 rounded-lg p-3 text-center">
              <p className="text-green-400 text-sm">
                Referral applied — 20% off your first month!
              </p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? "Redirecting..." : "Subscribe"}
          </button>
        </div>

        <p className="text-zinc-600 text-xs text-center">
          Cancel anytime. Powered by Stripe.
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
