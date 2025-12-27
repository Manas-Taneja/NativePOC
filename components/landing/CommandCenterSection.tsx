import { TrendingUp, CheckCircle, Lightbulb, Users } from "lucide-react";

const metrics = [
  { icon: TrendingUp, label: "Productivity", value: "+42%", trend: "vs last month" },
  { icon: CheckCircle, label: "Tasks Completed", value: "1,247", trend: "this week" },
  { icon: Lightbulb, label: "Insights Generated", value: "89", trend: "actionable" },
  { icon: Users, label: "Team Active", value: "12/12", trend: "online now" },
];

const CommandCenterSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-card/30">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Dashboard mock */}
          <div className="relative">
            <div className="glass-strong rounded-3xl p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gradient">∀i</span>
                  <span className="text-lg font-semibold">Command Center</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/50" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                </div>
              </div>
              
              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="bg-background/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <metric.icon className="w-5 h-5 text-primary" />
                      <span className="text-xs text-muted-foreground">{metric.trend}</span>
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Activity bar */}
              <div className="bg-background/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Activity</span>
                  <span className="text-xs text-primary">+18%</span>
                </div>
                <div className="flex gap-1 h-12">
                  {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t flex flex-col justify-end">
                      <div 
                        className="bg-gradient-primary rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -bottom-8 -left-8 w-[200px] h-[200px] bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right - Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-primary font-semibold tracking-widest uppercase text-sm">Dashboard</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                One place to see{" "}
                <span className="text-gradient">your business.</span>
              </h2>
            </div>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your BLM creates this automatically. No setup. No dashboards to build.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="glass px-4 py-2 rounded-full text-sm">
                <span className="text-primary">✓</span> Real-time updates
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm">
                <span className="text-primary">✓</span> Auto-generated insights
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm">
                <span className="text-primary">✓</span> Team visibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommandCenterSection;
