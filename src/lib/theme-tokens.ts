/**
 * Theme tokens as TS constants — for programmatic use in
 * WebGL scenes, canvas, and charts that can't read CSS variables.
 *
 * The palette is deliberately narrow: five brand hues only.
 *   Carbon  #1B2228  — page base / deepest surface
 *   Panel   #222B33  — raised surface / cards
 *   Silver  #CCD3DA  — primary text / hairlines
 *   Arc Blue#2ED2FF  — primary accent / energy
 *   Copper  #C48A5C  — secondary accent / warmth
 */

export const BRAND = {
  carbon: {
    50: "#E9EDF0",
    100: "#CCD3DA",
    200: "#A8B2BC",
    300: "#7E8A95",
    400: "#55616C",
    500: "#38424B",
    600: "#2A333B",
    700: "#222B33",
    800: "#1B2228",
    900: "#141A1F",
  },
  panel: {
    50: "#E9EDF0",
    100: "#CBD2D9",
    200: "#A4AEB7",
    300: "#7B8792",
    400: "#525E69",
    500: "#38424B",
    600: "#2A333B",
    700: "#222B33",
    800: "#1B2228",
    900: "#141A1F",
  },
  silver: {
    50: "#F6F8FA",
    100: "#E9EDF0",
    200: "#CCD3DA",
    300: "#B4BEC7",
    400: "#96A1AC",
    500: "#78848F",
    600: "#5A656F",
    700: "#414B54",
    800: "#2C343B",
    900: "#1B2228",
  },
  arc: {
    50: "#E6FAFF",
    100: "#BDF2FF",
    200: "#8AE8FF",
    300: "#5CDDFF",
    400: "#2ED2FF",
    500: "#17B4E0",
    600: "#0E90B8",
    700: "#0A6E8E",
    800: "#084F67",
    900: "#063646",
  },
  copper: {
    50: "#FBF3EC",
    100: "#F2DFCC",
    200: "#E4C1A2",
    300: "#D6A577",
    400: "#C48A5C",
    500: "#AE7347",
    600: "#8E5A36",
    700: "#6E4529",
    800: "#4F311D",
    900: "#331F12",
  },
} as const;

export const GRADIENTS = {
  primary: "linear-gradient(120deg, #2ED2FF 0%, #C48A5C 100%)",
  signal: "linear-gradient(90deg, #2ED2FF, #8AE8FF 40%, #C48A5C 100%)",
  aurora: "linear-gradient(135deg, #141A1F 0%, #2ED2FF 45%, #C48A5C 100%)",
  cta: "linear-gradient(120deg, #17B4E0 0%, #2ED2FF 50%, #C48A5C 100%)",
  text: "linear-gradient(100deg, #F6F8FA 0%, #CCD3DA 45%, #2ED2FF 100%)",
} as const;

export const SCENE_COLORS = {
  dark: {
    ambient: "#2ED2FF",
    keyLight: "#CCD3DA",
    fillLight: "#C48A5C",
    rimLight: "#2ED2FF",
    background: "#141A1F",
  },
  light: {
    ambient: "#17B4E0",
    keyLight: "#2ED2FF",
    fillLight: "#AE7347",
    rimLight: "#C48A5C",
    background: "#F6F8FA",
  },
} as const;

export const MOTION = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeSpring: [0.34, 1.56, 0.64, 1] as const,
  easeSmooth: [0.4, 0, 0.2, 1] as const,
  duration: {
    fast: 0.2,
    base: 0.32,
    slow: 0.52,
    cinematic: 1,
  },
} as const;

export function currentTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return (document.documentElement.dataset.theme as "dark" | "light") || "dark";
}