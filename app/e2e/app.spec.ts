import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'treetutor-progress-v2'
const ALL_TOURS = ['home', 'lesson', 'lesson-steps', 'player', 'question', 'playground']

/** A learner who has finished the warm-up and seen every tour, so tests can start on any screen. */
async function asLearner(page: Page, extra: Record<string, unknown> = {}) {
  const saved = {
    name: 'Thandi',
    mode: 'standard',
    theme: 'light',
    warmup: { score: 4, of: 4, confidence: 2 },
    toursSeen: ALL_TOURS,
    ...extra,
  }
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value)
    },
    [STORAGE_KEY, JSON.stringify(saved)],
  )
}

const tour = (page: Page) => page.getByRole('dialog')

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
  await expect(tour(page)).toContainText('Getting started')
  await button(page, 'Skip tour').click()
  await expect(tour(page)).toBeHidden()

  await page.getByRole('link', { name: 'Start the warm-up' }).click()
  await button(page, 'I have used them a little').click()
  await button(page, 'Continue').click()
  await expect(tour(page)).toContainText('Answering questions')
  await page.keyboard.press('Escape')
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
  await expect(page.getByRole('img', { name: /What is a tree\?.*8: root/ })).toBeVisible()
  await button(page, 'Next').click()
  await button(page, 'Node 40').click()
  await expect(page.getByText('40 is the root (no parent).')).toBeVisible()

  await button(page, 'Next').click()
  await expect(
    page.getByText('Four Node objects and 5 null links: 3.left, 6.left, 6.right, 10.left, 10.right.'),
  ).toBeVisible()
  await button(page, 'Next').click()
  await expect(page.getByText('Height 4: the deepest node, 35, is on level 4.')).toBeVisible()
  await button(page, 'Next').click()
  await expect(page.getByText('Click the node on the deepest level.')).toBeVisible()
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
  for (let i = 0; i < 6; i++) await button(page, 'Next').click()
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

test('playground: the active preset is marked, and editing the tree clears it', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/playground')
  const preset = (name: string) => button(page, name)
  await expect(preset('Lecture example')).toHaveAttribute('aria-pressed', 'true')
  await preset('Uneven').click()
  await expect(preset('Uneven')).toHaveAttribute('aria-pressed', 'true')
  await expect(preset('Lecture example')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByText('Using the preset: Uneven.')).toBeVisible()
  await page.getByLabel('Keys to insert').fill('99')
  await button(page, 'Add').click()
  await expect(page.getByText('Using your own tree.')).toBeVisible()
  await expect(page.locator('.chip-button[aria-pressed="true"]')).toHaveCount(0)
})

test('playground: Run scrolls to the animation and focuses it', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/playground')
  await button(page, 'Run').click()
  const animation = page.getByRole('region', { name: 'Animation' })
  await expect(animation).toBeFocused()
  await expect(animation).toBeInViewport({ ratio: 0.5 })
})

test.describe('tours', () => {
  test('a new learner can step through the standard tour with buttons and keys', async ({ page }) => {
    await asLearner(page, { toursSeen: [] })
    await page.goto('./')
    await expect(tour(page)).toContainText('1 of 5')
    await button(page, 'Next').click()
    await expect(tour(page)).toContainText('The five sections')
    await page.keyboard.press('ArrowRight')
    await expect(tour(page)).toContainText('Your next step')
    await page.keyboard.press('ArrowLeft')
    await expect(tour(page)).toContainText('The five sections')
    for (let i = 0; i < 3; i++) await button(page, 'Next').click()
    await expect(tour(page)).toContainText('Help is always here')
    await button(page, 'Done').click()
    await expect(tour(page)).toBeHidden()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trees, searched step by step.')
    await expect(tour(page)).toBeHidden()
  })

  test('guided mode shows the longer tour, and Help replays it', async ({ page }) => {
    await asLearner(page, { mode: 'guided', toursSeen: [] })
    await page.goto('./')
    await expect(tour(page)).toContainText('1 of 9')
    await page.keyboard.press('Escape')
    await expect(tour(page)).toBeHidden()
    await button(page, 'Show me around this screen').click()
    await expect(tour(page)).toContainText('Welcome to TreeTutor')
  })

  test('every card stays on screen, even in a short window with the largest text', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 600 })
    await asLearner(page, { mode: 'guided', textSize: 'larger', toursSeen: [] })
    await page.goto('./')
    for (let i = 1; i <= 9; i++) {
      await expect(tour(page)).toContainText(`${i} of 9`)
      const action = button(page, i === 9 ? 'Done' : 'Next')
      await expect(action).toBeInViewport({ ratio: 1 })
      if (i === 6) {
        const scan = await new AxeBuilder({ page }).include('.tour-card').analyze()
        expect(scan.violations.map((v) => v.id)).toEqual([])
      }
      await action.click()
    }
    await expect(tour(page)).toBeHidden()
  })

  test('focus returns to where it was after tours that run one after another', async ({ page }) => {
    await asLearner(page)
    await page.goto('./#/playground/search/sorted/60')
    const help = button(page, 'Show me around this screen')
    await help.click()
    await expect(tour(page)).toContainText('The playground')
    await page.keyboard.press('Escape')
    await expect(tour(page)).toContainText('Reading an animation')
    await page.keyboard.press('Escape')
    await expect(tour(page)).toBeHidden()
    await expect(help).toBeFocused()
  })

  test('the first animation explains itself, and the tour passes an accessibility scan', async ({ page }) => {
    await asLearner(page, { toursSeen: ALL_TOURS.filter((t) => t !== 'player') })
    await page.goto('./#/playground')
    await button(page, 'Run').click()
    await expect(tour(page)).toContainText('Reading an animation')
    await expect(page.getByRole('heading', { name: 'The tree', level: 2 })).toBeFocused()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([])
  })
})

