/* WA Canvas — repo validator. No dependencies; this is what CI runs.
 *   node tools/validate.js
 *
 * Checks:
 *   1. every .js file parses
 *   2. every path referenced by manifest.json exists
 *   3. every theme has a label, a description and all nine colour keys
 *   4. the manifest version matches package.json
 *   5. nothing outside the service worker makes a network request
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const os = require('os');

const ROOT = path.join(__dirname, '..');
let failures = 0;
let sectionFailures = 0;

const fail = m => { console.error('  ✗ ' + m); failures++; sectionFailures++; };
const ok = m => console.log('  ✓ ' + m);
const section = t => { console.log('\n' + t); sectionFailures = 0; };
const okIfClean = m => { if (!sectionFailures) ok(m); };

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT);

/* ---- 1. syntax ---- */
section('Syntax');
const jsFiles = files.filter(f => f.endsWith('.js'));

/* `node --check` parses a .js file as CommonJS, which rejects import/export.
 * Copying to .mjs is the simplest way to get a real ES-module parse without
 * pulling in a parser dependency. */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wac-check-'));
for (const f of jsFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const isModule = /^\s*(import|export)\b/m.test(src);
  let target = f;
  if (isModule) {
    target = path.join(tmp, path.basename(f, '.js') + '.mjs');
    fs.writeFileSync(target, src);
  }
  try {
    cp.execFileSync(process.execPath, ['--check', target], { stdio: 'pipe' });
  } catch (e) {
    fail(path.relative(ROOT, f) + '\n' +
      String(e.stderr || e.message).trim().split('\n').slice(0, 3).join('\n'));
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
okIfClean(jsFiles.length + ' JavaScript files parse (' +
  jsFiles.filter(f => /^\s*(import|export)\b/m.test(fs.readFileSync(f, 'utf8'))).length + ' as ES modules)');

/* ---- 2. manifest ---- */
section('Manifest');
let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  ok('manifest.json is valid JSON');
} catch (e) {
  fail('manifest.json does not parse: ' + e.message);
}

if (manifest) {
  const refs = [
    ...(manifest.content_scripts || []).flatMap(c => [...(c.js || []), ...(c.css || [])]),
    manifest.background && manifest.background.service_worker,
    manifest.action && manifest.action.default_popup,
    manifest.options_page,
    ...Object.values(manifest.icons || {}),
    ...Object.values((manifest.action && manifest.action.default_icon) || {}),
    ...(manifest.web_accessible_resources || []).flatMap(r => r.resources || [])
  ].filter(Boolean);

  const missing = [...new Set(refs)].filter(r => !fs.existsSync(path.join(ROOT, r)));
  missing.forEach(m => fail('manifest references a missing file: ' + m));
  if (!missing.length) ok([...new Set(refs)].length + ' referenced paths all resolve');

  if (manifest.manifest_version !== 3) fail('manifest_version must be 3');

  const pkgPath = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.version !== manifest.version) {
      fail(`version mismatch: manifest ${manifest.version} vs package.json ${pkg.version}`);
    } else ok('version ' + pkg.version + ' matches across manifest and package.json');
  }
}

/* ---- 3. themes ---- */
section('Themes');
const COLOR_KEYS = ['accent', 'sidebar', 'chatBackground', 'header', 'surface',
                    'text', 'mutedText', 'outgoingBubble', 'incomingBubble'];
const themeSrc = fs.readFileSync(path.join(ROOT, 'shared/themes.js'), 'utf8');
const themeMatch = themeSrc.match(/export const THEMES = (\{[\s\S]*?\});\s*\nexport function/);

if (!themeMatch) {
  fail('could not read THEMES out of shared/themes.js');
} else {
  let THEMES;
  try { THEMES = new Function('return ' + themeMatch[1])(); }
  catch (e) { fail('THEMES does not evaluate: ' + e.message); }

  if (THEMES) {
    const ids = Object.keys(THEMES);
    for (const id of ids) {
      const t = THEMES[id];
      if (!t.label) fail(`theme "${id}" has no label`);
      if (!t.description) fail(`theme "${id}" has no description`);
      if (id === 'custom') continue;                 // intentionally empty
      const missingKeys = COLOR_KEYS.filter(k => !t.colors || !t.colors[k]);
      if (missingKeys.length) {
        fail(`theme "${id}" is missing colours: ${missingKeys.join(', ')}` +
             ' — a missing key inherits whatever was applied before and looks broken');
      }
      for (const k of Object.keys(t.colors || {})) {
        if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(t.colors[k])) {
          fail(`theme "${id}".${k} is not a hex colour: ${t.colors[k]}`);
        }
      }
    }
    okIfClean(ids.length + ' themes, all with complete palettes');
  }
}

/* ---- 4. network surface ---- */
section('Network surface');
const offenders = [];
for (const f of jsFiles) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel === 'background/service-worker.js' || rel.startsWith('tools/')) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new\s+WebSocket/.test(src)) {
    offenders.push(rel);
  }
}
offenders.forEach(o => fail(
  o + ' makes a network request. The AI call in background/service-worker.js is ' +
  'meant to be the only one — see PRIVACY.md, which promises exactly that'));
if (!offenders.length) ok('the service worker is still the only place that talks to the network');

/* ---- done ---- */
console.log('');
if (failures) {
  console.error(failures + ' problem' + (failures === 1 ? '' : 's') + ' found.');
  process.exit(1);
}
console.log('All checks passed.');
