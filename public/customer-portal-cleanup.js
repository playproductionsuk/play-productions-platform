import { firebaseApp, firebaseReady } from "./platform-data.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const previewButton = [...document.querySelectorAll("#authForm button")].find(button =>
  button.textContent.trim() === "Preview customer portal"
);
previewButton?.remove();

document.querySelector("#portal > .admin-intro #logout")?.remove();
document.querySelector(".account-summary .status-pill")?.remove();

if (firebaseReady && firebaseApp) {
  const authPanel = document.querySelector("#authPanel");
  const portal = document.querySelector("#portal");
  const welcome = document.querySelector("#welcome");

  onAuthStateChanged(getAuth(firebaseApp), user => {
    authPanel.hidden = Boolean(user);
    portal.hidden = !user;
    if (user && !welcome.textContent.trim()) {
      welcome.innerHTML = `<strong>Your account</strong><br><span>Download your music, review your orders and manage release update preferences.</span>`;
    }
  });
}