test('guided mode explains every step of an animation', async ({ page }) => {
  await asLearner(page, { mode: 'guided' })
  await page.goto('./#/playground')
  await button(page, 'Run').click()
  await expect(page.locator('.narration')).toContainText('Step 1 of')
  await expect(page.locator('.code-note')).toContainText('Line 2.')
  await button(page, 'Next step').click()
  await button(page, 'Next step').click()
  await expect(page.locator('.narration')).toContainText('Why:')
})

test('a demo seed makes generated questions repeat after a reload, and another seed changes them', async ({ page }) => {
  await asLearner(page)
  const generatedTree = async (seed: number) => {
    await page.goto(`./?seed=${seed}#/check`)
    await page.reload()
    await button(page, 'Start').click()
    await button(page, 'Every node except the root has exactly one parent').click()
    await button(page, /continue/i).click()
    await expect(page.getByText('Question 2 of 12')).toBeVisible()
    return page.locator('.question .tree-key').allTextContents()
  }
  const first = await generatedTree(42)
  expect(first.length).toBeGreaterThan(0)
  expect(await generatedTree(42)).toEqual(first)
  expect(await generatedTree(43)).not.toEqual(first)
  await expect(page.getByText('Demo seed 43: generated questions repeat.')).toBeVisible()
})

test('a review link opens the playground with its animation already running', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/playground/search/sorted/60')
  await expect(button(page, 'Sorted input')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { name: 'BST search, key 60' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Animation' })).toBeFocused()
})

test('a review link followed inside the app opens with its animation in view and focused', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/check')
  await page.evaluate(() => {
    window.location.hash = '#/playground/search/sorted/60'
  })
  const animation = page.getByRole('region', { name: 'Animation' })
  await expect(animation).toBeFocused()
  await expect(animation).toBeInViewport({ ratio: 0.5 })
})

test('an insert link adds the key to the tree it shows', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/playground/insert/lecture/7')
  await expect(page.getByText('Using your own tree.')).toBeVisible()
  await expect(page.getByRole('img', { name: /Your binary search tree\..*Level 4: 7\./ })).toBeVisible()
})

test('a wrong option explains the misconception behind it', async ({ page }) => {
  await asLearner(page)
  await page.goto('./#/lesson/m1')
  await expect(page.getByText('What you already know')).toBeVisible()
  await button(page, /skip to the checkpoint/).click()
  await button(page, 'Node 50').click()
  await button(page, /continue/i).click()
  await button(page, 'Node 1').click()
  await button(page, /continue/i).click()
  await button(page, '20').click()
  await expect(page.locator('.feedback.is-wrong')).toHaveText(
    'Not quite. 20 is the grandparent of 25: two edges up. The parent is the node one edge up.',
  )
})

test('progress: text size applies to the whole page, and the lecture card can be printed', async ({ page }) => {
  await asLearner(page, { results: { LO1: [1, 1, 1], LO3: [0.3] } })
  await page.goto('./#/progress')
  await page.getByRole('radio', { name: 'Larger' }).click()
  await expect(page.getByRole('radio', { name: 'Larger' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-text', 'larger')
  await expect(page.locator('html')).toHaveCSS('font-size', '20px')
  const card = page.getByRole('region', { name: 'My lecture card' })
  await expect(card.locator('.card-list').first()).toContainText('Tree vocabulary')
  await expect(card).toContainText('Search and insert')
  await expect(button(page, 'Print or save as PDF')).toBeVisible()
})

test('the app never contacts another server', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const elsewhere: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) elsewhere.push(r.url())
  })
  await asLearner(page)
  for (const path of ['./', './#/lesson/m1', './#/playground', './#/practice/LO2', './#/check', './#/progress']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
  expect(elsewhere).toEqual([])
})

test('on a phone, the tab bar sits at the bottom and leaves the header controls uncovered', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'the tab bar moves to the bottom only on small screens')
  await asLearner(page)
  await page.goto('./')
  const tabs = await page.getByRole('navigation', { name: 'Main' }).boundingBox()
  expect(Math.round(tabs!.y + tabs!.height)).toBe(page.viewportSize()!.height)
  for (const name of ['Show me around this screen', /support mode/i]) {
    const control = button(page, name)
    const box = (await control.boundingBox())!
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('button')?.getAttribute('aria-label') ?? null,
      [box.x + box.width / 2, box.y + box.height / 2],
    )
    expect(hit).toBe(await control.getAttribute('aria-label'))
  }
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
