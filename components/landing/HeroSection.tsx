import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Subtle teal glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Sigil watermark */}
          <div className="absolute top-0 right-0 text-[200px] font-bold text-primary/5 select-none pointer-events-none">
            ∀i
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
            <span className="text-gradient">Build Your BLM.</span>
            <br />
            <span className="text-foreground">
              Your Business Language Model.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Native ∀i helps you build and own your own AI co-founder — trained on how your business works.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button variant="primary" size="large" className="text-lg px-8 py-6">
              Build My BLM
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="large" className="text-lg px-8 py-6 border-border hover:bg-card hover:text-foreground">
              View Demo
            </Button>
          </div>

          {/* Trust line */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              Free 14-day trial • No credit card • Setup in under 5 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
