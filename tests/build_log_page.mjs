import { chromium } from "playwright";

const base = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  const response = await page.goto(`${base}/build-log/`, { waitUntil: "networkidle" });
  if (!response || !response.ok()) {
    throw new Error(`Build Log route failed: ${response?.status() ?? "no response"}`);
  }

  const manifestResponse = await page.request.get(`${base}/build-log/entries.json`);
  if (!manifestResponse.ok()) {
    throw new Error(`Build Log manifest failed: ${manifestResponse.status()}`);
  }
  const manifest = await manifestResponse.json();
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("Build Log manifest must contain at least one entry");
  }
  const expectedCount = manifest.length;

  await page.locator("h1", { hasText: "What shipped, and why it matters." }).waitFor();
  await page.locator("#count", { hasText: `${expectedCount} public entries` }).waitFor();

  const entries = page.locator("article.entry");
  const entryCount = await entries.count();
  if (entryCount !== expectedCount) {
    throw new Error(`Expected ${expectedCount} rendered Build Log entries, got ${entryCount}`);
  }

  const body = await page.locator("body").innerText();
  const required = [
    "Governed public proof-of-work Build Log",
    "Interactive solution-space atlas",
    "When a Rule Is Not a Control",
    "Broker Lane Sandbox source-first evidence card",
    "Why it matters:",
    "recorded work != public work",
  ];
  for (const token of required) {
    if (!body.includes(token)) {
      throw new Error(`Rendered Build Log is missing ${JSON.stringify(token)}`);
    }
  }

  const forbidden = ["/mnt/", "D:/", "C:/", "file_000"];
  for (const token of forbidden) {
    if (body.includes(token)) {
      throw new Error(`Rendered Build Log exposes forbidden private/local marker ${JSON.stringify(token)}`);
    }
  }

  const evidenceHrefs = await page.locator(".evidence a").evaluateAll(nodes => nodes.map(node => node.href));
  if (evidenceHrefs.length < expectedCount || evidenceHrefs.some(url => !url.startsWith("https://"))) {
    throw new Error(`Expected at least one public HTTPS evidence link per entry, got ${JSON.stringify(evidenceHrefs)}`);
  }

  console.log(`Build Log rendered ${entryCount} public entries at ${base}/build-log/.`);
} finally {
  await browser.close();
}
