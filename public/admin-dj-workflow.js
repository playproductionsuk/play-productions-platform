import { firebaseApp, firebaseReady, db, escapeHtml } from "./platform-data.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const previewOnly = globalThis.playAdminPreviewOnly !== false;
const filters = ["pending", "approved", "rejected", "all"];
let activeFilter = "pending";
let requests = [];
let message = "";
let messageKind = "success";

function statusOf(request) {
  const values = [request.status, request.accountStatus]
    .map(value => String(value || "").trim().toLowerCase());
  if (values.includes("rejected")) return "rejected";
  if (values.includes("approved")) return "approved";
  return "pending";
}

function dateValue(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function"
    ? value.toDate()
    : new Date(value.seconds ? value.seconds * 1000 : value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function socialLinks(request) {
  const values = [];
  const add = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }
    if (typeof value === "object") {
      add(value.url || value.href || value.handle);
      return;
    }
    const text = String(value).trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (parsed !== text) {
        add(parsed);
        return;
      }
    } catch {}
    values.push(text);
  };
  add(request.socialLinks);
  add(request.socials);
  add(request.instagram);
  add(request.tiktok);
  add(request.otherSocial);
  return [...new Set(values)];
}

function readableSocials(value) {
  const output = [];
  const add = (item, label = "") => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(entry => add(entry));
      return;
    }
    if (typeof item === "object") {
      const type = item.type || item.platform || item.label || label;
      const detail = item.url || item.href || item.handle || item.value || "";
      if (detail) output.push(type ? `${type}: ${detail}` : String(detail));
      else Object.entries(item).forEach(([key, entry]) => add(entry, key));
      return;
    }
    const text = String(item).trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (parsed !== text) {
        add(parsed, label);
        return;
      }
    } catch {}
    output.push(label ? `${label}: ${text}` : text);
  };
  add(value);
  return [...new Set(output)].join(" | ");
}

