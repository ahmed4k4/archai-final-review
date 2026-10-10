"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Adds .visible to .reveal / .stagger elements when they scroll into view.
   Complements Framer Motion for legacy markup. */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const scan = () =>
      document
        .querySelectorAll(".reveal:not(.visible),.stagger:not(.visible)")
        .forEach((el) => io.observe(el));

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}