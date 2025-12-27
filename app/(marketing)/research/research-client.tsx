"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Brain, Layers, Zap, Eye, Heart, Clock, Users, BookOpen, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavigationSection from "@/components/landing/NavigationSection";

const researchAreas = [
    {
        icon: Brain,
        title: "Business Language Models (BLMs)",
        description: "Models overfit to how your team communicates and decides.",
        detail: "We're building specialized language models that learn the unique vocabulary, decision patterns, and communication styles of individual businesses. Unlike generic LLMs, BLMs understand your context deeply."
    },
    {
        icon: Layers,
        title: "Small Language Models (SLMs)",
        description: "Lean models under ~10B parameters for real-time, private, on-device intelligence.",
        detail: "We believe the future isn't bigger models — it's smarter, smaller ones. Our SLMs deliver enterprise-grade intelligence at SMB-friendly costs with complete data privacy."
    },
    {
        icon: MessageSquare,
        title: "Chat-Native Learning",
        description: "How group chats become continuous training signals.",
        detail: "Every message, every decision, every correction becomes training data. We're pioneering techniques to extract structured intelligence from unstructured conversations."
    },
    {
        icon: Sparkles,
        title: "Living UX Systems",
        description: "Interfaces that reorganize themselves as your business evolves.",
        detail: "Static dashboards are dead. We're building interfaces that breathe, adapt, and evolve based on how your business changes over time."
    },
    {
        icon: Zap,
        title: "Agentic SMB Workflows",
        description: "How AI can nudge, orchestrate, and automate ops for small teams.",
        detail: "We study how AI can move from reactive chatbot to proactive teammate — anticipating needs, coordinating work, and driving execution."
    },
    {
        icon: Heart,
        title: "Emotional & Visual AI",
        description: "Studying how design, feeling, and intuition shape trust in AI.",
        detail: "AI adoption isn't just about capability — it's about trust. We research the emotional and visual factors that make AI feel safe and valuable."
    }
];

const researchPosts = [
    {
        title: "AI of UX: Designing Interfaces That Think",
        excerpt: "Why the future of UX isn't static dashboards — it's living systems.",
        tags: ["UX", "Design", "Intelligence"],
        readTime: "4 min"
    },
    {
        title: "Why Small Models Will Win in SMBs",
        excerpt: "The economics and privacy advantages of lean language models.",
        tags: ["SLMs", "SMBs", "Privacy"],
        readTime: "3 min"
    },
    {
        title: "Chat as the New Data Flywheel",
        excerpt: "How conversations become the richest source of business intelligence.",
        tags: ["Chat", "Data", "Learning"],
        readTime: "5 min"
    },
    {
        title: "From Prompts to Systems to Intelligence",
        excerpt: "The evolution from manual AI use to autonomous business brains.",
        tags: ["Agents", "Automation", "BLMs"],
        readTime: "4 min"
    },
    {
        title: "BLMs: Teaching AI to Think Like Your Team",
        excerpt: "How we train models on decision patterns, not just words.",
        tags: ["BLMs", "Training", "Teams"],
        readTime: "6 min"
    }
];

