const liveMode = globalThis.playAdminLiveMode === true;

export async function loadAdminDashboardModules() {
  if (globalThis.playAdminDashboardModulesLoaded) return;
  globalThis.playAdminDashboardModulesLoaded = true;
  try {
    await import("./admin-fields.js");
    await import("./rc1-admin-fields.js");
    await import("./admin-platform.js");
    await import("./rc1-admin-loader.js");
    await import("./rc2-admin-loader.js");
    await import("./rc3-admin.js");
    await import("./admin-dj-workflow.js");
  } catch (error) {
    globalThis.playAdminDashboardModulesLoaded = false;
    const status = document.querySelector("#loginStatus");
    if (status) status.textContent = `Admin dashboard could not start: ${error.message}`;
    console.error("Admin dashboard module loading failed.", error);
    throw error;
  }
}

if (liveMode) {
  import("./admin-live-login.js?v=m1-live-status-20260630").catch(error => {
    const status = document.querySelector("#loginStatus");
    if (status) status.textContent = `Live admin login could not start: ${error.message}`;
    console.error("Live admin login failed to initialise.", error);
  });
} else {
  loadAdminDashboardModules().catch(() => {});
}
