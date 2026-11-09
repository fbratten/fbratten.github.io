import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = root + 'assets/vendor/';
await mkdir(output, {recursive: true});
for (const [source, target] of [
  ['three/build/three.module.min.js', 'three.module.min.js'],
  ['three/LICENSE', 'THREE-LICENSE.txt'],
  ['chart.js/LICENSE.md', 'CHART-LICENSE.txt'],
  ['@kurkle/color/LICENSE.md', 'COLOR-LICENSE.txt'],
]) {
  await copyFile(root + 'node_modules/' + source, output + target);
}
const chart = await readFile(root + 'node_modules/chart.js/dist/chart.umd.js', 'utf8');
await writeFile(output + 'chart.umd.js', chart.replace(/^\/\/# sourceMappingURL=.*$/m, '').trimEnd() + '\n');
const controls = await readFile(root + 'node_modules/three/examples/jsm/controls/OrbitControls.js', 'utf8');
if (!controls.includes("from 'three';")) throw new Error('Review the upstream OrbitControls imports');
await writeFile(output + 'OrbitControls.js', controls.replace("from 'three';", "from './three.module.min.js';"));
