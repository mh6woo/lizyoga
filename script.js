document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const navClose = document.getElementById("navClose");
  const navOverlay = document.getElementById("navOverlay");
  const contactForm = document.getElementById("contactForm");
  const captchaQuestion = document.getElementById("captchaQuestion");
  const captchaInput = document.getElementById("captchaInput");
  const refreshCaptcha = document.getElementById("refreshCaptcha");
  const formMessage = document.getElementById("formMessage");
  const courseType = document.getElementById("courseType");
  const courseHint = document.getElementById("courseHint");
  const yogaLevel = document.getElementById("yogaLevel");
  const messageField = document.getElementById("message");
  const year = document.getElementById("year");
  let currentCaptchaAnswer = 0;
  let lockedScrollY = 0;

  const courseLabels = {
    collectif: "Cours collectif",
    personnalise: "Cours personnalise",
  };

  const courseHints = {
    collectif:
      "Cours collectif: vendredi 6 juin 2026 a 19h, duree 2h, 15 places au maximum.",
    personnalise: "Cours personnalise: format 1:1, planning defini ensemble.",
  };

  const levelLabels = {
    debutant: "Debutant",
    intermediaire: "Intermediaire",
    avance: "Avance",
  };

  const getRequestType = () => {
    const selected = document.querySelector('input[name="requestType"]:checked');
    return selected ? selected.value : "information";
  };

  const createCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    currentCaptchaAnswer = a + b;

    if (captchaQuestion) {
      captchaQuestion.textContent = `Captcha : combien font ${a} + ${b} ?`;
    }

    if (captchaInput) {
      captchaInput.value = "";
    }
  };

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const openNav = () => {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.setProperty("--scroll-lock-top", `-${lockedScrollY}px`);
    document.body.classList.add("nav-open");
    document.documentElement.classList.add("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Fermer le menu");
    }
  };

  const closeNav = () => {
    const hasNavOpen = document.body.classList.contains("nav-open");
    document.body.classList.remove("nav-open");
    document.documentElement.classList.remove("nav-open");
    document.body.style.removeProperty("--scroll-lock-top");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Ouvrir le menu");
    }
    if (hasNavOpen) {
      window.scrollTo(0, lockedScrollY);
    }
  };

  if (navToggle && siteNav && navOverlay) {
    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("nav-open");

      if (isOpen) {
        closeNav();
        return;
      }

      openNav();
    });

    navOverlay.addEventListener("click", closeNav);
    if (navClose) {
      navClose.addEventListener("click", closeNav);
    }
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    // Prevent background page scroll on touch devices while keeping drawer scrollable.
    document.addEventListener(
      "touchmove",
      (event) => {
        if (!document.body.classList.contains("nav-open")) {
          return;
        }
        if (siteNav.contains(event.target)) {
          return;
        }
        event.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) {
        closeNav();
      }
    });
  }

  if (refreshCaptcha) {
    refreshCaptcha.addEventListener("click", createCaptcha);
  }

  const updateCourseUI = () => {
    if (!courseType || !courseHint) {
      return;
    }

    const selected = courseType.value;
    courseHint.textContent = selected ? courseHints[selected] || "" : "";
  };

  if (courseType) {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("cours");

    if (fromQuery && courseLabels[fromQuery]) {
      courseType.value = fromQuery;
      const bookingOption = document.getElementById("requestBooking");
      if (bookingOption) {
        bookingOption.checked = true;
      }
      if (messageField && !messageField.value.trim()) {
        messageField.value = `Bonjour, je souhaite en savoir plus sur ${courseLabels[fromQuery].toLowerCase()}.`;
      }
    }

    courseType.addEventListener("change", updateCourseUI);
    updateCourseUI();
  }

  if (contactForm && captchaInput && formMessage) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameValue = document.getElementById("name")?.value.trim() || "";
      const emailValue = document.getElementById("email")?.value.trim() || "";
      const messageValue = document.getElementById("message")?.value.trim() || "";
      const requestType = getRequestType();
      const selectedCourse = courseType?.value || "";
      const selectedLevel = yogaLevel?.value || "debutant";
      const captchaValue = Number(captchaInput.value);

      formMessage.classList.remove("error", "success");

      if (captchaValue !== currentCaptchaAnswer) {
        formMessage.textContent = "Captcha incorrect. Prenez une respiration et reessayez.";
        formMessage.classList.add("error");
        createCaptcha();
        return;
      }

      if (requestType === "reservation" && (!selectedCourse || !courseLabels[selectedCourse])) {
        formMessage.textContent = "Pour reserver, choisissez d'abord un cours.";
        formMessage.classList.add("error");
        return;
      }

      const requestLabel =
        requestType === "reservation" ? "Demande de reservation" : "Demande d'information";
      const courseLabel = selectedCourse && courseLabels[selectedCourse] ? courseLabels[selectedCourse] : "Echange general";
      const subject = encodeURIComponent(`${requestLabel} - ${courseLabel} - ${nameValue}`);
      const body = encodeURIComponent(
        `Type de demande : ${requestLabel}\nNom : ${nameValue}\nEmail : ${emailValue}\nCours : ${courseLabel}\nNiveau : ${levelLabels[selectedLevel] || selectedLevel}\n\nMessage :\n${messageValue}`
      );
      const mailtoUrl = `mailto:hello@stillbloomyoga.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoUrl;

      formMessage.textContent = "Ouverture de votre messagerie. Merci pour votre confiance.";
      formMessage.classList.add("success");
      contactForm.reset();
      updateCourseUI();
      createCaptcha();
    });
  }

  createCaptcha();
});
