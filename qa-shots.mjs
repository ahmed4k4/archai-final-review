// qa-shots.mjs — capture 6 pages x 2 viewports to shots/ and report basic signals.
import fs from "node:fs";

const pages = [
  ["ar", "http://localhost:3000/ar"],
  ["en", "http://localhost:3000/en"],
  ["ar-portfolio", "http://localhost:3000/ar/portfolio"],
  ["ar-services", "http://localhost:3000/ar/services"],
  ["admin-login", "http://localhost:3000/admin/login"],
  ["admin", "http://localhost:3000/admin"],
];

const sizes = [
  ["m", 375, 812],
  ["d", 1440, 900],
];

export default async function run(page, ui) {
  fs.mkdirSync("shots", { recursive: true });
  const out = [];
  for (const [name, url] of pages) {
    for (const [sz, w, h] of sizes) {
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(4500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        const file = `shots/v21-${name}-${sz}.png`;
        await page.screenshot({ path: file, fullPage: false });
        const info = await page.evaluate(() => {
          const portal = document.querySelector("nextjs-portal");
          const badge =
            portal?.shadowRoot?.textContent?.match(/(\d+)\s+error/i);
          return {
            badge: badge ? badge[0] : null,
            scrollH: document.documentElement.scrollHeight,
            bodyBg: getComputedStyle(document.body).backgroundColor,
          };
        });
        out.push({ page: name, size: sz, file, ...info });
      } catch (e) {
        out.push({ page: name, size: sz, error: String(e).slice(0, 120) });
      }
    }
  }
  return out;
}
