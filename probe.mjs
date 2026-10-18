export default async function run(page, ui) {
  const base = 'http://localhost:3000'
  const dir = String.raw`C:\Users\pc\OneDrive\Desktop\archai-next-refactored\archai-seo-3d-upgrade\archai-final-review\shots`
  const out = {}

  // ---- Mobile 375 : inspect overflow / overflow-x ----
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(base + '/ar/services', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3500)

  out.services_mobile = await page.evaluate(() => {
    const de = document.documentElement
    const overflowing = []
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && (r.left < -1 || r.right > de.clientWidth + 1)) {
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className).slice(0, 60)) || '',
          text: (el.textContent || '').trim().slice(0, 40),
          left: Math.round(r.left),
          right: Math.round(r.right),
        })
      }
    })
    const h1 = document.querySelector('h1')
    const h1r = h1 ? h1.getBoundingClientRect() : null
    const cs = h1 ? getComputedStyle(h1) : null
    return {
      docScrollW: de.scrollWidth,
      docClientW: de.clientWidth,
      hasHorizontalScroll: de.scrollWidth > de.clientWidth,
      h1: h1r ? { text: h1.textContent.trim().slice(0, 60), left: Math.round(h1r.left), right: Math.round(h1r.right), w: Math.round(h1r.width), fontSize: cs.fontSize, color: cs.color, lineHeight: cs.lineHeight } : null,
      overflowCount: overflowing.length,
      overflowing: overflowing.slice(0, 12),
    }
  })

  // ---- Mobile 375 : contrast of small muted text ----
  await page.goto(base + '/ar', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  out.home_mobile_text = await page.evaluate(() => {
    const samples = []
    document.querySelectorAll('p,span,small,div').forEach((el) => {
      if (el.children.length) return
      const t = (el.textContent || '').trim()
      if (t.length < 8 || t.length > 90) return
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      samples.push({
        text: t.slice(0, 55),
        fontSize: cs.fontSize,
        color: cs.color,
        weight: cs.fontWeight,
        opacity: cs.opacity,
        y: Math.round(r.top + window.scrollY),
      })
    })
    return { count: samples.length, first: samples.slice(0, 25) }
  })

  // ---- Desktop 1440 : header nav overlap ----
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(base + '/ar', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  out.header_desktop = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return { header: null }
    const h = header.getBoundingClientRect()
    const kids = []
    header.querySelectorAll('a,button').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0) return
      kids.push({ text: (el.textContent || '').trim().slice(0, 22), x: Math.round(r.left), w: Math.round(r.width), y: Math.round(r.top) })
    })
    return { headerH: Math.round(h.height), kids: kids.slice(0, 20) }
  })

  return out
}
