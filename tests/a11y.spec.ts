import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

import { getFinalUrls } from './get-urls';

const urls = await getFinalUrls();

test.describe('Accessibility tests', () => {
  // Preventing some routes as they need to be fixed in their own packages
  const denylist = ['/author-map', '/buzzword-bingo', '/picture-in-picture-js'];

  for (const url of urls) {
    if (denylist.some((path) => url.endsWith(path))) {
      continue;
    }

    test(`for ${url}`, async ({ page }) => {
      await page.goto(url);

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