const ResearchClient = () => {
    const [expandedArea, setExpandedArea] = useState<number | null>(null);
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <NavigationSection />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20">
                        {/* Neural network pattern */}
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            <defs>
                                <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(168 100% 45% / 0.3)" />
                                    <stop offset="100%" stopColor="hsl(168 100% 45% / 0.05)" />
                                </linearGradient>
                            </defs>
                            {[...Array(8)].map((_, i) => (
                                <circle
                                    key={i}
                                    cx={200 + Math.cos(i * 0.785) * 120}
                                    cy={200 + Math.sin(i * 0.785) * 120}
                                    r="8"
                                    fill="url(#neural-gradient)"
                                    className="animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                            {[...Array(8)].map((_, i) => (
                                <line
                                    key={`line-${i}`}
                                    x1={200 + Math.cos(i * 0.785) * 120}
                                    y1={200 + Math.sin(i * 0.785) * 120}
                                    x2={200 + Math.cos((i + 1) * 0.785) * 120}
                                    y2={200 + Math.sin((i + 1) * 0.785) * 120}
                                    stroke="url(#neural-gradient)"
                                    strokeWidth="1"
                                />
                            ))}
                            <circle cx="200" cy="200" r="12" fill="hsl(168 100% 45% / 0.4)" className="animate-pulse" />
                        </svg>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                        <span className="text-primary text-lg">∀i</span>
                        <span className="text-muted-foreground text-sm">Native Research Lab</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-5xl mx-auto leading-tight">
                        Researching the future of how{" "}
                        <span className="text-gradient">businesses think.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                        Native is a research-first AI lab building Small Language Models and living interfaces
                        that learn directly from how teams talk, decide, and work.
                    </p>

                    <p className="text-sm text-muted-foreground/80 mb-10">
                        From chat to cognition. From UX to intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="primary" size="large" className="group">
                            Explore Our Research
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button variant="outline" size="large">
                            Read the Latest Essay
                        </Button>
                    </div>
                </div>
            </section>

            {/* Research Thesis */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Why <span className="text-gradient">Native</span> Exists
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto mb-16">
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-center">
                            We believe every business has a language.{" "}
                            <span className="text-foreground">Not just words</span> — but patterns, habits,
                            instincts, workflows, and decisions.
                        </p>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-center mt-6">
                            Native exists to study that language at scale.{" "}
                            <span className="text-foreground">To extract intelligence</span> from everyday conversations.{" "}
                            And to turn it into <span className="text-primary">Small Language Models</span> that think like your business.
                        </p>
                    </div>

                    {/* Three Pillars */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                icon: MessageSquare,
                                title: "Chat is the Dataset",
                                description: "Conversations are the richest source of real business behavior."
                            },
                            {
                                icon: Layers,
                                title: "SLMs over LLMs",
                                description: "Smaller, sharper models trained on your reality — faster, cheaper, private."
                            },
                            {
                                icon: Eye,
                                title: "UX is Intelligence",
                                description: "Interfaces should think, feel, and adapt with you."
                            }
                        ].map((pillar, index) => (
                            <div
                                key={index}
                                className="glass p-8 rounded-2xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <pillar.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
                                <p className="text-muted-foreground">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Research Areas Grid */}
            <section className="py-24 relative bg-card/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            What We're <span className="text-gradient">Researching</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Click to explore our active research areas
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {researchAreas.map((area, index) => (
                            <div
                                key={index}
                                onClick={() => setExpandedArea(expandedArea === index ? null : index)}
                                className={`glass p-6 rounded-2xl cursor-pointer transition-all duration-300 ${expandedArea === index
                                    ? "border-primary/50 glow-soft"
                                    : "hover:border-primary/30"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <area.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-2">{area.title}</h3>
                                        <p className="text-sm text-muted-foreground">{area.description}</p>
                                        {expandedArea === index && (
                                            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                                                <p className="text-sm text-foreground/90">{area.detail}</p>
                                                <Button variant="ghost" className="mt-2 p-0 h-auto text-primary hover:bg-transparent">
                                                    Read more <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Essay */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-10">
                    {/* Tetris-like blocks */}
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                        {[
                            { x: 50, y: 50, w: 60, h: 60 },
                            { x: 120, y: 50, w: 60, h: 120 },
                            { x: 190, y: 110, w: 120, h: 60 },
                            { x: 50, y: 120, w: 60, h: 60 },
                            { x: 50, y: 190, w: 120, h: 60 },
                            { x: 180, y: 180, w: 60, h: 120 },
                            { x: 250, y: 50, w: 60, h: 60 },
                            { x: 250, y: 240, w: 60, h: 60 },
                            { x: 50, y: 260, w: 60, h: 60 },
                            { x: 120, y: 260, w: 60, h: 60 },
                        ].map((block, i) => (
                            <rect
                                key={i}
                                x={block.x}
                                y={block.y}
                                width={block.w}
                                height={block.h}
                                rx="8"
                                fill="hsl(168 100% 45%)"
                                className="animate-pulse"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <BookOpen className="w-4 h-4" />
                            <span>Featured Essay</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Native is building the <span className="text-gradient">AI of UX</span>
                        </h2>

                        <p className="text-muted-foreground mb-4">
                            By Jasminder Singh Gulati & Nalin Jayaswal · 2 min read · Dec 25, 2024
                        </p>

                        <blockquote className="glass p-8 rounded-2xl my-8 border-l-4 border-primary italic text-lg md:text-xl text-foreground/90 leading-relaxed">
                            "UX should be alive. Native's dashboard moves. It breathes with your business.
                            Each conversation becomes a block — a living unit that reshapes itself as your business evolves."
                        </blockquote>

                        <Button variant="primary" className="group">
                            Read Essay
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Research Feed */}
            <section className="py-24 bg-card/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            From the <span className="text-gradient">Lab</span>
                        </h2>
                        <p className="text-muted-foreground">Research posts, essays, and notes from our team</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {researchPosts.map((post, index) => (
                            <div
                                key={index}
                                className="glass p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-3">{post.excerpt}</p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {post.tags.map((tag, tagIndex) => (
                                                <span
                                                    key={tagIndex}
                                                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button variant="outline">
                            View All Research
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Methodology */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            How We <span className="text-gradient">Research</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "01",
                                title: "Observe Conversations",
                                description: "We study how real teams talk and work inside Native."
                            },
                            {
                                step: "02",
                                title: "Extract Patterns",
                                description: "We model workflows, decisions, and habits from chat."
                            },
                            {
                                step: "03",
                                title: "Train & Iterate",
                                description: "We build SLMs that learn continuously from that behavior."
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center relative">
                                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-lg text-muted-foreground">
                            Every message is data. Every decision is signal.{" "}
                            <span className="text-foreground">Research happens in production.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Living Lab */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">
                            Native isn't just a product.
                            <br />
                            <span className="text-gradient">It's a live research environment.</span>
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                            Every team using Native contributes to the collective understanding of how businesses think.
                            We don't study behavior in isolation.
                        </p>

                        <p className="text-lg md:text-xl text-foreground leading-relaxed">
                            We learn from it — <span className="text-primary">in real time</span>.
                            And we turn that learning into better models, better UX, and better intelligence.
                        </p>

                        {/* Animated loop visualization */}
                        <div className="mt-16 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <span className="px-4 py-2 rounded-full glass">Chat</span>
                            <ArrowRight className="w-4 h-4 text-primary" />
                            <span className="px-4 py-2 rounded-full glass">Model</span>
                            <ArrowRight className="w-4 h-4 text-primary" />
                            <span className="px-4 py-2 rounded-full glass">Interface</span>
                            <ArrowRight className="w-4 h-4 text-primary" />
                            <span className="px-4 py-2 rounded-full glass text-primary">∀i</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Research */}
            <section className="py-24 bg-card/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Building in the <span className="text-gradient">Open</span>
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
                            {[
                                "Publish essays & technical notes",
                                "Share learnings from production",
                                "Collaborate with founders & researchers",
                                "Turn real SMB behavior into insight"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-left p-4 glass rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    <span className="text-sm">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="primary" className="group">
                                <Users className="w-4 h-4" />
                                Join the Research Community
                            </Button>
                            <Button variant="outline">
                                <Mail className="w-4 h-4" />
                                Subscribe to Updates
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="py-32 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                        The future of AI won't be bigger.
                        <br />
                        <span className="text-gradient">It will be closer to how humans work.</span>
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Follow Native as we research and build intelligence that grows from conversation.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="primary" size="large" className="group" onClick={() => router.push('/')}>
                            Start Using Native
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button variant="outline" size="large">
                            Read Our Research
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gradient">∀i</span>
                            <span className="text-lg font-semibold">Native</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground transition-colors">Product</Link>
                            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                            <Link href="/research" className="hover:text-foreground transition-colors">Research</Link>
                            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Native ∀i — Intelligence, for all.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ResearchClient;
