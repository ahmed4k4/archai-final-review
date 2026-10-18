export default async function run(page, ui) {
  const base = "http://localhost:3000";
  const pages = [
    ["ar", "/ar"],
    ["en", "/en"],
    ["portfolio", "/ar/portfolio"],
    ["services", "/ar/services"],
    ["login", "/admin/login"],
  ];
  const sizes = [
    ["mobile", 375, 812],
    ["desktop", 1440, 900],
  ];
  const out = [];
  const dir = String.raw`C:\Users\pc\OneDrive\Desktop\archai-next-refactored\archai-seo-3d-upgrade\archai-final-review\shots`;

  for (const [name, path] of pages) {
    for (const [size, w, h] of sizes) {
      await page.setViewportSize({ width: w, height: h });
      try {
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
        await page.waitForTimeout(3500);
        const file = dir + "\\" + name + "-" + size + ".png";
        await page.screenshot({ path: file, fullPage: false });
        const info = await page.evaluate(() => ({
          title: document.title,
          bodyChars: document.body.innerText.length,
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          scrollH: document.documentElement.scrollHeight,
        }));
        out.push({ name, size, file, ok: true, ...info });
      } catch (e) {
        out.push({ name, size, ok: false, error: String(e).slice(0, 120) });
      }
    }
  }
  return out;
}
