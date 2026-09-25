import { chromium } from "playwright";

const base = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  const response = await page.goto(`${base}/build-log/`, { waitUntil: "networkidle" });
  if (!response || !response.ok()) {
    throw new Error(`Build Log route failed: ${response?.status() ?? "no response"}`);
  }

  await page.locator("h1", { hasText: "What shipped, and why it matters." }).waitFor();
  await page.locator("#count", { hasText: "2 public entries" }).waitFor();

  const entries = page.locator("article.entry");
  const entryCount = await entries.count();
  if (entryCount !== 2) {
    throw new Error(`Expected 2 rendered Build Log entries, got ${entryCount}`);
  }

  const body = await page.locator("body").innerText();
  const required = [
    "Interactive solution-space atlas",
    "When a Rule Is Not a Control",
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
  if (evidenceHrefs.length < 3 || evidenceHrefs.some(url => !url.startsWith("https://"))) {
    throw new Error(`Expected public HTTPS evidence links, got ${JSON.stringify(evidenceHrefs)}`);
  }

  console.log(`Build Log rendered ${entryCount} public entries at ${base}/build-log/.`);
} finally {
  await browser.close();
}
