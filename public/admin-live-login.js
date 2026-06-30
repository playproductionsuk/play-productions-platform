import { firebaseApp, firebaseReady, db } from "./platform-data.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { loadAdminDashboardModules } from "./admin-entry.js";

const form = document.querySelector("#adminLoginForm");
const login = document.querySelector("#loginPanel");
const portal = document.querySelector("#adminPortal");
const status = document.querySelector("#loginStatus");
const preview = document.querySelector("#previewAdminButton");
const submit = form?.querySelector('button[type="submit"]');
let retainedError = "";

globalThis.firebaseReady = firebaseReady;
preview?.remove();
login.hidden = false;
portal.hidden = true;

function showError(message) {
  retainedError = message;
  document.documentElement.classList.remove("admin-starting");
  login.hidden = false;
  portal.hidden = true;
  if (status) status.textContent = message;
  if (submit) submit.disabled = false;
}

function showAuthenticatedDashboard(account) {
  document.querySelector(".admin-preview-note")?.remove();
  if (status) status.textContent = "";
  const adminUser = document.querySelector("#adminUser");
  if (adminUser) adminUser.textContent = account.email || "Authorised admin";
  login.hidden = true;
  login.setAttribute("hidden", "");
  portal.hidden = false;
  portal.removeAttribute("hidden");
  document.documentElement.classList.remove("admin-starting");
}

if (!form) throw new Error("The live admin login form is missing.");

if (!firebaseReady || !firebaseApp || !db) {
  showError("Firebase is not configured for this deployment. Check firebase-config.js.");
} else {
  const auth = getAuth(firebaseApp);
  submit.disabled = false;
  status.textContent = "Sign in with an authorised Play Productions admin account.";

  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopPropagation();
    retainedError = "";
    submit.disabled = true;
    status.textContent = "Signing in…";
    try {
      await signInWithEmailAndPassword(
        auth,
        form.elements.email.value.trim(),
        form.elements.password.value
      );
    } catch (error) {
      showError(`Sign-in failed: ${error.message}`);
    }
  });

  onAuthStateChanged(auth, async account => {
    if (!account) {
      if (retainedError) showError(retainedError);
      else {
        login.hidden = false;
        portal.hidden = true;
        status.textContent = "Sign in with an authorised Play Productions admin account.";
        submit.disabled = false;
      }
      return;
    }
    submit.disabled = true;
    status.textContent = "Checking admin permission…";
    try {
      const adminRecord = await getDoc(doc(db, "admins", account.uid));
      if (!adminRecord.exists() || adminRecord.data().active === false) {
        retainedError = "This account does not have active admin permission.";
        await signOut(auth);
        showError(retainedError);
        return;
      }
      if (!document.querySelector("#previewAdminButton")) {
        const previewBlocker = document.createElement("button");
        previewBlocker.id = "previewAdminButton";
        previewBlocker.type = "button";
        previewBlocker.hidden = true;
        previewBlocker.setAttribute("aria-hidden", "true");
        document.body.appendChild(previewBlocker);
      }
      globalThis.playAdminLiveAuthenticated = true;
      document.documentElement.classList.add("admin-starting");
      status.textContent = "Loading admin dashboard…";
      await loadAdminDashboardModules();
      showAuthenticatedDashboard(account);
      await new Promise(resolve => requestAnimationFrame(resolve));
      showAuthenticatedDashboard(account);
      window.dispatchEvent(new Event("play-admin-visibility-change"));
    } catch (error) {
      retainedError = `Admin permission check failed: ${error.message}`;
      if (auth.currentUser) await signOut(auth).catch(() => {});
      showError(retainedError);
    }
  });
}
