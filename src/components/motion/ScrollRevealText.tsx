"use client";
import { createElement, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "framer-motion";

/**
 * ScrollRevealText — GSAP SplitText driven by ScrollTrigger.
 *
 * The text is split into characters (or words / lines) and each one is animated
 * from below with a stagger as the element scrolls into view. This is the
 * Awwwards-grade text reveal: it is tied to the scroll position, not a one-off
 * entrance.
 *
 * Reduced-motion renders the plain text with no split and no animation.
 */
export default function ScrollRevealText({
  text,
  className,
  as: Tag = "span",
  type = "chars",
  stagger = 0.02,
  yPercent = 110,
  start = "top 85%",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  type?: "chars" | "words" | "lines";
  stagger?: number;
  yPercent?: number;
  start?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const split = new SplitText(el, { type, linesClass: "srt-line" });
    const targets =
      type === "chars"
        ? split.chars
        : type === "words"
          ? split.words
          : split.lines;

    const anim = gsap.fromTo(
      targets,
      { yPercent, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      },
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
      split.revert();
    };
  }, [reduce, type, stagger, yPercent, start, delay, text]);

  if (reduce) return createElement(Tag, { className }, text);

  return createElement(
    Tag,
    { ref, className: `srt-root ${className ?? ""}` },
    text,
  );
}
