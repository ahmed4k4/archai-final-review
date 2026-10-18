// qa-portfolio.mjs — determine what actually renders in the portfolio section-scene.
export default async function run(page) {
  const url = "http://localhost:3000/ar/portfolio";
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);
  // scroll through page to trigger IntersectionObserver-based scene activation
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const block = document.querySelector(".section-scene");
    const fb = document.querySelector(".section-scene .lazy-fallback");
    const canvas = document.querySelector(".section-scene canvas");
    const fbCs = fb ? getComputedStyle(fb) : null;
    const blockRect = block?.getBoundingClientRect();
    const cards = document.querySelectorAll("[data-project-card], article");
    return {
      sectionSceneHeight: blockRect ? Math.round(blockRect.height) : null,
      sectionSceneTop: blockRect ? Math.round(blockRect.top) : null,
      hasCanvas: !!canvas,
      canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
      fallbackOpacity: fbCs?.opacity ?? null,
      fallbackVisible: fbCs
        ? fbCs.display !== "none" && fbCs.visibility !== "hidden"
        : null,
      cardCount: cards.length,
      cardSample: Array.from(cards)
        .slice(0, 3)
        .map((c) => ({
          tag: c.tagName,
          text: (c.textContent || "").trim().slice(0, 40),
          rect: (() => {
            const r = c.getBoundingClientRect();
            return `${Math.round(r.width)}x${Math.round(r.height)}`;
          })(),
        })),
      bodyText: document.body.innerText.replace(/\s+/g, " ").slice(0, 300),
    };
  });

  // grab just the section-scene block
  const block = await page.$(".section-scene");
  if (block) await block.screenshot({ path: "shots/v21-portfolio-scene.png" });
  return info;
}
