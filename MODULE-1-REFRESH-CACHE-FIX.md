# Module 1 Refresh and Cache Fix

## Investigation result

- No service worker, Cache API usage or web-app manifest is present.
- The flash was primarily caused by historical UI scripts injecting multiple CSS files after the page markup had loaded.
- `site-nav.js` also loaded a second design stylesheet and several sprint styles independently, creating a staggered cascade.
- Firebase Hosting previously had no explicit HTML, JavaScript or CSS cache policy.
- Static HTML intentionally contains basic fallback markup, but the final header/footer and module visibility are applied by the shared navigation/settings scripts.

## Changes

- Replaced staggered public stylesheet injection with one versioned `current-ui.css` entry point.
- Preserved the required cascade order inside that bundle.
- RC4 removes obsolete direct stylesheet links injected by legacy behaviour scripts after their behaviour has loaded.
- Removed RC3’s duplicate stylesheet injection.
- Added Firebase Hosting headers:
  - HTML: `no-cache, no-store, must-revalidate`
  - CSS/JavaScript: `no-cache, must-revalidate`
  - images/fonts: one-hour cache
- The public bundle URL includes a release revision for straightforward preview invalidation.

## Deployment note

Firebase Hosting headers take effect only after the updated project is deployed. After deployment, perform one hard refresh to clear any assets retained from builds deployed before these rules existed. Subsequent refreshes should revalidate the current HTML/CSS/JS without stepping through prior layouts.

