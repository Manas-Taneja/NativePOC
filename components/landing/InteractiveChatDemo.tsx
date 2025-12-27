"use client";

import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Check, Zap, Brain, MessageSquare, ListTodo, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

type Scenario = "sales" | "operations" | "support" | "marketing";

interface Message {
  id: string;
  sender: string;
  role: string;
  content: string;
  isNative?: boolean;
  isNudge?: boolean;
  avatar: string;
}

interface Task {
  id: string;
  title: string;
  owner: string;
  due: string;
  autoCreated?: boolean;
}

interface Insight {
  id: string;
  content: string;
}

const scenarios: Record<Scenario, { messages: Message[]; tasks: Task[]; insights: Insight[] }> = {
  sales: {
    messages: [
      { id: "1", sender: "Aisha", role: "Sales", content: "Had 5 new leads come in today. One hot from Mumbai — Priya.", avatar: "A" },
      { id: "2", sender: "Rahul", role: "Operations", content: "I can help tomorrow if needed.", avatar: "R" },
      { id: "3", sender: "Native ∀i", role: "BLM", content: "I've logged all 5 leads and analyzed past patterns. Priya looks warm — similar leads converted last week.", isNative: true, avatar: "∀" },
      { id: "4", sender: "Maya", role: "Support", content: "We also got two questions about pricing today.", avatar: "M" },
      { id: "5", sender: "Native ∀i", role: "BLM", content: "Noted. I'll summarize and create follow-ups.", isNative: true, avatar: "∀" },
      { id: "6", sender: "Native ∀i", role: "BLM", content: "It's been 2 hours since Priya came in. I've nudged Aisha and set a reminder.", isNative: true, isNudge: true, avatar: "∀" },
    ],
    tasks: [
      { id: "t1", title: "Follow up with Priya", owner: "Aisha", due: "Today", autoCreated: true },
      { id: "t2", title: "Respond to pricing query", owner: "Maya", due: "Today", autoCreated: true },
      { id: "t3", title: "Update FAQ if needed", owner: "Maya", due: "Tomorrow", autoCreated: true },
    ],
    insights: [
      { id: "i1", content: "Leads contacted within 2 hours convert 28% better. Recommend auto-reminders." },
    ],
  },
  operations: {
    messages: [
      { id: "1", sender: "Rahul", role: "Operations", content: "Shipment for Delhi is delayed — vendor issue.", avatar: "R" },
      { id: "2", sender: "Aisha", role: "Sales", content: "The Delhi client is asking for an update.", avatar: "A" },
      { id: "3", sender: "Native ∀i", role: "BLM", content: "Your BLM noticed the delay pattern. I've drafted an update for the client and flagged vendor for review.", isNative: true, avatar: "∀" },
      { id: "4", sender: "Maya", role: "Support", content: "Should we offer any compensation?", avatar: "M" },
      { id: "5", sender: "Native ∀i", role: "BLM", content: "Based on how your team works, similar delays got a 10% discount. I've prepared the offer.", isNative: true, avatar: "∀" },
    ],
    tasks: [
      { id: "t1", title: "Send delay update to Delhi client", owner: "Aisha", due: "Today", autoCreated: true },
      { id: "t2", title: "Review vendor performance", owner: "Rahul", due: "This week", autoCreated: true },
      { id: "t3", title: "Prepare 10% compensation offer", owner: "Maya", due: "Today", autoCreated: true },
    ],
    insights: [
      { id: "i1", content: "This vendor has caused 3 delays this month. Consider backup supplier." },
    ],
  },
  support: {
    messages: [
      { id: "1", sender: "Maya", role: "Support", content: "Got a complaint about late delivery — customer is upset.", avatar: "M" },
      { id: "2", sender: "Native ∀i", role: "BLM", content: "Your BLM pulled the order history. This customer has been loyal for 2 years. Priority handling recommended.", isNative: true, avatar: "∀" },
      { id: "3", sender: "Rahul", role: "Operations", content: "I'll expedite the reshipment.", avatar: "R" },
      { id: "4", sender: "Native ∀i", role: "BLM", content: "Your BLM created a task and drafted an apology email with a loyalty discount code.", isNative: true, avatar: "∀" },
      { id: "5", sender: "Native ∀i", role: "BLM", content: "The customer hasn't received a response yet. Sending reminder to Maya.", isNative: true, isNudge: true, avatar: "∀" },
    ],
    tasks: [
      { id: "t1", title: "Send apology with discount", owner: "Maya", due: "ASAP", autoCreated: true },
      { id: "t2", title: "Expedite reshipment", owner: "Rahul", due: "Today", autoCreated: true },
    ],
    insights: [
      { id: "i1", content: "Loyal customers who receive quick resolution have 95% retention rate." },
    ],
  },
  marketing: {
    messages: [
      { id: "1", sender: "Aisha", role: "Sales", content: "We should post about the new product launch.", avatar: "A" },
      { id: "2", sender: "Maya", role: "Support", content: "Customers have been asking about it!", avatar: "M" },
      { id: "3", sender: "Native ∀i", role: "BLM", content: "Your BLM analyzed past posts. Tuesday 10 AM gets 40% more engagement. I've drafted 3 post options.", isNative: true, avatar: "∀" },
      { id: "4", sender: "Rahul", role: "Operations", content: "Make sure we have enough stock first.", avatar: "R" },
      { id: "5", sender: "Native ∀i", role: "BLM", content: "Stock verified — 500 units ready. Scheduling post and creating launch checklist.", isNative: true, avatar: "∀" },
    ],
    tasks: [
      { id: "t1", title: "Review & approve post drafts", owner: "Aisha", due: "Monday", autoCreated: true },
      { id: "t2", title: "Schedule Tuesday launch post", owner: "Marketing", due: "Tuesday 10 AM", autoCreated: true },
      { id: "t3", title: "Prepare stock for launch orders", owner: "Rahul", due: "Monday", autoCreated: true },
    ],
    insights: [
      { id: "i1", content: "Tuesday 10 AM posts get 40% more engagement than other times." },
    ],
  },
};

