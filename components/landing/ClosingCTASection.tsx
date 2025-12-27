import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const ClosingCTASection = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-10">
          {/* Sigil */}
          <div className="text-8xl font-bold text-gradient">∀i</div>

          {/* Big statement */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Every great business deserves{" "}
            <span className="text-gradient">its own brain.</span>
          </h2>

          {/* Sub */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Build your BLM ∀i. Own your intelligence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button variant="primary" size="large" className="text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="large" className="text-lg px-8 py-6 border-border hover:bg-card hover:text-foreground">
              <Calendar className="mr-2 w-5 h-5" />
              Schedule Demo
            </Button>
          </div>

          {/* Trust line */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              Free 14-day trial • No credit card • 5-minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosingCTASection;
