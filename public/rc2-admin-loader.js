// RC2 admin enhancements are intentionally excluded from the critical startup path.
// Their missing-field and DJ-note observers assumed optional nodes always existed and
// could block or crash the login page. Later guarded modules provide the launch UI.
globalThis.rc2AdminSkipped=true;