const promptChips = [
  "Summarize today's leads",
  "What's blocking deliveries?",
  "Any customer issues?",
  "What should we post this week?",
];

const InteractiveChatDemo = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>("sales");
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const [visibleInsights, setVisibleInsights] = useState<Insight[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "insights">("tasks");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const reset = () => {
    clearTimeouts();
    setVisibleMessages([]);
    setVisibleTasks([]);
    setVisibleInsights([]);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const playDemo = () => {
    reset();
    setIsPlaying(true);
    const scenario = scenarios[activeScenario];

    scenario.messages.forEach((msg, idx) => {
      const timeout = setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);

        // Auto-scroll chat
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }

        // Add tasks after Native messages
        if (msg.isNative && idx <= 2) {
          const taskTimeout = setTimeout(() => {
            setVisibleTasks(prev => [...prev, scenario.tasks[prev.length] || scenario.tasks[0]]);
          }, 400);
          timeoutRefs.current.push(taskTimeout);
        }

        if (idx === scenario.messages.length - 1) {
          // Add remaining tasks and insights
          const finalTimeout = setTimeout(() => {
            setVisibleTasks(scenario.tasks);
            setVisibleInsights(scenario.insights);
            setIsComplete(true);
            setIsPlaying(false);
          }, 600);
          timeoutRefs.current.push(finalTimeout);
        }
      }, idx * 1000);
      timeoutRefs.current.push(timeout);
    });
  };

  const handleScenarioChange = (scenario: Scenario) => {
    reset();
    setActiveScenario(scenario);
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Watch Your Team + <span className="text-primary">∀i</span> in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how conversations between team members become tasks and insights through your BLM.
          </p>
        </div>

        {/* Scenario tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(["sales", "operations", "support", "marketing"] as Scenario[]).map((scenario) => (
            <button
              key={scenario}
              onClick={() => handleScenarioChange(scenario)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeScenario === scenario
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "glass text-muted-foreground hover:text-foreground hover:bg-card/80"
                }`}
            >
              {scenario === "sales" && "Sales Follow-up"}
              {scenario === "operations" && "Operations"}
              {scenario === "support" && "Customer Support"}
              {scenario === "marketing" && "Marketing"}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-8">
          <Button
            onClick={playDemo}
            disabled={isPlaying}
            className="gap-2"
            variant="primary"
          >
            <Play className="w-4 h-4" />
            Play Demo
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Main demo container */}
        <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
          {/* Left panel - Chat */}
          <div className="lg:col-span-3 glass-strong rounded-2xl overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Team Chat — Native <span className="text-primary">∀i</span>
                </h3>
                <p className="text-sm text-muted-foreground">Your AI teammate is live</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">BLM Live</span>
              </div>
            </div>

            {/* Chat messages */}
            <div
              ref={chatContainerRef}
              className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            >
              {visibleMessages.length === 0 && !isPlaying && (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Click "Play Demo" to start
                </div>
              )}

              {visibleMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 animate-fade-in ${msg.isNative ? "pr-4" : "pr-8"}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${msg.isNative
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/20"
                    : "bg-muted text-foreground"
                    }`}>
                    {msg.avatar}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${msg.isNative ? "text-primary" : "text-foreground"}`}>
                        {msg.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.role}</span>
                      {msg.isNudge && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          Nudge
                        </span>
                      )}
                    </div>
                    <div className={`inline-block p-3 rounded-2xl text-sm leading-relaxed ${msg.isNative
                      ? "bg-primary/10 border border-primary/20 text-foreground shadow-lg shadow-primary/5"
                      : "bg-muted/50 text-foreground"
                      } ${msg.isNudge ? "glow-soft" : ""}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex flex-wrap gap-2 mb-3">
                {promptChips.map((chip) => (
                  <button
                    key={chip}
                    className="px-3 py-1.5 rounded-full text-xs bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
                    disabled
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  disabled
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Right panel - Tasks & Insights */}
          <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
            {/* Mobile tabs */}
            <div className="flex lg:hidden gap-2">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "tasks" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                  }`}
              >
                <ListTodo className="w-4 h-4 inline mr-2" />
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "insights" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                  }`}
              >
                <Lightbulb className="w-4 h-4 inline mr-2" />
                Insights
              </button>
            </div>

            {/* Tasks panel */}
            <div className={`glass-strong rounded-2xl p-4 flex-1 ${activeTab !== "tasks" ? "hidden lg:block" : ""}`}>
              <div className="flex items-center gap-2 mb-4">
                <ListTodo className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Tasks Extracted</h3>
              </div>

              <div className="space-y-3">
                {visibleTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tasks will appear here...
                  </p>
                )}

                {visibleTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="w-5 h-5 rounded-md border-2 border-primary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {isComplete && <Check className="w-3 h-3 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{task.owner}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-primary">{task.due}</span>
                      </div>
                      {task.autoCreated && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          <Brain className="w-3 h-3" />
                          Created by Native ∀i
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights panel */}
            <div className={`glass-strong rounded-2xl p-4 ${activeTab !== "insights" ? "hidden lg:block" : ""}`}>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">BLM Insight</h3>
              </div>

              <div className="space-y-3">
                {visibleInsights.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Insights will appear here...
                  </p>
                )}

                {visibleInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in glow-soft"
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* BLM Ready state */}
            {isComplete && (
              <div className="glass-strong rounded-2xl p-6 text-center animate-fade-in glow-teal">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-medium mb-4">
                  <Brain className="w-5 h-5" />
                  BLM READY
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Your Business Language Model is learning and ready to help.
                </p>
                <Button className="w-full">
                  Build My BLM
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveChatDemo;
