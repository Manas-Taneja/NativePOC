import { Lock, DollarSign, Zap, Users } from "lucide-react";

const features = [
  { icon: Lock, text: "Your data stays private" },
  { icon: DollarSign, text: "Priced for SMBs" },
  { icon: Zap, text: "Setup in minutes" },
  { icon: Users, text: "No AI team needed" },
];

const BuiltForSMBSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Built for businesses{" "}
              <span className="text-gradient">like yours.</span>
            </h2>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-2xl p-6 space-y-4 hover:shadow-glow-soft transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="font-semibold">{feature.text}</p>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="pt-8">
            <div className="glass-strong rounded-2xl p-8 inline-block">
              <p className="text-lg md:text-xl">
                If you can run WhatsApp, you can run{" "}
                <span className="text-gradient font-bold">Native ∀i</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForSMBSection;
