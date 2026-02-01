"use client";

import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "./radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Smart Resume Parsing",
    date: "Instant",
    content: "Extracts skills, experience, and role alignment with high precision.",
    category: "Core",
    icon: FileText,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "AI Skill Gap Analysis",
    date: "Seconds",
    content: "Highlights missing skills and prioritizes what matters most.",
    category: "Insights",
    icon: Code,
    relatedIds: [1, 4],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 3,
    title: "Personalized Roadmap",
    date: "Tailored",
    content: "Curated learning paths to close gaps quickly and efficiently.",
    category: "Guidance",
    icon: Calendar,
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "AI Interviewer",
    date: "Live",
    content: "Practice interviews with adaptive feedback and scoring.",
    category: "Interview",
    icon: User,
    relatedIds: [2, 5],
    status: "in-progress" as const,
    energy: 70,
  },
  {
    id: 5,
    title: "Job Match Engine",
    date: "Always on",
    content: "Matches your profile to roles that best fit your skills.",
    category: "Matching",
    icon: Clock,
    relatedIds: [3, 4],
    status: "pending" as const,
    energy: 50,
  },
];

const ProductFeatures = () => {
  return (
    <section className="w-full bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            Product Features
          </h2>
          <p className="text-gray-300 text-lg">
            A premium, interactive view of the core capabilities that power Hireable.
          </p>
        </div>
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </section>
  );
};

export default ProductFeatures;
