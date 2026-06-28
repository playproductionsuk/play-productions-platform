# Module 1 Critical Fixes

## Root causes

### Admin blank/hang

Two optional admin enhancement paths could prevent startup:

- RC6/RC7 DJ observers rewrote badge text inside their own observed subtree on every callback, creating self-triggering observer work.
- The RC2 admin enhancement observed optional `#adminTracks` and `#moduleDjList` targets without guards and performed an unbounded top-level Firestore read.

The badge updates now occur only when text genuinely changes. The obsolete RC2 enhancement import is excluded from startup. `admin-platform.js` also reveals the base login UI immediately and normalises form IDs, names and autocomplete attributes.

### Public track loading

RC7’s track observer repeatedly rewrote `In Cart` text inside the subtree it observed. Promo breadcrumb updates could do the same. These writes are now conditional, and all observer targets are guarded. Existing bounded Firebase/local catalogue fallback remains active.

## Additional fixes

- Hamburger link generation continues to omit disabled Module 2 links.
- Existing RC7 Cart/Checkout/account spacing remains unchanged.
- DJ Promo’s Actions / Downloads heading is centred.
- Footer and top social icons share one lime filter and consistent section sizing.
- Music Store, mini-player, Customer Portal and filter layouts were not changed.

## Live verification still required

- Deploy and verify unauthenticated admin login, preview dashboard and authenticated admin.
- Test public Music and DJ Promo track details with empty and populated carts.
- Complete Firebase/Auth, payment, Storage, email and end-to-end buyer/DJ setup.

