import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async({page}) => {
  // The "*/**" allows us to have a wildcard, so the only thing we care about is the actual endpoint requests at the end.
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
  })
})

  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a test title"
    responseBody.articles[0].description = "This is a description"

    await route.fulfill({
      body:JSON.stringify(responseBody)
    })
  })


  await page.goto('https://conduit.bondaracademy.com')
  // wait is needed before the script is so short that the mock doesnt have time to react before the page loads
  await page.waitForTimeout(1000)
})

test('has title', async ({ page }) => {
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a description')
});