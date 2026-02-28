import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">ISAC</h1>
        <p className="text-zinc-400 text-lg">
          Intelligent Site Automated Cloner
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/activate"
            className="px-6 py-3 border border-zinc-700 text-white font-semibold rounded-lg hover:border-zinc-500 transition-colors"
          >
            Activate CLI
          </Link>
        </div>
      </div>
    </div>
  );
}
