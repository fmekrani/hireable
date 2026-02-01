"use client";

import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "./radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Discovery",
    date: "Now",
    content: "Surface the strongest signals in your profile instantly.",
    category: "Core",
    icon: FileText,
    relatedIds: [2],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 2,
    title: "Optimization",
    date: "Active",
    content: "Optimize skills and positioning based on live market data.",
    category: "Insights",
    icon: Code,
    relatedIds: [1, 3],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 3,
    title: "Preparation",
    date: "Ongoing",
    content: "Prepare with guided learning and interview practice.",
    category: "Prep",
    icon: User,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 4,
    title: "Placement",
    date: "Soon",
    content: "Match to roles and track readiness over time.",
    category: "Match",
    icon: Calendar,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 40,
  },
  {
    id: 5,
    title: "Momentum",
    date: "Always",
    content: "Keep improving with continuous feedback loops.",
    category: "Growth",
    icon: Clock,
    relatedIds: [4],
    status: "pending" as const,
    energy: 30,
  },
];

export default function FeaturesTimeline() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}
