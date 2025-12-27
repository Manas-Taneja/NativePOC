import { MessageCircle, Brain, Bell, Lightbulb, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    number: "01",
    title: "Chat Naturally",
    description: "Your team talks in Native's group chat.",
  },
  {
    icon: Brain,
    number: "02",
    title: "BLM Analyzes",
    description: "AI learns context, tasks, and patterns.",
  },
  {
    icon: Bell,
    number: "03",
    title: "Tasks & Nudges",
    description: "Work is auto-assigned with smart nudges.",
  },
  {
    icon: Lightbulb,
    number: "04",
    title: "Intelligence Delivered",
    description: "Insights improve execution every day.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-card/30">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,196,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,196,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <p className="text-primary font-semibold tracking-widest uppercase text-sm">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              From Chat to <span className="text-gradient">Intelligence</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Arrow connector (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 -right-3 z-10">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
                
                <div className="glass rounded-2xl p-6 h-full space-y-4 hover:shadow-glow-soft transition-all duration-300">
                  {/* Number */}
                  <div className="text-primary/30 text-5xl font-bold">{step.number}</div>
                  
                  {/* Icon */}
                  <div className="p-3 rounded-xl bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer line */}
          <p className="text-lg text-muted-foreground">
            Every step makes your BLM <span className="text-primary font-semibold">smarter</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
