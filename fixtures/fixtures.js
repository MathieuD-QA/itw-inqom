const base = require('@playwright/test')

exports.test = base.test.extend({

  /**
   * Override page to add page.scanDOM() — scans the live DOM and prints
   * ready-to-use Playwright locators for links, buttons, inputs, list items, testIds.
   *
   * Usage: await page.scanDOM()  ← add, run, copy locators, remove
   */
  page: async ({ context }, use) => {
    const page = await context.newPage()

    page.scanDOM = async () => {
      const data = await page.evaluate(() => {
        const linkTexts = new Set()
        document.querySelectorAll('a[href]').forEach(el => {
          const n = (el.getAttribute('aria-label') || el.textContent.trim()).substring(0, 80)
          if (n) linkTexts.add(n.toLowerCase())
        })
        const seen = (set, key) => { if (set.has(key)) return true; set.add(key); return false }

        const links = []; const sL = new Set()
        document.querySelectorAll('a[href]').forEach(el => {
          const name = (el.getAttribute('aria-label') || el.textContent.trim()).substring(0, 80)
          const href = (el.getAttribute('href') || '').substring(0, 60)
          if (!name || name.length < 2 || seen(sL, name)) return
          links.push({ name, href })
        })

        const btnMap = new Map()
        document.querySelectorAll('button').forEach(el => {
          const name = (el.getAttribute('aria-label') || el.textContent.trim()).substring(0, 80)
          if (!name || name.length < 2) return
          const id = el.getAttribute('id') || null
          if (btnMap.has(name)) { btnMap.get(name).count++; if (id) btnMap.get(name).ids.push(id) }
          else btnMap.set(name, { name, id, count: 1, ids: id ? [id] : [] })
        })
        const buttons = [...btnMap.values()]

        const inputs = []; const sI = new Set()
        document.querySelectorAll('input:not([type=hidden]), textarea, select').forEach(el => {
          const ariaLabel = el.getAttribute('aria-label')
          const forLabel = el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() : null
          const wrapLabel = el.closest('label')?.textContent?.trim().replace(el.value || '', '').trim() || null
          const label = ariaLabel || forLabel || wrapLabel
          const placeholder = el.getAttribute('placeholder')
          const key = label || placeholder
          if (!key || seen(sI, key)) return
          const inputType = el.tagName === 'SELECT' ? 'combobox' : el.getAttribute('type') === 'checkbox' ? 'checkbox' : 'textbox'
          inputs.push(label ? { strategy: 'label', value: label, inputType } : { strategy: 'placeholder', value: placeholder })
        })

        const listItems = []; const sLI = new Set()
        document.querySelectorAll('li').forEach(el => {
          const text = el.textContent.trim()
          if (!text || text.length > 60 || text.length < 2 || seen(sLI, text)) return
          if (el.querySelector('a, button, input')) return
          listItems.push({ text, ambiguous: linkTexts.has(text.toLowerCase()) })
        })

        const testIds = []; const sTI = new Set()
        document.querySelectorAll('[data-testid]').forEach(el => {
          const id = el.getAttribute('data-testid')
          if (id && !seen(sTI, id)) testIds.push(id)
        })

        return { url: location.href, links, buttons, inputs, listItems, testIds }
      })

      const q = s => s.includes("'") ? `"${s}"` : `'${s}'`
      const hr = '─'.repeat(72)
      const out = [`\n${hr}`, `DOM SCAN → ${data.url}`, hr]

      if (data.links.length) {
        out.push('\n📎  LINKS')
        data.links.forEach(({ name, href }) =>
          out.push(`  await page.getByRole('link', { name: ${q(name)}, exact: true }).click()${href ? `  // → ${href}` : ''}`)
        )
      }
      if (data.buttons.length) {
        out.push('\n🔘  BUTTONS')
        data.buttons.forEach(({ name, count, ids }) => {
          if (count > 1) {
            out.push(`  ⚠️   page.getByRole('button', { name: ${q(name)}, exact: true })  ← AMBIGUOUS (${count} matches)`)
            if (ids.length) ids.forEach(id => out.push(`       page.locator('#${id}')  // use id to target specific one`))
          } else {
            out.push(`  await page.getByRole('button', { name: ${q(name)}, exact: true }).click()`)
          }
        })
      }
      if (data.inputs.length) {
        out.push('\n✏️   INPUTS')
        data.inputs.forEach(item => out.push(
          item.strategy === 'label'
            ? `  page.getByRole(${q(item.inputType)}, { name: ${q(item.value)} })`
            : `  page.getByPlaceholder(${q(item.value)})`
        ))
      }
      if (data.listItems.length) {
        out.push('\n📋  PLAIN LIST ITEMS  (no link/button child)')
        data.listItems.forEach(({ text, ambiguous }) => {
          const base = `page.getByRole('listitem').filter({ hasText: ${q(text)} })`
          out.push(ambiguous
            ? `  ⚠️   await ${base}.filter({ hasNot: page.getByRole('link') }).click()  ← AMBIGUOUS`
            : `  ✅   await ${base}.click()`
          )
        })
      }
      if (data.testIds.length) {
        out.push('\n🏷️   TEST IDS')
        data.testIds.forEach(id => out.push(`  page.getByTestId(${q(id)})`))
      }

      out.push(`\n${hr}\n`)
      console.log(out.join('\n'))
    }

    await use(page)
  },

  /**
   * Opt-in debug ID collector.
   * Every assignment pushes { type: 'log_ids:<key>', description: '<value>' } to testInfo.annotations.
   *
   * Usage:
   *   ids.slug = article.slug
   *   ids.set({ user_id: user.id, article_slug: article.slug })
   */
  ids: async ({}, use, testInfo) => {
    const _push = (key, value) =>
      testInfo.annotations.push({ type: `log_ids:${key}`, description: String(value ?? '') })

    const bag = new Proxy({}, {
      set(target, key, value) {
        if (key === 'set') return false
        target[key] = value
        _push(key, value)
        return true
      }
    })

    Object.defineProperty(bag, 'set', {
      value: (obj) => Object.entries(obj).forEach(([k, v]) => { bag[k] = v }),
      writable: false, enumerable: false, configurable: false
    })

    await use(bag)
  },
})

exports.expect = base.expect
