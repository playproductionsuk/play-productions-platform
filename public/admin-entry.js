const liveMode = globalThis.playAdminLiveMode === true;

export async function loadAdminDashboardModules() {
  if (globalThis.playAdminDashboardModulesLoaded) return;
  globalThis.playAdminDashboardModulesLoaded = true;
  try {
    if (liveMode) {
      await import("./admin-live-fields.js");
      await import("./rc1-admin-fields.js");
      await import("./track-admin-foundation.js");
      const coreReady = new Promise(resolve => {
        window.addEventListener("play-admin-live-authenticated", resolve, { once: true });
      });
      await import("./admin-platform.js");
      await Promise.race([
        coreReady,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Live admin data timed out.")), 10000))
      ]);
      await import("./admin-enhancements.js");
      await import("./sprint-admin.js");
      await import("./case-admin.js");
      await import("./module1-admin.js");
      await import("./polish-admin-safe.js");
      await import("./polish-02-admin.js");
      await import("./admin-dj-workflow.js");
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      await import("./admin-fields.js");
      await import("./rc1-admin-fields.js");
      await import("./admin-platform.js");
      await import("./rc1-admin-loader.js");
      await import("./rc2-admin-loader.js");
      await import("./rc3-admin.js");
      await import("./track-admin-foundation.js");
      await import("./admin-dj-workflow.js");
    }
  } catch (error) {
    globalThis.playAdminDashboardModulesLoaded = false;
    const status = document.querySelector("#loginStatus");
    if (status) status.textContent = `Admin dashboard could not start: ${error.message}`;
    console.error("Admin dashboard module loading failed.", error);
    throw error;
  }
}

if (liveMode) {
  import("./admin-live-login.js?v=m1-admin-startup-clean-20260630").catch(error => {
    const status = document.querySelector("#loginStatus");
    if (status) status.textContent = `Live admin login could not start: ${error.message}`;
    console.error("Live admin login failed to initialise.", error);
  });
} else {
  loadAdminDashboardModules().catch(() => {});
}
