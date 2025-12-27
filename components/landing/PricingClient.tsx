"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock, DollarSign, Zap, Users, FileX } from "lucide-react";
import { useState } from "react";
import NavigationSection from "@/components/landing/NavigationSection";
import FooterSection from "@/components/landing/FooterSection";

const cloudFeatures = [
    "Team chat with Native ∀i",
    "Task extraction & nudges",
    "Command Center dashboard",
    "Shared cloud intelligence",
    "All core features included",
];

const blmFeatures = [
    "Everything in Cloud Native",
    "Your own Small Language Model (BLM)",
    "Private business memory",
    "Trained on your conversations & workflows",
    "Compounds into a strategic asset",
    "Ownership of your intelligence",
];

const trustPoints = [
    { icon: Lock, text: "Your data stays private" },
    { icon: DollarSign, text: "SMB-friendly pricing" },
    { icon: Zap, text: "Setup in minutes" },
    { icon: Users, text: "No AI team needed" },
    { icon: FileX, text: "No long-term contracts" },
];

const faqs = [
    {
        question: "What's the difference between Cloud and BLM Native?",
        answer: "Cloud Native uses shared AI infrastructure for fast setup. BLM Native builds a private language model trained specifically on your business, giving you ownership of a unique AI asset."
    },
    {
        question: "Can I switch plans later?",
        answer: "Yes! Start with Cloud Native and upgrade to BLM Native anytime. Your data and history will carry over seamlessly."
    },
    {
        question: "Is my data private?",
        answer: "Absolutely. Your data is encrypted and never shared. With BLM Native, your model is completely isolated and owned by you."
    },
    {
        question: "What happens after the free trial?",
        answer: "You'll be notified before your trial ends. Choose a plan or cancel with no charges. No credit card required to start."
    },
    {
        question: "Do I need technical setup?",
        answer: "Not at all. If you can use WhatsApp, you can use Native ∀i. Setup takes under 5 minutes with guided onboarding."
    },
];

const PricingClient = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-background">
            <NavigationSection />

            {/* Header */}
            <section className="pt-32 pb-16 px-4">
                <div className="container mx-auto text-center max-w-3xl">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <span className="text-4xl font-bold text-gradient">∀i</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Simple pricing for every business.
                    </h1>
                    <p className="text-xl text-muted-foreground mb-4">
                        Start with AI today.<br />
                        Or build and own your business brain.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Free 14-day trial • No credit card • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Cloud Native */}
                        <Card className="glass relative overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground px-3 py-1 rounded-full border border-border">
                                        Get started fast
                                    </span>
                                </div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <span className="text-primary">☁️</span> Cloud Native
                                </CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">$49.99</span>
                                    <span className="text-muted-foreground"> / month</span>
                                    <p className="text-sm text-muted-foreground mt-1">Up to 5 team members</p>
                                </div>
                                <CardDescription className="mt-4 text-base">
                                    The easiest way to bring AI into your daily work.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    {cloudFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button variant="outline" className="w-full" size="large">
                                    Start with Cloud Native
                                </Button>
                                <p className="text-sm text-muted-foreground text-center">
                                    Perfect for teams new to AI.
                                </p>
                            </CardFooter>
                        </Card>

                        {/* BLM Native */}
                        <Card className="glass relative overflow-hidden border-primary/30 shadow-glow-soft">
                            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-primary" />
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium bg-primary/20 text-primary px-3 py-1 rounded-full">
                                        ⭐ Most future-ready
                                    </span>
                                </div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <span className="text-gradient text-2xl font-bold">∀i</span> BLM Native
                                </CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">$79.99</span>
                                    <span className="text-muted-foreground"> / month</span>
                                    <p className="text-sm text-muted-foreground mt-1">Up to 5 team members</p>
                                </div>
                                <CardDescription className="mt-4 text-base">
                                    Build and own your Business Language Model — a private AI brain trained on how your business works.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    {blmFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button variant="primary" className="w-full" size="large">
                                    Build My BLM ∀i
                                </Button>
                                <p className="text-sm text-muted-foreground text-center">
                                    For teams ready to own their AI.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Upgrade Note */}
                    <div className="text-center mt-12">
                        <p className="text-muted-foreground glass inline-block px-6 py-3 rounded-lg">
                            Start in the cloud. Upgrade anytime to build and own your BLM <span className="text-gradient font-semibold">∀i</span>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Built for small businesses.
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {trustPoints.map((point, index) => (
                            <div
                                key={index}
                                className="glass p-4 rounded-xl text-center flex flex-col items-center gap-3"
                            >
                                <point.icon className="w-6 h-6 text-primary" />
                                <span className="text-sm text-foreground">{point.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Frequently asked questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="glass rounded-xl overflow-hidden"
                            >
                                <button
                                    className="w-full p-6 text-left flex items-center justify-between"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span className="font-medium text-foreground">{faq.question}</span>
                                    <span className="text-primary text-xl">
                                        {openFaq === index ? "−" : "+"}
                                    </span>
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-muted-foreground animate-fade-in">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        The future isn't just using AI.<br />
                        <span className="text-gradient">It's owning it.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Button variant="primary" size="large">
                            Start Free Trial
                        </Button>
                        <Button variant="outline" size="large">
                            Talk to Us
                        </Button>
                    </div>
                    <p className="text-muted-foreground mt-8">
                        Native <span className="text-gradient font-semibold">∀i</span> — Intelligence, for all.
                    </p>
                </div>
            </section>

            <FooterSection />
        </div>
    );
};

export default PricingClient;
