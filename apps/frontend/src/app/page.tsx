import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold font-mono tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Capitron
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 font-light max-w-2xl mx-auto">
              Master the art of trading in a risk-free environment.
              <span className="block mt-2 text-lg italic">
                Trade until you learn to trade.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-foreground text-background rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg min-w-[200px]">
                Get Started
              </button>
            </Link>
            <Link href="/market">
              <button className="px-8 py-4 border-2 border-foreground/20 text-foreground rounded-lg font-semibold text-lg hover:border-foreground/40 hover:bg-foreground/5 transition-all duration-200 min-w-[200px]">
                Explore Markets
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
            <div className="space-y-3 p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="text-3xl">📈</div>
              <h3 className="text-xl font-semibold">Real-Time Data</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Practice with live market data and realistic trading conditions.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="text-3xl">🎯</div>
              <h3 className="text-xl font-semibold">Risk-Free Trading</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Learn and experiment without risking real capital.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="text-3xl">💡</div>
              <h3 className="text-xl font-semibold">Advanced Tools</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Access professional trading tools and analytics.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-foreground/50 text-sm border-t border-foreground/10">
        <p>
          © {new Date().getFullYear()} Capitron. Practice trading platform.
        </p>
      </footer>
    </div>
  );
}
