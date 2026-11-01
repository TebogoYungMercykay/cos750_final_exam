import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'treetutor-progress-v2'

/** A learner who has finished the warm-up, so tests can start on any screen. */
async function asLearner(page: Page, extra: Record<string, unknown> = {}) {
  const saved = {
    name: 'Thandi',
    mode: 'standard',
    theme: 'light',
    warmup: { score: 4, of: 4, confidence: 2 },
    ...extra,
  }
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value)
    },
    [STORAGE_KEY, JSON.stringify(saved)],
  )
}

const button = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' })
const listed = (page: Page, name: string) => page.getByRole('list', { name }).getByRole('listitem')

async function walkToEnd(page: Page) {
  const next = button(page, 'Next step')
  while (await next.isEnabled()) await next.click()
}

test.describe('first visit', () => {
  test.use({ colorScheme: 'dark' })

  test('opens in light mode whatever the system theme', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Binary search trees, before the lecture.')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(242, 245, 248)')
  })
})

test('a new learner goes from welcome through the warm-up into lesson 1', async ({ page }) => {
  await page.goto('./')
  await page.getByLabel('What should we call you?').fill('Thandi')
  await button(page, 'Begin').click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trees, searched step by step.')

  await page.getByRole('link', { name: 'Start the warm-up' }).click()
  await button(page, 'I have used them a little').click()
  await button(page, 'Continue').click()
  for (const answer of ['The one that was put on last', 'The person who arrived first', '6', '4']) {
    await button(page, answer).click()
    await button(page, 'Continue').click()
  }
  await expect(page.getByRole('heading', { name: 'You got 4 of 4.' })).toBeVisible()
  await expect(page.getByText('Badge earned')).toBeVisible()
  await expect(page.getByRole('button', { name: /support mode: standard/i })).toBeVisible()

  await page.getByRole('link', { name: 'Start lesson 1: Trees 101' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trees 101')
})

test('lesson 1: explore a node, then answer the quick check from the keyboard', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/lesson/m1')
  await button(page, 'Start the lesson').click()
  await button(page, 'Next').click()
  await button(page, 'Node 40').click()
  await expect(page.getByText('40 is the root (no parent).')).toBeVisible()

  await button(page, 'Next').click()
  await button(page, 'Next').click()
  await expect(page.getByText('Click the node with the greatest depth.')).toBeVisible()
  await button(page, 'Node 25').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toContainText('Correct.')
  await button(page, /continue/i).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Reflect' })).toBeVisible()
})

test('lesson 5: the same loop walks breadth first with a queue and depth first with a stack', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/lesson/m5')
  await button(page, 'Start the lesson').click()
  for (let i = 0; i < 5; i++) await button(page, 'Next').click()
  await expect(page.getByRole('heading', { name: 'Test your prediction: swap the queue for a stack' })).toBeVisible()

  await walkToEnd(page)
  await expect(listed(page, 'Visit order')).toHaveText(['30', '18', '45', '10', '22', '40', '50', '35'])
  await page.getByRole('radio', { name: /depth first/i }).check()
  await walkToEnd(page)
  await expect(listed(page, 'Visit order')).toHaveText(['30', '18', '10', '22', '45', '40', '35', '50'])
})

test('playground: a search runs step by step to the key', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/playground')
  await button(page, 'Run').click()
  await walkToEnd(page)
  await expect(page.locator('.narration')).toContainText('20 == 20: found after 3 comparisons.')
})

test('the theme toggle switches to dark and is remembered', async ({ page }) => {
  await asLearner(page)
  await page.goto('./')
  await button(page, 'Switch to dark theme').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(button(page, 'Switch to light theme')).toBeVisible()
})

test('the readiness check opens with twelve questions', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/check')
  await button(page, 'Start').click()
  await expect(page.getByText('Question 1 of 12')).toBeVisible()
})

const SCREENS = [
  { path: './#/', heading: 'Trees, searched step by step.' },
  { path: './#/lesson/m2', heading: 'The BST rule' },
  { path: './#/playground', heading: 'The playground' },
  { path: './#/practice', heading: 'Practice gym' },
  { path: './#/practice/LO3', heading: 'Practice gym' },
  { path: './#/check', heading: 'Lecture readiness check' },
  { path: './#/progress', heading: 'My progress' },
]

for (const theme of ['light', 'dark']) {
  for (const { path, heading } of SCREENS) {
    test(`${path} in ${theme}: no WCAG 2.2 AA violations and no sideways scroll`, async ({ page }) => {
      await asLearner(page, { theme })
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
      if (path.includes('lesson')) {
        await button(page, 'Start the lesson').click()
        await button(page, 'Next').click()
        await expect(page.getByRole('img', { name: /A valid BST/ })).toBeVisible()
      }
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([])
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
}

test('the welcome screen has no WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('./')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])
})
