import { Coins } from "lucide-react";

export function MoneyLoader() {
  return (
    <div className="flex min-h-[70vh] w-full flex-1 flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center scale-125 transform">
        {/* Animated Coins */}
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 flex items-center justify-center animate-bounce delay-75">
            <Coins className="h-24 w-24 text-primary drop-shadow-[0_0_25px_rgba(124,58,237,0.6)]" />
          </div>

          {/* Floating money particles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="text-green-500 font-bold animate-float-up"
                style={{
                  animationDelay: `${i * 0.4}s`,
                  fontSize: `${Math.random() * 10 + 20}px`, // Larger particles
                  marginLeft: `${(Math.random() - 0.5) * 60}px`, // Wider spread
                }}
              >
                $
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-foreground animate-pulse">
            Loading your finances...
          </h3>
          <p className="text-base text-muted-foreground">
            Counting every expenses
          </p>
        </div>
      </div>
    </div>
  );
}
