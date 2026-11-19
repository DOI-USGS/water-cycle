# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
## [Unreleased]
 
Here we track upcoming changes.

### Added
- URL routing for language selection, prepopulated from browser settings
- Clickable diagram labels: selecting a label opens a panel with its definition (side panel on desktop, bottom panel on mobile).
- Interactive on/off toggle in the control panel. Off shows the static diagram with no clickable labels.
- Version dropdown (Beginner/Advanced) that switches definition text. Beginner hides advanced-only labels along with their arrows and label background boxes. The dropdown is hidden when interactivity is off.
- Term definitions for beginner and advanced versions (`src/assets/text/terms.json`)
- `npm run prepare-svgs` script to tag and slim down the diagram SVGs after an Illustrator export (documented in README)

### Changed 
- "Hold Ctrl or Cmd and scroll to zoom" instruction is hidden on mobile
- Diagram to be built from separate background, arrow, and label layers so labels and arrows can respond to the selected version
 
## [1.6.0] - 2026-03-01

### Fixed
- Added alt text 
- Included expandable text description that duplicates inaccessible text on the image

### Changed 
- Improved tabbed naviagtion
- Moved related resources to below diagram 
- Updated control panel at top of diagram. 


## [1.5.0] - 2024-03-01 
### Changed
- Improved navigation capabilities to be able to pan and zoom diagram. 

## [1.4.2] - 2026-03-01
### Added
- New pre-footer code links component 
 
## [1.4.1] - 2024-03-01
 
### Changed

- Switched to DAP google analytics tag

## [1.4] - 2023-06-08
 
### Changed

- Switched to Google Tag Manager for analytics tracking

## [1.3] - 2023-05-19
 
### Changed

- Updated docker and npm setup for build

## [1.2] - 2023-04-07
 
### Changed

- Updated diagram images to new versions consistent with final General Information Product version of the water cycle diagram

## [1.1.1] - 2023-02-14
 
### Added

- Added link to pools and fluxes visualization

### Fixed
- Fixed bug in mobile display

## [1.1] - 2023-02-07
 
### Added

- Added authorship information
- Added link to blog post about diagram

## [1.0.2] - 2022-11-10
 
### Fixed

- Fixed download link for Spanish diagram

## [1.0.1] - 2022-11-10
 
### Added

- Added button to download currently-in-view diagram (English or Spanish)

## [1.0.0] - 2022-10-13
 
### Added

- Public release of zoomable version of English and Spanish water cycle diagrams