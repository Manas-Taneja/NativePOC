import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock, DollarSign, Zap, Users, FileX } from "lucide-react";
import NavigationSection from "@/components/landing/NavigationSection";
import FooterSection from "@/components/landing/FooterSection";
import PricingClient from "./pricing-client";

export const metadata = {
    title: "Pricing | Native",
    description: "Simple pricing for every business. Start with Cloud Native or build your own BLM.",
};

export default function PricingPage() {
    return <PricingClient />;
}
