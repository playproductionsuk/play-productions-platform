import { createEnquiry } from "./platform-data.js";

const form = document.querySelector("#contactForm");
const status = document.querySelector("#contactStatus");
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

if (new URLSearchParams(location.search).get("subject") === "commercial") {
  const subject = form?.querySelector('[name="subject"]');
  if (subject) subject.value = "Music or commercial rights";
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = "Sending your enquiry…";
  try {
    const values = Object.fromEntries(new FormData(form));
    await createEnquiry({
      ...values,
      newsletterConsent: form.newsletterConsent.checked,
      listType: form.newsletterConsent.checked ? "customer-newsletter" : "",
      type: "general-contact"
    });
    form.reset();
    status.textContent = "Thanks — your enquiry has been sent. I’ll get back to you as soon as I can.";
  } catch (error) {
    console.error(error);
    status.textContent = "That didn’t send. Check the required fields or email playproductionsuk@gmail.com.";
  } finally {
    button.disabled = false;
  }
});
