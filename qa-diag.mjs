// qa-diag.mjs — honest visual diagnostic across all 6 pages at 2 viewports.
export default async function run(page, ui) {
  const base = "http://localhost:3000";
  const targets = [
    ["ar-home", "/ar"],
    ["en-home", "/en"],
    ["ar-portfolio", "/ar/portfolio"],
    ["ar-services", "/ar/services"],
    ["admin-login", "/admin/login"],
    ["admin", "/admin"],
  ];
  const sizes = [
    ["m", 375, 812],
    ["d", 1440, 900],
  ];
  const out = [];
  for (const [name, path] of targets) {
    for (const [size, w, h] of sizes) {
      const errs = [];
      const onErr = (m) => {
        if (m.type() === "error") errs.push(m.text());
      };
      const onPageErr = (e) => errs.push("PAGEERROR: " + e.message);
      page.on("console", onErr);
      page.on("pageerror", onPageErr);
      await page.setViewportSize({ width: w, height: h });
      await page
        .goto(base + path, { waitUntil: "networkidle", timeout: 45000 })
        .catch((e) => errs.push("NAVFAIL: " + e.message));
      await page.waitForTimeout(3000);
      const info = await page.evaluate(() => {
        const de = document.documentElement;
        const vw = de.clientWidth;
        const bad = [];
        document.querySelectorAll("body *").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.left < -2 || r.right > vw + 2)) {
            bad.push({
              t: el.tagName,
              c: (el.className || "").toString().slice(0, 60),
              l: Math.round(r.left),
              r: Math.round(r.right),
            });
          }
        });
        const h1 = document.querySelector("h1");
        const hr = h1 ? h1.getBoundingClientRect() : null;
        return {
          title: document.title,
          lang: de.lang,
          dir: de.dir,
          vw,
          scrollW: de.scrollWidth,
          scrollH: de.scrollHeight,
          overflowCount: bad.length,
          overflowSample: bad.slice(0, 8),
          h1Text: h1 ? h1.innerText.slice(0, 70) : null,
          h1: hr ? { top: Math.round(hr.top), h: Math.round(hr.height) } : null,
          overlay: !!document.querySelector("nextjs-portal"),
          bodyBg: getComputedStyle(document.body).backgroundColor,
        };
      });
      page.off("console", onErr);
      page.off("pageerror", onPageErr);
      out.push({ page: path, size, ...info, errors: errs.slice(0, 4) });
    }
  }
  return out;
}
