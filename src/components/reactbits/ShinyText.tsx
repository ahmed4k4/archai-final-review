"use client";
import type { ReactNode } from "react";

/**
 * ShinyText — React Bits style component.
 * A highlight sweeps across the text forever (CSS-driven, GPU friendly).
 * Reduced-motion keeps the static colour via the global animation reset.
 */
export default function ShinyText({
  children,
  className,
  speed = 4,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds for one sweep. */
  speed?: number;
  disabled?: boolean;
}) {
  return (
    <span
      className={`shiny-text ${className ?? ""}`}
      style={{ ["--shiny-speed" as string]: `${speed}s` }}
      data-disabled={disabled ? "true" : "false"}
    >
      {children}
    </span>
  );
}
