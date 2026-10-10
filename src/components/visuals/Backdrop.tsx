"use client";
import dynamic from "next/dynamic";
import type { PageKey } from "./PageScenes";

/**
 * Backdrop — the public entry point for page backgrounds.
 *
 * Wraps SceneBackdrop in `next/dynamic({ ssr: false })` so three.js is only
 * fetched on the client, and never blocks first paint. Renders nothing on the
 * server, so SSR HTML stays light.
 */
const SceneBackdrop = dynamic(() => import("./SceneBackdrop"), {
  ssr: false,
  loading: () => null,
});

export default function Backdrop({ name }: { name: PageKey }) {
  return <SceneBackdrop name={name} />;
}
