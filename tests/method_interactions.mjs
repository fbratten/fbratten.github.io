import { chromium } from 'playwright';
import { createHash } from 'node:crypto';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';

const cases = [
  { path: '/methods/5pp/', canvas: '#phaseCanvas', detail: '#phaseDetail h3' },
  { path: '/methods/dialogue-lifecycle/', canvas: '#stateCanvas', detail: '#stateDetail h3' },
  { path: '/methods/orbit/', canvas: '#nodeCanvas', detail: '#nodeDetail h3' },
  { path: '/methods/aics/', canvas: '#atomCanvas', detail: '#atomDetail h3' },
  { path: '/methods/dialectic/', canvas: '#loopCanvas', detail: '#loopDetail h3' },
  { path: '/methods/rigvedan/', canvas: '#anatomyCanvas', detail: '#anatomyDetail h3' },
  { path: '/methods/hermeneutic-didactic/', canvas: '#spineCanvas', detail: '#spineDetail h3' },
  { path: '/methods/dial4/', canvas: '#modeCanvas', detail: '#modeDetail h3' },
  { path: '/methods/dial4plus/', canvas: '#axisCanvas', detail: '#axisDetail h3' },
  { path: '/methods/dial4p-possibility/', canvas: '#stackCanvas', detail: '#stackDetail h3' },
];

const scanPoints = [];
for (const y of [0.12, 0.22, 0.35, 0.5, 0.65, 0.78, 0.88]) {
  for (const x of [0.08, 0.16, 0.26, 0.38, 0.5, 0.62, 0.74, 0.84, 0.92]) {
    scanPoints.push([x, y]);
  }
}

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function exercise(page, spec) {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.goto(`${baseUrl}${spec.path}`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) {
    throw new Error(`${spec.path}: HTTP load failed with ${response?.status()}`);
  }

  const canvas = page.locator(spec.canvas);
  const detail = page.locator(spec.detail);
  await canvas.waitFor({ state: 'visible' });
  await detail.waitFor({ state: 'visible' });
  await page.waitForTimeout(250);

  const box = await canvas.boundingBox();
  if (!box || box.width < 200 || box.height < 200) {
    throw new Error(`${spec.path}: invalid Canvas box ${JSON.stringify(box)}`);
  }

  const dimensions = await canvas.evaluate(element => ({
    cssWidth: element.getBoundingClientRect().width,
    cssHeight: element.getBoundingClientRect().height,
    bitmapWidth: element.width,
    bitmapHeight: element.height,
  }));
  if (!Object.values(dimensions).every(value => Number.isFinite(value) && value > 0)) {
    throw new Error(`${spec.path}: non-finite Canvas dimensions ${JSON.stringify(dimensions)}`);
  }

  const initialDetail = (await detail.textContent())?.trim() || '';
  let selectedPoint = null;
  let selectedDetail = initialDetail;

  for (const [fx, fy] of scanPoints) {
    const x = box.x + box.width * fx;
    const y = box.y + box.height * fy;
    await page.mouse.click(x, y);
    await page.waitForTimeout(35);
    const current = (await detail.textContent())?.trim() || '';
    if (current && current !== initialDetail) {
      selectedPoint = { x, y };
      selectedDetail = current;
      break;
    }
  }

  if (!selectedPoint) {
    throw new Error(`${spec.path}: no Canvas node changed the detail panel from ${JSON.stringify(initialDetail)}`);
  }

  const beforeDrag = await canvas.screenshot();
  const targetX = Math.min(box.x + box.width - 30, selectedPoint.x + Math.max(50, box.width * 0.08));
  const targetY = Math.min(box.y + box.height - 30, selectedPoint.y + Math.max(35, box.height * 0.06));

  await page.mouse.move(selectedPoint.x, selectedPoint.y);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);

  const afterDrag = await canvas.screenshot();
  if (digest(beforeDrag) === digest(afterDrag)) {
    throw new Error(`${spec.path}: Canvas image did not change after dragging the selected node`);
  }

  const postDimensions = await canvas.evaluate(element => ({
    cssWidth: element.getBoundingClientRect().width,
    cssHeight: element.getBoundingClientRect().height,
    bitmapWidth: element.width,
    bitmapHeight: element.height,
  }));
  if (!Object.values(postDimensions).every(value => Number.isFinite(value) && value > 0)) {
    throw new Error(`${spec.path}: Canvas dimensions became invalid after interaction ${JSON.stringify(postDimensions)}`);
  }

  if (pageErrors.length || consoleErrors.length) {
    throw new Error(`${spec.path}: browser errors\npage: ${pageErrors.join('\n')}\nconsole: ${consoleErrors.join('\n')}`);
  }

  console.log(`PASS ${spec.path} ${initialDetail} -> ${selectedDetail}`);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const spec of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
    try {
      await exercise(page, spec);
    } finally {
      await page.close();
    }
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.getByText('Recruiter proof packages', { exact: true }).first().waitFor();
    await page.getByText('Methods, protocols and prompt systems', { exact: true }).first().waitFor();
    const body = await page.textContent('body');
    if (body?.includes('Prompt Engineering Aficionado')) {
      throw new Error('Homepage still contains obsolete Prompt Engineering Aficionado copy');
    }
    console.log('PASS / landing page');
  } finally {
    await page.close();
  }
} finally {
  await browser.close();
}
