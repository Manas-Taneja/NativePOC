import { Shield, Fingerprint, TrendingUp } from "lucide-react";

const statements = [
  { icon: Shield, text: "Your AI. Your data. Your edge." },
  { icon: Fingerprint, text: "A model no one else can copy." },
  { icon: TrendingUp, text: "An asset that compounds over time." },
];

const OwnershipSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Don't just use AI.{" "}
              <span className="text-gradient">Own it.</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Everyone is becoming AI-friendly. The leaders will be AI-owned.
            </p>
          </div>

          {/* Statements */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {statements.map((statement, index) => (
              <div 
                key={index}
                className="glass rounded-2xl p-8 space-y-4 hover:shadow-glow-soft transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                  <statement.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-semibold">{statement.text}</p>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div className="pt-8">
            <div className="inline-flex flex-col items-center gap-4 glass-strong rounded-2xl p-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gradient">∀i</span>
                <span className="text-lg font-semibold">Powered by Native ∀i</span>
              </div>
              <p className="text-muted-foreground italic">"We run on our own AI."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnershipSection;
