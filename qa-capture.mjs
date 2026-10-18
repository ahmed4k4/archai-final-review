// qa-capture.mjs — real visual capture with controlled viewport.
// The stock driver always does fullPage:true and ignores --width/--height,
// which squeezes a 13k-tall page into an unreadable strip. This script sets
// the viewport, waits for paint, and captures BOTH a viewport shot and a
// full-page shot at the real width.
export default async function (page, ui) {
  const args = Object.fromEntries(
    (process.env.QA_ARGS || "")
      .split("|")
      .filter(Boolean)
      .map((s) => {
        const i = s.indexOf("=");
        return [s.slice(0, i), s.slice(i + 1)];
      }),
  );
  const url = args.url;
  const w = Number(args.w || 1440);
  const h = Number(args.h || 900);
  const name = args.name || "shot";
  const outDir = args.out || ".";

  await page.setViewportSize({ width: w, height: h });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page
    .waitForFunction(() => (document.body?.innerText || "").trim().length > 0, {
      timeout: 20000,
    })
    .catch(() => {});
  // Give canvas/WebGL and scroll-reveal a real chance to paint.
  await page.waitForTimeout(3500);
  // Nudge scroll so lazy/intersection-observer sections mount, then return to top.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });

  const vpPath = `${outDir}/${name}-viewport.png`;
  const fullPath = `${outDir}/${name}-full.png`;
  await page.screenshot({ path: vpPath, fullPage: false });
  await page.screenshot({ path: fullPath, fullPage: true });

  const meta = await page.evaluate(() => ({
    docHeight: document.body.scrollHeight,
    title: document.title,
    h1: document.querySelector("h1")?.innerText?.slice(0, 80) || null,
  }));
  return { url, w, h, vpPath, fullPath, ...meta };
}
