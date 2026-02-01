import React, { useState, useRef, useLayoutEffect, cloneElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// --- Internal Types and Defaults ---

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

type NavItem = {
  id: string | number;
  icon: React.ReactElement;
  label?: string;
  href?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: "default-home", icon: <DefaultHomeIcon />, label: "Home", href: "/" },
];

type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

/**
 * An adaptive-width navigation bar with a "limelight" effect that highlights the active item.
 */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  // Auto-detect active index based on pathname
  React.useEffect(() => {
    const newActiveIndex = items.findIndex((item) => {
      if (!item.href) return false;
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    });
    if (newActiveIndex !== -1 && newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  }, [pathname, items, activeIndex]);

  useLayoutEffect(() => {
    if (items.length === 0) return;

    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];

    if (limelight && activeItem) {
      const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) {
    return null;
  }

  const handleItemClick = (index: number, itemOnClick?: () => void, href?: string) => {
    setActiveIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav className={`relative inline-flex items-center h-16 rounded-lg bg-white/5 text-white border border-white/10 px-2 backdrop-blur-xl ${className}`}>
      {items.map(({ id, icon, label, onClick, href }, index) => {
        const linkRef = useRef<HTMLAnchorElement>(null);
        
        return (
          <Link
            key={id}
            href={href || "#"}
            ref={(el) => {
              if (el) navItemRefs.current[index] = el;
            }}
            className={`relative z-20 flex h-full cursor-pointer items-center justify-center p-5 transition-opacity ${iconContainerClassName}`}
            onClick={() => handleItemClick(index, onClick, href)}
            aria-label={label}
          >
            {cloneElement(icon as React.ReactElement<any>, {
              className: `w-5 h-5 transition-opacity duration-100 ease-in-out ${
                activeIndex === index ? "opacity-100" : "opacity-40"
              } ${(icon as any).props?.className || ""} ${iconClassName || ""}`,
            })}
            {label && activeIndex === index && (
              <span className="ml-2 text-sm font-medium whitespace-nowrap">{label}</span>
            )}
          </Link>
        );
      })}

      <div
        ref={limelightRef}
        className={`absolute top-0 z-10 w-11 h-[3px] rounded-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_rgba(255,255,255,0.5)] ${
          isReady ? "transition-[left] duration-300 ease-in-out" : ""
        } ${limelightClassName}`}
        style={{ left: "-999px" }}
      >
        <div className="absolute left-[-30%] top-[3px] w-[160%] h-10 [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      </div>
    </nav>
  );
};
