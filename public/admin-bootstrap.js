const loginPanel = document.querySelector("#loginPanel");
const adminPortal = document.querySelector("#adminPortal");
const loginStatus = document.querySelector("#loginStatus");

function showLogin(message = "") {
  if (loginPanel) loginPanel.hidden = false;
  if (adminPortal) adminPortal.hidden = true;
  document.body.classList.remove("admin-dashboard-ready");
  if (message && loginStatus) loginStatus.textContent = message;
}

const guard = document.createElement("style");
guard.dataset.adminStateGuard = "true";
guard.textContent = "#loginPanel[hidden],#adminPortal[hidden],.admin-nav[hidden]{display:none!important}";
document.head.append(guard);
document.documentElement.classList.add("ui-ready");
showLogin("Preparing the admin sign-in…");

async function importWithTimeout(path, timeout = 6000) {
  let timer;
  try {
    return await Promise.race([
      import(path),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${path} timed out`)), timeout);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

const recoveryTimer = setTimeout(() => {
  if ((!loginPanel || loginPanel.hidden) && (!adminPortal || adminPortal.hidden)) {
    showLogin("Admin setup is unavailable. Check Firebase settings or use preview mode.");
  }
}, 8000);

window.addEventListener("unhandledrejection", event => {
  console.error("Admin background task failed:", event.reason);
});

try {
  await import("./admin-field-setup.js");
  await import("./rc1-admin-fields.js");
  await import("./admin-platform.js");
  await import("./admin-enhancements.js");

  for (const path of ["./sprint-admin.js", "./module1-admin.js", "./rc1-admin.js", "./rc3-admin.js"]) {
    try {
      await importWithTimeout(path);
    } catch (error) {
      console.warn(`Optional admin module skipped: ${path}`, error);
    }
  }
} catch (error) {
  console.error("Admin startup failed:", error);
  showLogin("Admin could not connect to Firebase/Auth. Check the setup, or use preview mode.");
} finally {
  clearTimeout(recoveryTimer);
  if ((!loginPanel || loginPanel.hidden) && (!adminPortal || adminPortal.hidden)) {
    showLogin("Admin setup is unavailable. Check Firebase settings or use preview mode.");
  }
}
