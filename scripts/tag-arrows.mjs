// Tag the diagram SVGs so the app can show/hide artwork per version
// (beginner/advanced). See "Preparing the diagram SVGs" in README.md.
//
//   node scripts/tag-arrows.mjs           # dry run: print the mapping only
//   node scripts/tag-arrows.mjs --write   # write the tags into the SVGs
//
// Adds:
//   - data-arrow-term="<term id> ..." on arrow groups in WCD_all_arrows.svg
//   - data-box-term="<term id>" on pool background boxes in WCD_all_labels.svg
// Term ids are keys in src/assets/text/terms.json. The labels SVG must already
// have data-term attributes on its labels; those label positions are used to
// match arrows and boxes to terms.
//
// Safe to re-run: existing tags are overwritten. Works on a raw Illustrator
// export or on files already processed by strip-svg-hidden-layers.mjs, because
// it reads Illustrator layer ids/names, not line positions.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(repoRoot, 'src/assets/images')
const arrowsPath = path.join(imagesDir, 'WCD_all_arrows.svg')
const labelsPath = path.join(imagesDir, 'WCD_all_labels.svg')
const terms = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/assets/text/terms.json'), 'utf8'))
const write = process.argv.includes('--write')

// Illustrator arrow layer name -> candidate terms. Layers that repeat get a
// numeric id suffix ("human-use3") but keep the original name in data-name.
// Human-use arrows are deliberately tagged with all five uses, so they show and
// hide as one set. The Illustrator layers don't name the use, and in the
// artwork the arrows form one connected network (shared pipes, a well feeding
// several facilities), so splitting them per use would be difficult. This
// works because all five uses are advancedOnly. Domestic water use has no
// arrow in the artwork.
const HUMAN_USE = ['industrial', 'municipal', 'domestic', 'agricultural', 'grazing']
const ARROW_TERMS = {
  'atmospheric-transport': ['transport_of_moisture_from_ocean_to_land'],
  'human-use': HUMAN_USE,
  'ocean-evaporation': ['ocean_evaporation'],
  'land-evapotranspiration': ['evapotranspiration'],
  'ocean-circulation': ['ocean_circulation'],
  'urban-runoff': ['urban_runoff'],
  river_discharge_to_ocean: ['streamflow_to_ocean'],
  Snowmelt: ['snowmelt'],
  'groundwater-recharge': ['groundwater_recharge'],
  'groundwater-recharge-from-losing-stream': ['groundwater_recharge'],
  'groundwater-discharge-to-ocean': ['groundwater_discharge_to_ocean'],
  'river-discharge-closed-basins': ['streamflow_to_closed_basins'],
  runoff: ['runoff']
}
// The Precipitation layer mixes land and ocean rain arrows. Each leaf group is
// assigned to whichever precipitation label is closest horizontally.
const PRECIP_TERMS = ['precipitation_over_land', 'precipitation_over_ocean']

// --- small AST helpers (svgo's XAST) ----------------------------------------
const elements = (node) => (node.children ?? []).filter((c) => c.type === 'element')
function* descendants(node) {
  for (const child of elements(node)) {
    yield child
    yield* descendants(child)
  }
}
const findById = (root, id) => [...descendants(root)].find((n) => n.attributes.id === id)
const layerName = (node) => node.attributes['data-name'] ?? node.attributes.id

// Mean of every path's starting point ("M x,y"), a cheap stand-in for a bbox.
function centroid(node) {
  const pts = [...descendants(node)]
    .map((n) => n.attributes.d?.match(/^\s*M\s*([\d.-]+)[ ,]([\d.-]+)/))
    .filter(Boolean)
    .map((m) => [Number(m[1]), Number(m[2])])
  if (!pts.length) return null
  return pts.reduce(([sx, sy], [x, y]) => [sx + x / pts.length, sy + y / pts.length], [0, 0])
}

// Run `fn(root)` over an SVG via a one-off svgo plugin and return the output.
function transform(file, fn) {
  return optimize(fs.readFileSync(file, 'utf8'), {
    js2svg: { pretty: true, indent: 2 },
    plugins: [{ name: 'tag', fn: (root) => { fn(root); return null } }]
  }).data
}