function isoDate(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function"
    ? value.toDate()
    : new Date(value.seconds ? value.seconds * 1000 : value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function exportRows() {
  const headers = [
    "Document ID", "Name", "DJ Name", "Email", "Status", "Account Status",
    "Customer UID / Approved UID", "Social Links", "Socials",
    "Where They Play / Message", "Application Message",
    "Mailing Consent", "Admin Notes", "Type",
    "Application Date", "Created At", "Updated At", "Approved At",
    "Invitation Queued", "Invitation Queued At", "Rejected At"
  ];
  const rows = requests.map(request => [
      request.id,
      request.name,
      request.djName,
      request.email,
      request.status || statusOf(request),
      request.accountStatus,
      request.customerUid || request.approvedUid,
      readableSocials(request.socialLinks),
      [
        readableSocials(request.socials),
        readableSocials(request.instagram && { type: "Instagram", value: request.instagram }),
        readableSocials(request.tiktok && { type: "TikTok", value: request.tiktok }),
        readableSocials(request.otherSocial && { type: "Other", value: request.otherSocial })
      ].filter(Boolean).join(" | "),
      request.whereTheyPlay || request.message,
      request.applicationMessage || request.message,
      request.mailingConsent ?? request.newsletterConsent ?? request.mailingList ?? "",
      request.adminNotes,
      request.type,
      isoDate(request.applicationDate),
      isoDate(request.createdAt),
      isoDate(request.updatedAt),
      isoDate(request.approvedAt),
      request.invitationQueued ?? "",
      isoDate(request.invitationQueuedAt),
      isoDate(request.rejectedAt)
    ]);
  return [headers, ...rows];
}

function downloadExport() {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `play-productions-dj-applications-${date}.csv`;
  const csv = `\uFEFF${exportRows().map(row => row.map(csvCell).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ensureExportButtons() {
  const title = document.querySelector('[data-page="djAccess"] .admin-section-title');
  if (!title || title.querySelector(".dj-workflow-export-actions")) return;
  title.querySelectorAll("button").forEach(button => {
    if (["Export DJs CSV", "Export DJs + notes", "Export DJ applications CSV"].includes(button.textContent.trim())) button.remove();
  });
  title.querySelectorAll(".export-actions").forEach(group => {
    if (!group.querySelector("button")) group.remove();
  });
  title.insertAdjacentHTML("beforeend", `
    <div class="dj-workflow-export-actions">
      <button type="button" data-dj-export>Export DJ applications CSV</button>
    </div>
  `);
}

function emptyText(filter) {
  return {
    pending: "No DJ requests waiting for approval.",
    approved: "No approved DJs yet.",
    rejected: "No rejected DJ requests.",
    all: "No DJ requests found."
  }[filter];
}

function requestCard(request) {
  const status = statusOf(request);
  const socials = socialLinks(request);
  const applied = dateValue(request.applicationDate || request.createdAt);
  const updated = dateValue(request.updatedAt);
  const actionButtons = status === "pending"
    ? `<button class="button primary" type="button" data-dj-approve="${escapeHtml(request.id)}">Approve</button>
       <button class="button ghost danger" type="button" data-dj-reject="${escapeHtml(request.id)}">Reject</button>`
    : status === "approved"
      ? `<button class="button ghost danger" type="button" data-dj-reject="${escapeHtml(request.id)}">Revoke access</button>`
      : `<button class="button primary" type="button" data-dj-approve="${escapeHtml(request.id)}">Approve</button>`;

  return `<article class="dj-application-card" data-dj-request="${escapeHtml(request.id)}">
    <header>
      <div>
        <span class="dj-workflow-status ${status}">${status}</span>
        <h2>${escapeHtml(request.djName || request.name || "Unnamed DJ")}</h2>
        <p>${escapeHtml(request.name || "Real name not supplied")} · <a href="mailto:${escapeHtml(request.email || "")}">${escapeHtml(request.email || "Email not supplied")}</a></p>
      </div>
      <div class="dj-application-actions">${actionButtons}</div>
    </header>
    <div class="dj-application-details">
      <section><strong>Social links</strong>${socials.length
        ? `<ul>${socials.map(link => `<li>${/^https?:\/\//i.test(link) ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(link)}</a>` : escapeHtml(link)}</li>`).join("")}</ul>`
        : "<p>None supplied</p>"}</section>
      <section><strong>Application message</strong><p>${escapeHtml(request.message || "No message supplied")}</p></section>
      <section><strong>Application details</strong>
        <p>Applied: ${escapeHtml(applied || "Date unavailable")}</p>
        ${updated ? `<p>Last updated: ${escapeHtml(updated)}</p>` : ""}
        <p>Mailing consent: ${request.mailingConsent ? "Yes" : "No"}</p>
        <p>Account: ${request.customerUid ? `Linked (${escapeHtml(request.customerUid)})` : "Not linked yet"}</p>
      </section>
    </div>
    <label class="dj-admin-notes">
      <span>Private admin notes</span>
      <textarea data-dj-notes="${escapeHtml(request.id)}" rows="3">${escapeHtml(request.adminNotes || "")}</textarea>
    </label>
    <button class="button ghost" type="button" data-dj-save-notes="${escapeHtml(request.id)}">Save notes</button>
  </article>`;
}

function render() {
  const list = document.querySelector("#moduleDjList");
  const filterBar = document.querySelector("#djFilters");
  const metrics = document.querySelector("#djMetrics");
  if (!list || !filterBar || !metrics) return;
  ensureExportButtons();

  const counts = {
    pending: requests.filter(item => statusOf(item) === "pending").length,
    approved: requests.filter(item => statusOf(item) === "approved").length,
    rejected: requests.filter(item => statusOf(item) === "rejected").length,
    all: requests.length
  };
  filterBar.innerHTML = filters.map(filter =>
    `<button type="button" class="${activeFilter === filter ? "active" : ""}" data-dj-workflow-filter="${filter}">
      ${filter[0].toUpperCase() + filter.slice(1)} (${counts[filter]})
    </button>`
  ).join("") + '<button type="button" class="dj-refresh-button" data-dj-refresh>Refresh requests</button>';
  metrics.innerHTML = ["pending", "approved", "rejected", "all"].map(status =>
    `<article><strong>${counts[status]}</strong><span>${status === "all" ? "All requests" : status}</span></article>`
  ).join("");

  const shown = activeFilter === "all"
    ? requests
    : requests.filter(item => statusOf(item) === activeFilter);
  list.innerHTML = `
    <p id="djWorkflowMessage" class="dj-workflow-message ${messageKind}" ${message ? "" : "hidden"}>${escapeHtml(message)}</p>
    <div class="dj-application-list">${shown.length
      ? shown.map(requestCard).join("")
      : `<p class="empty">${emptyText(activeFilter)}</p>`}</div>`;
}

function previewRequests() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("playDemoEnquiries") || "[]");
  } catch {}
  const djRequests = saved.filter(item => item.type === "dj-access");
  return djRequests.length ? djRequests : [{
    id: "demo-dj-request",
    type: "dj-access",
    status: "new",
    name: "Alex Example",
    djName: "DJ Example",
    email: "dj@example.com",
    socialLinks: JSON.stringify([{ type: "Instagram", url: "https://instagram.com/djexample" }]),
    message: "Club sets, radio and monthly mixes.",
    mailingConsent: true,
    createdAt: new Date().toISOString(),
    adminNotes: ""
  }];
}

async function loadRequests() {
  const list = document.querySelector("#moduleDjList");
  if (!list) return;
  list.innerHTML = '<p class="loading">Loading DJ requests…</p>';
  message = "";
  try {
    if (firebaseReady && !previewOnly) {
      const snapshot = await getDocs(collection(db, "enquiries"));
      requests = snapshot.docs
        .map(item => ({ id: item.id, ...item.data() }))
        .filter(item => item.type === "dj-access");
    } else {
      requests = previewRequests();
    }
    render();
  } catch (error) {
    list.innerHTML = `<p class="admin-error-box">DJ applications could not be loaded: ${escapeHtml(error.message)}</p>`;
  }
}

function savePreview() {
  const existing = (() => {
    try { return JSON.parse(localStorage.getItem("playDemoEnquiries") || "[]"); }
    catch { return []; }
  })();
  const other = existing.filter(item => item.type !== "dj-access");
  localStorage.setItem("playDemoEnquiries", JSON.stringify([...other, ...requests]));
}

async function adminApi(path, body) {
  const account = getAuth(firebaseApp).currentUser;
  if (!account) throw new Error("Admin sign-in is required.");
  const token = await account.getIdToken();
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The DJ account update failed.");
  return data;
}

async function approve(id) {
  if (previewOnly || !firebaseReady) {
    const request = requests.find(item => item.id === id);
    Object.assign(request, { status: "approved", accountStatus: "approved", customerUid: "preview-dj-account" });
    savePreview();
    message = "Preview approval complete. A live approval would queue the DJ invitation email.";
  } else {
    const result = await adminApi("/api/admin/create-dj-user", { enquiryId: id });
    if (!result.invitationQueued) throw new Error("DJ access was created, but the invitation email was not queued.");
    await loadRequests();
    message = `Approved and invitation email queued for ${result.email}.`;
  }
  messageKind = "success";
  activeFilter = "pending";
  render();
}

async function reject(id) {
  if (previewOnly || !firebaseReady) {
    const request = requests.find(item => item.id === id);
    Object.assign(request, { status: "rejected", accountStatus: "rejected" });
    savePreview();
  } else {
    await adminApi("/api/admin/update-dj-application", { enquiryId: id, action: "reject" });
    await loadRequests();
  }
  messageKind = "success";
  message = "DJ request rejected and any existing promo access has been revoked.";
  activeFilter = "pending";
  render();
}

async function saveNotes(id) {
  const request = requests.find(item => item.id === id);
  const notes = document.querySelector(`[data-dj-notes="${CSS.escape(id)}"]`)?.value || "";
  if (!request) throw new Error("DJ request could not be found.");
  if (firebaseReady && !previewOnly) {
    await updateDoc(doc(db, "enquiries", id), { adminNotes: notes, updatedAt: serverTimestamp() });
  } else {
    request.adminNotes = notes;
    request.updatedAt = new Date().toISOString();
    savePreview();
  }
  request.adminNotes = notes;
  messageKind = "success";
  message = "Admin notes saved.";
  render();
}

document.addEventListener("click", async event => {
  const filter = event.target.closest("[data-dj-workflow-filter]");
  const refresh = event.target.closest("[data-dj-refresh]");
  const approveButton = event.target.closest("[data-dj-approve]");
  const rejectButton = event.target.closest("[data-dj-reject]");
  const notesButton = event.target.closest("[data-dj-save-notes]");
  const exportButton = event.target.closest("[data-dj-export]");
  if (!filter && !refresh && !approveButton && !rejectButton && !notesButton && !exportButton) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  if (exportButton) {
    downloadExport();
    return;
  }
  if (filter) {
    activeFilter = filter.dataset.djWorkflowFilter;
    render();
    return;
  }
  if (refresh) {
    await loadRequests();
    return;
  }

  const button = approveButton || rejectButton || notesButton;
  button.disabled = true;
  const original = button.textContent;
  button.textContent = "Working…";
  try {
    if (approveButton) await approve(approveButton.dataset.djApprove);
    if (rejectButton) await reject(rejectButton.dataset.djReject);
    if (notesButton) await saveNotes(notesButton.dataset.djSaveNotes);
  } catch (error) {
    messageKind = "error";
    message = error.message || "The DJ request could not be updated.";
    render();
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      button.textContent = original;
    }
  }
}, true);

window.addEventListener("play-admin-live-authenticated", loadRequests);
window.addEventListener("play-admin-preview-request", loadRequests);
window.addEventListener("play-admin-dj-rendered", () => setTimeout(render, 0));
window.addEventListener("play-admin-module-ready", () => {
  activeFilter = "pending";
  loadRequests();
}, { once: true });

if (document.querySelector("#moduleDjList")) loadRequests();
