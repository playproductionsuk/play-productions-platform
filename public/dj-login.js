import { firebaseApp, firebaseReady, db } from "./platform-data.js";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const form = document.querySelector("#djLoginForm");
const status = document.querySelector("#djLoginStatus");
const submitButton = form.querySelector('button[type="submit"],button:not([type])');
const demo = false;
const reason = new URLSearchParams(location.search).get("reason");
const auth = firebaseReady ? getAuth(firebaseApp) : null;

document.querySelector(".auth-card .subcopy").textContent =
  "Use the email address from your approved DJ application and the password you created from your secure invitation.";

form.insertAdjacentHTML(
  "afterend",
  '<button id="forgotDjPassword" class="button ghost" type="button">Forgot password?</button>'
);

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

async function approved(user) {
  const profile = await getDoc(doc(db, "users", user.uid));
  return profile.exists() && profile.data().djAccess === true;
}

async function requireApproved(user) {
  if (await approved(user)) return true;
  await signOut(auth);
  setStatus("This account has not been approved for DJ promo access, or its access has been withdrawn.", true);
  return false;
}

document.querySelector("#forgotDjPassword").addEventListener("click", async () => {
  const email = form.email.value.trim();
  if (!email) {
    setStatus("Enter your approved DJ email address first.", true);
    return;
  }
  if (!firebaseReady || demo) {
    setStatus("Password reset is unavailable in demo mode or until Firebase Auth is configured.", true);
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email, { url: `${location.origin}/dj-login.html` });
    setStatus("Password reset email sent. Check your inbox.");
  } catch (error) {
    setStatus(error.message || "Reset email could not be sent.", true);
  }
});

if (demo) {
  submitButton.disabled = true;
  setStatus("DJ login demo mode. Use the live page without ?demo=1 to sign in.");
} else if (!firebaseReady) {
  submitButton.disabled = true;
  setStatus("DJ login is unavailable because the Firebase web-app configuration is incomplete.", true);
} else {
  submitButton.disabled = false;
  if (reason === "signin") setStatus("Please sign in with an approved DJ account.");
  else if (reason === "not-approved") setStatus("That account is not approved for DJ promo access.", true);
  else setStatus("");

  onAuthStateChanged(auth, async user => {
    if (!user) return;
    try {
      if (await requireApproved(user)) location.replace("dj-promo.html");
    } catch (error) {
      await signOut(auth).catch(() => {});
      setStatus(error.message || "DJ access could not be verified.", true);
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    submitButton.disabled = true;
    setStatus("Checking access…");
    try {
      const data = Object.fromEntries(new FormData(form));
      const result = await signInWithEmailAndPassword(auth, data.email.trim(), data.password);
      if (await requireApproved(result.user)) location.replace("dj-promo.html");
    } catch (error) {
      const message =
        error.code === "auth/operation-not-allowed"
          ? "Email/password sign-in is not enabled in Firebase Auth yet."
          : error.code === "auth/invalid-credential"
            ? "The email or password is incorrect."
            : error.message || "Login failed.";
      setStatus(message, true);
    } finally {
      submitButton.disabled = false;
    }
  });
}
