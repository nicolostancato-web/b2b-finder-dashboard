import * as fs from 'fs'
import * as path from 'path'
import type { Page, TestInfo } from '@playwright/test'

export interface BugReport {
  timestamp: string
  test_name: string
  url: string
  expected: string
  actual: string
  screenshot_path: string | null
  console_errors: string[]
  browser: string
  viewport: string
  duration_ms: number
}

export async function captureBugReport(
  page: Page,
  testInfo: TestInfo,
  expected: string,
  actual: string,
  consoleErrors: string[]
): Promise<BugReport> {
  const dir = 'test-results/screenshots'
  fs.mkdirSync(dir, { recursive: true })

  const screenshotFile = path.join(dir, `bug-${Date.now()}.png`)
  await page.screenshot({ path: screenshotFile, fullPage: true }).catch(() => {})

  const report: BugReport = {
    timestamp: new Date().toISOString(),
    test_name: testInfo.title,
    url: page.url(),
    expected,
    actual,
    screenshot_path: screenshotFile,
    console_errors: consoleErrors,
    browser: 'chromium',
    viewport: '1280x800',
    duration_ms: Date.now() - testInfo.startTime.getTime(),
  }

  const reportDir = 'test-results'
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(
    path.join(reportDir, 'last-bug-report.json'),
    JSON.stringify(report, null, 2)
  )

  return report
}

export function formatGitHubIssueBody(report: BugReport): string {
  return `## Bug Rilevato Automaticamente

**Test:** \`${report.test_name}\`
**URL:** \`${report.url}\`
**Timestamp:** ${report.timestamp}
**Durata:** ${report.duration_ms}ms

### Risultato atteso
${report.expected}

### Risultato ottenuto
${report.actual}

### Console Errors
${report.console_errors.length
  ? report.console_errors.map(e => `- \`${e}\``).join('\n')
  : 'Nessun errore console'}

### Screenshot
Path locale: \`${report.screenshot_path}\`

### Environment
- Browser: ${report.browser}
- Viewport: ${report.viewport}

---
*Issue creato automaticamente dal Self-Healing Test Agent*`
}
