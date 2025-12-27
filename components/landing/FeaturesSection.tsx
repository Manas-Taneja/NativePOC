import { Settings, Navigation, Lightbulb, Brain, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Settings,
    title: "Automate the repetitive",
    description: "Let AI handle routine tasks so your team can focus on what matters.",
  },
  {
    icon: Navigation,
    title: "Orchestrate operations",
    description: "Seamless coordination across teams and workflows.",
  },
  {
    icon: Lightbulb,
    title: "Nudge strategy",
    description: "Proactive insights that keep you ahead of decisions.",
  },
  {
    icon: Brain,
    title: "Remember everything",
    description: "Institutional memory that never forgets context.",
  },
  {
    icon: TrendingUp,
    title: "Learn & improve daily",
    description: "Your BLM gets smarter with every interaction.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <p className="text-primary font-semibold tracking-widest uppercase text-sm">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              What Your <span className="text-gradient">BLM</span> Does
            </h2>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-2xl p-6 space-y-4 hover:shadow-glow-soft transition-all duration-300 group text-center"
              >
                <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto group-hover:bg-primary/20 transition-colors group-hover:animate-pulse-glow">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Closing line */}
          <div className="pt-8">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prompts become tasks. Tasks become systems.{" "}
              <span className="text-gradient font-semibold">Systems become intelligence.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
