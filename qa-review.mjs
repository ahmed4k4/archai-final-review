export default async function run(page, ui) {
  const pages = ["/ar", "/en", "/ar/portfolio", "/ar/services", "/admin/login"];
  const out = [];
  for (const p of pages) {
    const errs = [];
    const onErr = (m) => {
      if (m.type() === "error") errs.push(m.text());
    };
    const onPageErr = (e) => errs.push("PAGEERROR: " + e.message);
    page.on("console", onErr);
    page.on("pageerror", onPageErr);
    await page
      .goto("http://localhost:3000" + p, {
        waitUntil: "networkidle",
        timeout: 45000,
      })
      .catch((e) => errs.push("NAVFAIL: " + e.message));
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const body = document.body;
      return {
        title: document.title,
        h1: h1 ? h1.innerText : null,
        h1Rect: h1
          ? (() => {
              const r = h1.getBoundingClientRect();
              return { w: Math.round(r.width), h: Math.round(r.height) };
            })()
          : null,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        bodyChars: (body.innerText || "").length,
        errBadge: !!document.querySelector("nextjs-portal"),
      };
    });
    page.off("console", onErr);
    page.off("pageerror", onPageErr);
    out.push({ page: p, ...info, errors: errs.slice(0, 5) });
  }
  return out;
}
