export default async function run(page, ui) {
  const results = {};

  // --- Initial mount: overlay should be present right away ---
  // The veil is a fixed, full-screen, aria-hidden container at z-[9998].
  const veilPresent = () =>
    page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("div[aria-hidden]"));
      return els.some((el) => {
        const cs = getComputedStyle(el);
        return (
          cs.position === "fixed" &&
          el.className.includes("z-[9998]") &&
          el.className.includes("inset-0")
        );
      });
    });

  results.veilAtMount = await veilPresent();
  results.bodyCharsAtMount = await page.evaluate(() => document.body.innerText.length);

  // --- After ~1.6s the overlay should be gone ---
  await page.waitForTimeout(1700);
  results.veilAfter1400 = await veilPresent();
  results.bodyCharsAfter = await page.evaluate(() => document.body.innerText.length);

  // --- The hero should be visible after the veil clears ---
  results.heroVisible = await page
    .locator("h1")
    .first()
    .isVisible()
    .catch(() => false);

  return results;
}
