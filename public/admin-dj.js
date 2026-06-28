import { firebaseApp, firebaseReady, db, escapeHtml } from "./platform-data.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const list = document.querySelector("#enquiryList");
const panel = document.createElement("section");
panel.className = "panel";
panel.id = "djApprovalPanel";
panel.style.marginBottom = "24px";
list.insertAdjacentElement("beforebegin", panel);

async function render(user) {
  const snapshot = await getDocs(query(collection(db, "enquiries"), where("type", "==", "dj-access")));
  const requests = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.status === "new");

  panel.innerHTML = `
    <div class="admin-section-title">
      <div><p class="eyebrow">DJ promo workflow</p><h2>Access requests</h2></div>
      <span>${requests.length} waiting</span>
    </div>
    <div class="data-list">
      ${requests.length
        ? requests.map((request) => `
          <article class="data-row">
            <div>
              <h3>${escapeHtml(request.djName || request.name)}</h3>
              <p>${escapeHtml(request.email)}</p>
              <small>${escapeHtml(request.socialLinks || "")}</small>
            </div>
            <button data-create-dj="${request.id}">Approve & send setup email</button>
          </article>`).join("")
        : `<p class="empty">No DJ applications waiting.</p>`}
    </div>
    <div id="djCredentialResult"></div>`;

  panel.querySelectorAll("[data-create-dj]").forEach((button) => button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Creating…";
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/create-dj-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enquiryId: button.dataset.createDj }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      panel.querySelector("#djCredentialResult").innerHTML = `
        <div class="release-checklist">
          <strong>DJ login created securely</strong>
          <p>A password-setup email has been queued for ${escapeHtml(data.email)}.</p>
          <small>No password is generated, displayed, or stored in the dashboard.</small>
        </div>`;
      button.closest(".data-row").remove();
    } catch (error) {
      button.textContent = error.message || "Failed";
      button.disabled = false;
    }
  }));
}

if (firebaseReady) {
  onAuthStateChanged(getAuth(firebaseApp), (user) => {
    if (user) render(user).catch(console.error);
  });
}
