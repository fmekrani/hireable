"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface LimelightNavProps {
  items: NavItem[];
  className?: string;
}

export function LimelightNav({ items, className }: LimelightNavProps) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeRect, setActiveRect] = useState<{
    width: number;
    left: number;
  } | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Find active index based on current path
  const activeIndex = items.findIndex((item) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(item.href);
  });

  // Update active rect when active index changes
  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      setActiveRect({
        width: itemRect.width,
        left: itemRect.left - navRect.left,
      });
    }
  }, [activeIndex, pathname]);

  const getHoverRect = (index: number) => {
    const item = itemRefs.current[index];
    if (item && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      return {
        width: itemRect.width,
        left: itemRect.left - navRect.left,
      };
    }
    return null;
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative flex items-center gap-1 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl",
        className
      )}
    >
      {/* Background highlight */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-white/10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              ...getHoverRect(hoveredIndex),
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Active indicator */}
      {activeRect && activeIndex >= 0 && (
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-white/[0.08] border border-white/10"
          initial={false}
          animate={{
            width: activeRect.width,
            left: activeRect.left,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      {/* Nav items */}
      {items.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
              isActive ? "text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-white/40"
                )}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default LimelightNav;
