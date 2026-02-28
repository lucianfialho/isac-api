"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Suspense } from "react";

function ActivateContent() {
  const searchParams = useSearchParams();
  const session = authClient.useSession();
  const codeFromUrl = searchParams.get("code") || "";

  const [userCode, setUserCode] = useState(codeFromUrl);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isSignedIn = !!session?.data?.user;

  const handleComplete = async () => {
    if (!userCode.trim()) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/device/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode: userCode.trim().toUpperCase() }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(data.error || "Invalid or expired code.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl text-green-400">&#10003;</div>
          <h1 className="text-2xl font-bold text-white">You&apos;re in!</h1>
          <p className="text-zinc-400">
            Authentication successful. You can close this tab and return to your terminal.
          </p>
        </div>
      </div>
    );
  }

  // Not signed in — redirect to sign-in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">ISAC</h1>
            <p className="text-zinc-400">Sign in to activate the ISAC CLI.</p>
          </div>

          {userCode && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-zinc-400 text-sm mb-2">Your activation code:</p>
              <p className="text-3xl font-mono tracking-[0.3em] text-white">{userCode}</p>
            </div>
          )}

          <a
            href={`/api/auth/sign-in/social?provider=github&callbackURL=/activate${userCode ? `?code=${userCode}` : ""}`}
            className="block w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-center"
          >
            Sign in with GitHub
          </a>

          <p className="text-zinc-600 text-xs text-center">
            By continuing, you agree to ISAC&apos;s Terms of Service.
          </p>
        </div>
      </div>
    );
  }

  // Signed in — enter code or auto-complete
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">ISAC</h1>
          <p className="text-zinc-400">
            Enter the code shown in your terminal.
          </p>
        </div>

        <input
          type="text"
          value={userCode}
          onChange={(e) => setUserCode(e.target.value.toUpperCase())}
          placeholder="ABCD-1234"
          maxLength={9}
          className="w-full text-center text-3xl font-mono tracking-[0.3em] bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => e.key === "Enter" && handleComplete()}
          autoFocus
        />

        <button
          onClick={handleComplete}
          disabled={status === "loading" || userCode.length < 8}
          className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? "Activating..." : "Activate CLI"}
        </button>

        {status === "error" && (
          <p className="text-red-400 text-sm text-center">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
