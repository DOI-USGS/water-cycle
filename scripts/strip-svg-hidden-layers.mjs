// Strip hidden Illustrator layers and unused definitions from the diagram SVGs
// so they can be inlined without bloating the JS bundle. See "Preparing the
// diagram SVGs" in README.md.
//
//   node scripts/strip-svg-hidden-layers.mjs
//
// Each Illustrator export contains the whole document (background, inset,
// other artboards) with the unused layers set to display:none. This removes:
//   - elements hidden via display:none / visibility:hidden / opacity 0
//   - groups left empty by that
//   - <defs> entries (gradients, filters, masks, embedded images) that nothing
//     references any more
//   - unused rules in the embedded <style>
// Everything else, including ids and the data-term / data-arrow-term /
// data-box-term tags the app relies on, is left as is. Safe to re-run.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = ['WCD_all_arrows.svg', 'WCD_all_labels.svg'].map((f) => path.join(repoRoot, 'src/assets/images', f))

const REF_RE = /url\(#([^)]+)\)|href="#([^"]+)"/g

// svgo's built-ins keep unreferenced <defs> children, which are most of the
// leftover size, so remove any that no attribute or <style> rule points to.
// multipass repeats this until defs only referenced by other unused defs are
// gone too.
const removeUnreferencedDefs = {
  name: 'removeUnreferencedDefs',
  fn: (root) => {
    const refs = new Set()
    const collect = (node) => {
      for (const value of Object.values(node.attributes ?? {})) {
        for (const m of String(value).matchAll(REF_RE)) refs.add(m[1] ?? m[2])
      }
      if (node.type === 'text' || node.type === 'cdata') {
        for (const m of node.value.matchAll(REF_RE)) refs.add(m[1] ?? m[2])
      }
      node.children?.forEach(collect)
    }
    collect(root)
    return {
      element: {
        enter: (node, parent) => {
          if (parent.type !== 'element' || parent.name !== 'defs' || node.name === 'style') return
          if (!refs.has(node.attributes.id)) parent.children = parent.children.filter((c) => c !== node)
        }
      }
    }
  }
}

const countTags = (svg) => (svg.match(/data-(?:arrow-|box-)?term=/g) ?? []).length

for (const file of files) {
  const input = fs.readFileSync(file, 'utf8')
  const output = optimize(input, {
    multipass: true,
    js2svg: { pretty: true, indent: 2 },
    plugins: [
      'removeHiddenElems',
      'removeEmptyContainers',
      removeUnreferencedDefs,
      // The SVG is only styled by its own <style>, so unused-rule detection is safe.
      { name: 'minifyStyles', params: { usage: { force: true } } }
    ]
  }).data
  if (countTags(output) !== countTags(input)) {
    throw new Error(`${path.basename(file)}: stripping changed the number of tags, not writing`)
  }
  fs.writeFileSync(file, output)
  const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} KB`
  console.log(`${path.basename(file)}: ${kb(input)} -> ${kb(output)}`)
}