// --- label anchors (from the labels SVG) -----------------------------------
// Each [data-term] label's <text> is positioned with transform="translate(x y)".
function labelAnchors(root) {
  const anchors = []
  for (const node of descendants(root)) {
    const term = node.attributes['data-term']
    if (!term) continue
    const text = [...descendants(node)].find((n) => n.name === 'text')
    const m = text?.attributes.transform?.match(/translate\(([\d.-]+)[ ,]([\d.-]+)\)/)
    if (m) anchors.push({ term, x: Number(m[1]), y: Number(m[2]) })
  }
  return anchors
}

function nearest(anchors, candidates, x, y) {
  let best = null
  for (const a of anchors.filter((a) => candidates.includes(a.term))) {
    const d = y == null ? Math.abs(a.x - x) : Math.hypot(a.x - x, a.y - y)
    if (!best || d < best.d) best = { term: a.term, d }
  }
  return best
}

// --- labels SVG: anchors + pool background boxes ----------------------------
let anchors = []
const report = []
const labelsOut = transform(labelsPath, (root) => {
  anchors = labelAnchors(root)
  const boxes = findById(root, 'Pool-background-boxes')
  if (!boxes) throw new Error('Pool-background-boxes layer not found in labels SVG')
  for (const rect of [...descendants(boxes)].filter((n) => n.name === 'rect')) {
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((k) => Number(rect.attributes[k]))
    // The box containing a label's text origin (small left margin because
    // centred text can start just outside the box edge).
    const hit = anchors.find((a) => a.x >= x - 30 && a.x <= x + w && a.y >= y && a.y <= y + h)
    if (!hit) {
      report.push(`box @${x},${y}: no label inside, untagged`)
      delete rect.attributes['data-box-term']
      continue
    }
    rect.attributes['data-box-term'] = hit.term
    report.push(`box @${x},${y} -> ${hit.term}`)
  }
})
if (!anchors.length) throw new Error('No [data-term] labels found in labels SVG')

// --- arrows SVG --------------------------------------------------------------
const arrowsOut = transform(arrowsPath, (root) => {
  const tag = (node, termIds, note) => {
    node.attributes['data-arrow-term'] = termIds.join(' ')
    report.push(`${node.attributes.id.padEnd(42)} -> ${termIds.join(' ')}${note ? ` (${note})` : ''}`)
  }
  for (const layerId of ['Arrows-lines', 'Arrows-shapes']) {
    const layer = findById(root, layerId)
    if (!layer) throw new Error(`${layerId} layer not found in arrows SVG`)
    for (const group of elements(layer)) {
      const name = layerName(group)
      if (name === 'Precipitation') {
        // Named (id'd) groups with no named sub-groups: individual rain arrows.
        const leaves = [...descendants(group)].filter(
          (n) => n.name === 'g' && n.attributes.id && ![...descendants(n)].some((c) => c.name === 'g' && c.attributes.id)
        )
        for (const leaf of leaves) {
          const c = centroid(leaf)
          if (!c) continue
          const best = nearest(anchors, PRECIP_TERMS, c[0])
          tag(leaf, [best.term], `x=${c[0].toFixed(0)}`)
        }
        continue
      }
      const candidates = ARROW_TERMS[name]
      if (!candidates) {
        delete group.attributes['data-arrow-term']
        report.push(`${(group.attributes.id ?? `<${group.name}>`).padEnd(42)} -> UNTAGGED (no matching term)`)
        continue
      }
      tag(group, candidates)
    }
  }
})

// Every tag must point at a real term.
const unknown = [...`${labelsOut}${arrowsOut}`.matchAll(/data-(?:arrow|box)-term="([^"]+)"/g)]
  .flatMap((m) => m[1].split(' '))
  .filter((id) => !terms[id])
console.log(report.join('\n'))
if (unknown.length) throw new Error(`Tags reference unknown term ids: ${[...new Set(unknown)].join(', ')}`)

if (write) {
  fs.writeFileSync(labelsPath, labelsOut)
  fs.writeFileSync(arrowsPath, arrowsOut)
  console.log('\nWrote tags to WCD_all_labels.svg and WCD_all_arrows.svg')
} else {
  console.log('\nDry run. Re-run with --write to save.')
}
