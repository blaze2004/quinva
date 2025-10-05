import ShaderBackground from "@/components/shader-background";
import Link from "next/link";

export default function Home() {
  return (
    <ShaderBackground>
      <div className="flex items-center justify-center min-h-screen p-6 relative z-20">
        <main className="max-w-2xl">
          <div className="text-left">
            <h1 className="text-6xl md:text-7xl md:leading-tight tracking-tight font-light text-white mb-6">
              Track <span className="font-medium italic instrument">Goals</span>{" "}
              <span className="font-light tracking-tight text-white">
                Simply
              </span>
            </h1>
            <p className="text-lg md:text-xl font-light text-white/70 mb-6 leading-relaxed">
              Quinva helps you track your personal expenses and financial goals.
              Set targets, monitor spending, and achieve your financial dreams
              with a clear, beautiful interface.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                className="px-8 py-4 rounded-full bg-transparent border border-white/30 text-white font-normal text-sm md:text-base transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
              >
                How It Works
              </button>
              <Link href="/login">
                <button
                  type="button"
                  className="px-8 py-4 rounded-full bg-white text-black font-normal text-sm md:text-base transition-all duration-200 hover:bg-white/90 cursor-pointer"
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
}
