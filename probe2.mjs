export default async function run(page, ui) {
  const base = "http://localhost:3000";
  const dir = String.raw`C:\Users\pc\OneDrive\Desktop\archai-next-refactored\archai-seo-3d-upgrade\archai-final-review\shots`;
  const out = {};

  // Exact H1 inner text + how the title is split into words/spans
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + "/ar/services", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  out.services_h1_desktop = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return null;
    const spans = [...h1.querySelectorAll("*")]
      .filter((e) => e.children.length === 0)
      .map((e) => e.textContent);
    const cs = getComputedStyle(h1);
    const r = h1.getBoundingClientRect();
    return {
      innerText: h1.innerText,
      textContent: h1.textContent,
      leafTexts: spans,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      color: cs.color,
      rect: {
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
      },
      ariaLabel: h1.getAttribute("aria-label"),
    };
  });

  // The mobile crop of the same title
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + "/ar/services", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  out.services_h1_mobile = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const r = h1.getBoundingClientRect();
    return {
      innerText: h1.innerText,
      rect: {
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
      },
    };
  });

  // Contrast scan: compute WCAG contrast of every small text vs its bg
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + "/ar", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  out.contrast = await page.evaluate(() => {
    function parse(c) {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(",").map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    function lum(c) {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }
    function ratio(a, b) {
      const l1 = lum(a),
        l2 = lum(b);
      const hi = Math.max(l1, l2),
        lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    }
    function bg(el) {
      let e = el;
      while (e && e !== document.documentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c && c.a > 0.5) return c;
        e = e.parentElement;
      }
      return { r: 20, g: 26, b: 31, a: 1 };
    }
    const bad = [];
    document.querySelectorAll("p,span,a,small,li,div").forEach((el) => {
      if (el.children.length) return;
      const t = (el.textContent || "").trim();
      if (t.length < 4) return;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const fg = parse(cs.color);
      if (!fg) return;
      const cr = ratio(fg, bg(el));
      const size = parseFloat(cs.fontSize);
      const large =
        size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight) >= 700);
      const need = large ? 3 : 4.5;
      if (cr < need)
        bad.push({
          text: t.slice(0, 40),
          fontSize: cs.fontSize,
          color: cs.color,
          contrast: Math.round(cr * 100) / 100,
          need,
          y: Math.round(r.top + window.scrollY),
        });
    });
    return {
      badCount: bad.length,
      worst: bad.sort((a, b) => a.contrast - b.contrast).slice(0, 15),
    };
  });

  return out;
}
