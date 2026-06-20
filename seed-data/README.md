# Optional Firestore seed examples

These examples describe the Phase 1 collection shapes. Create equivalent documents in Firebase Console or import them with your preferred Firebase tooling. Do not copy demo customer details into production.

## `settings/services`

```json
{
  "currency": "GBP",
  "masteringBase": 30,
  "masteringAdditionalTrack": 25,
  "mixingBase": 35,
  "mixingPerStem": 6,
  "mixMasterBase": 55,
  "vinylFrom": 55,
  "quoteDisclaimer": "Guide price only; confirmed after listening to the demo."
}
```

## `caseStudies/example-mix`

```json
{
  "artistName": "Example Artist",
  "trackTitle": "Example Track",
  "genre": "UK Garage",
  "serviceType": "Mix + Master",
  "beforeUrl": "",
  "afterUrl": "",
  "testimonial": "Clear communication and the track finally translated everywhere.",
  "rating": 5,
  "published": false,
  "featured": false
}
```

## `projects/example-project`

```json
{
  "projectTitle": "Example Single",
  "customerUid": "REPLACE_WITH_FIREBASE_AUTH_UID",
  "serviceType": "Mix + Master",
  "status": "Quote requested",
  "referenceTracks": [],
  "notes": "",
  "revisions": [],
  "finalDeliverables": [],
  "adminNotes": "",
  "customerVisibleNotes": "Thanks — your request is being reviewed."
}
```
