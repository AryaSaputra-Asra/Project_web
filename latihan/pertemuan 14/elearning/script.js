
// script.js - interactions for landing + contact
document.addEventListener('DOMContentLoaded', function() {
  // highlight current nav link based on filename
  const navLinks = document.querySelectorAll('.nav-link');
  const path = window.location.pathname.split('/').pop();
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (href === 'index.html' && (path === '' || path === 'index.html'))) {
      a.classList.add('active');
    }
  });

  // setup contact form behavior if present
  function setupContactForm() {
    const form = document.getElementById("contactForm");
    const iframe = document.getElementById("hidden_iframe");
    if (!form) return;

    // remove error styling on input
    form.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", () => el.classList.remove("input-error"));
    });

    form.addEventListener("submit", function(e) {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll("input, textarea").forEach(el => {
        if (!el.value.trim()) {
          el.classList.add("input-error");
          valid = false;
        }
      });
      if (!valid) {
        alert("Form belum lengkap!");
        return;
      }

      const btn = form.querySelector("button[type='submit']");
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "Mengirim...";

      const onLoad = function() {
        const status = document.getElementById("contactStatus");
        if (status) status.style.display = "block";

        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;

        iframe.removeEventListener("load", onLoad);
      };

      iframe.addEventListener("load", onLoad);

      form.submit();
    });
  }

  setupContactForm();
});
