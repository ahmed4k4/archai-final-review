"use client";
import type { CSSProperties, ReactNode } from "react";

/**
 * StarBorder — React Bits style component.
 * A glowing, animated border that orbits the content — used for primary CTAs.
 */
export default function StarBorder({
  children,
  className,
  color = "#2ED2FF",
  speed = 6,
  as: Tag = "span",
  href,
  style,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: number;
  as?: "span" | "div" | "a";
  href?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      {...(href ? { href } : {})}
      className={`star-border-container ${className ?? ""}`}
      style={{
        ["--sb-color" as string]: color,
        ["--sb-speed" as string]: `${speed}s`,
        ...style,
      }}
    >
      <span className="star-border-glow" aria-hidden />
      <span className="star-border-inner">{children}</span>
    </Tag>
  );
}
