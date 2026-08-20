/*
 * Configuration Playwright — HippoJob.
 *
 * Why `channel: 'chrome'` : le projet est une page HTML unique, sans build et sans
 * dépendance d'exécution. Réutiliser le Chrome déjà installé évite de télécharger un
 * Chromium de ~130 Mo pour tester un fichier de 3 500 lignes. Si Chrome n'est pas
 * disponible sur la machine, faire `npx playwright install chromium` et retirer la ligne
 * `channel` ci-dessous.
 *
 * Why un serveur HTTP et pas file:// : localStorage est indisponible en file://, et tout
 * l'outil repose dessus.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? 'list' : [['list']],
  use: {
    baseURL: 'http://localhost:8777',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }
  ],
  webServer: {
    command: 'python3 -m http.server 8777',
    url: 'http://localhost:8777/index.html',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore'
  }
});
