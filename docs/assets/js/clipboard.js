/* ═══════════════════════════════════════════════════════════
   CLIPBOARD.JS —
   ═══════════════════════════════════════════════════════════ */

"use strict";

async function clipboardWriteText(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      notification("Texto copiado al portapapeles");
    })
    .catch((err) => {
      notification("Error al copiar al portapapeles:", err);
    });
}

if (document.querySelector("#btn_copy_email")) {
  const btn_copy_email = document.querySelector("#btn_copy_email");
  btn_copy_email.addEventListener("click", (event) => {
    const VALUE = event.target.value;
    clipboardWriteText(VALUE);
  });
}

function notification(text, error = null) {
  const TAGFATHERNOTIFICATION = document.querySelector(
    ".container-notification",
  );
  const TAGNOTIFICATION = document.querySelector("#notification");
  TAGFATHERNOTIFICATION.style = "width: 100%";
  TAGNOTIFICATION.textContent = text;
  if (error) console.error(error);
  TAGNOTIFICATION.classList.add("notification__text--isActive");
  setTimeout(() => {
    TAGNOTIFICATION.classList.remove("notification__text--isActive");
    TAGFATHERNOTIFICATION.style = "width: 0%";
  }, 1500);
}
