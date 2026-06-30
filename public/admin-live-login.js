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

globalThis.firebaseReady = firebaseReady;
preview?.remove();
login.hidden = false;
portal.hidden = true;

function showError(message) {
  login.hidden = false;
  portal.hidden = true;
  if (status) status.textContent = message;
  if (submit) submit.disabled = false;
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
      showError("Sign in with an authorised Play Productions admin account.");
      return;
    }
    submit.disabled = true;
    status.textContent = "Checking admin permission…";
    try {
      const adminRecord = await getDoc(doc(db, "admins", account.uid));
      if (!adminRecord.exists() || adminRecord.data().active === false) {
        await signOut(auth);
        showError("This account does not have active admin permission.");
        return;
      }
      document.querySelector(".admin-preview-note")?.remove();
      document.querySelector("#adminUser").textContent = account.email || "Authorised admin";
      if (!document.querySelector("#previewAdminButton")) {
        const previewBlocker = document.createElement("button");
        previewBlocker.id = "previewAdminButton";
        previewBlocker.type = "button";
        previewBlocker.hidden = true;
        previewBlocker.setAttribute("aria-hidden", "true");
        document.body.appendChild(previewBlocker);
      }
      globalThis.playAdminLiveAuthenticated = true;
      login.hidden = true;
      portal.hidden = false;
      await loadAdminDashboardModules();
      window.dispatchEvent(new Event("play-admin-visibility-change"));
    } catch (error) {
      if (auth.currentUser) await signOut(auth).catch(() => {});
      showError(`Admin permission check failed: ${error.message}`);
    }
  });
}
