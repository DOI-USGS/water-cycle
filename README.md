# The Water Cycle

> _A newer version of the software may be available. See https://github.com/DOI-USGS/water-cycle/releases to view all releases._

This repo uses Vue3 to build a website that allows users to zoom and pan the USGS water cycle diagram. See more versions of the water cycle at: [https://usgs.gov/water-cycle](https://usgs.gov/water-cycle)

**The data visualization website can be viewed at [https://water.usgs.gov/vizlab/water-cycle](https://water.usgs.gov/vizlab/water-cycle).**

## Building the website locally

Clone the repo. In the directory, run `npm install` to install the required modules. Once the dependencies have been installed, run `npm run dev` to run locally from your browser.

To build the website locally you'll need `node.js` `v22.14.0` and `npm` `v10.9.2` or higher installed. To manage multiple versions of `npm`, you may [try using `nvm`](https://betterprogramming.pub/how-to-change-node-js-version-between-projects-using-nvm-3ad2416bda7e).

## Preparing the diagram SVGs

The diagram is built from three layers in `src/assets/images/`: the background PNG, `WCD_all_arrows.svg`, and `WCD_all_labels.svg`. Both SVGs are rendered inline so the app can show or hide labels, arrows, and pool background boxes for the beginner and advanced versions. Two scripts in `scripts/` prepare the SVGs after an Illustrator export:

- `scripts/tag-arrows.mjs` tags artwork with term ids from `src/assets/text/terms.json`:
  - `data-arrow-term` on arrow groups, matched by Illustrator layer name (the `ARROW_TERMS` table in the script). Human-use arrows are tagged with all five water-use terms and show or hide as one set, because they form one connected network in the artwork and the layers don't name the use. Precipitation arrows are split between `precipitation_over_land` and `precipitation_over_ocean` by the nearest label.
  - `data-box-term` on pool background boxes, matched to the label inside each box.

  It relies on the `data-term` attributes already on the labels in `WCD_all_labels.svg`. Run it without `--write` to preview the mapping. Arrow layers with no matching term are reported as `UNTAGGED` and always shown.
- `scripts/strip-svg-hidden-layers.mjs` removes hidden Illustrator layers, unused definitions, and unused styles (about 4.6 MB down to about 114 KB and 38 KB). Without it the SVGs bloat the JS bundle.

After replacing either SVG with a new export, run:

```shell
npm run prepare-svgs
```

Both scripts are safe to re-run. Terms flagged `advancedOnly` in `terms.json` are hidden in the beginner version, along with any arrows and boxes tagged with them. To tag a new arrow layer, add its Illustrator layer name to `ARROW_TERMS` and re-run.

## Citation

Corson-Dosch, H.R., Nell, C.S., Volentine, R.E., Archer, A.A., Bechtel, E., Bruce, J.L., Felts, N., Gross, T.A., Lopez-Trujillo, D., Riggs, C.E., and Read, E.K., 2023, The water cycle: U.S. Geological Survey General Information Product 221, 1 sheet, https://doi.org/10.3133/gip221

Corson-Dosch, H., and Nell, C. 2022. The zoomable water cycle. 

## Additional information
* We welcome contributions from the community. See the [guidelines for contributing](https://github.com/DOI-USGS/water-cycle/) to this repository on GitHub.
* [Disclaimer](https://github.com/DOI-USGS/water-cycle/blob/main/DISCLAIMER.md)
* [License](https://github.com/DOI-USGS/water-cycle/blob/main/LICENSE.md)