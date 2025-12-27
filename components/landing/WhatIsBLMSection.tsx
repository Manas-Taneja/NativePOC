import { MessageSquare, Workflow, Plug, TrendingUp } from "lucide-react";

const features = [
  { icon: MessageSquare, text: "Learns from your conversations" },
  { icon: Workflow, text: "Understands your workflows" },
  { icon: Plug, text: "Connects to your tools" },
  { icon: TrendingUp, text: "Improves every day" },
];

const WhatIsBLMSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Copy */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Every business has a language.{" "}
              <span className="text-gradient">Native turns yours into intelligence.</span>
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>How your team talks.</p>
              <p>How decisions get made.</p>
              <p>How work actually gets done.</p>
              <p className="text-foreground font-medium pt-2">
                Native captures it all and builds your Business Language Model — a living AI brain for your company.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg glass hover:bg-card/60 transition-colors"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Callout */}
          <div className="relative">
            <div className="glass-strong rounded-3xl p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-primary text-lg font-bold">∀i</span>
                <span className="text-sm font-medium text-primary">Key Difference</span>
              </div>
              
              <p className="text-2xl md:text-3xl font-semibold leading-snug">
                Not a generic chatbot.{" "}
                <span className="text-gradient">A focused AI built only for your business.</span>
              </p>
              
              <div className="w-16 h-1 bg-gradient-primary rounded-full" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute -bottom-8 -right-8 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsBLMSection;
