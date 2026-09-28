(function () {
  const STORAGE_KEY = "hsbc-sign-language-enabled";
  const LOCAL_LANGUAGE_PATHS = {
    "zh-hk": "/passwords",
    "zh-cn": "/passwords/sc",
    "en-hk": "/passwords/en",
  };
  let enabled = localStorage.getItem(STORAGE_KEY) !== "false";
  let module = null;
  let loading = false;

  function localizePasswordLanguageLinks() {
    document.querySelectorAll(".locale-management a[lang]").forEach((link) => {
      const localPath = LOCAL_LANGUAGE_PATHS[link.getAttribute("lang")];
      if (localPath) {
        link.setAttribute("href", localPath);
      }
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest(".locale-management a[lang]");
    const localPath = link && LOCAL_LANGUAGE_PATHS[link.getAttribute("lang")];
    if (localPath) {
      event.preventDefault();
      window.location.assign(localPath);
    }
  });

  localizePasswordLanguageLinks();

  const button = document.createElement("button");
  button.id = "sign-language-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Toggle sign language");
  Object.assign(button.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147482000",
    minHeight: "40px",
    padding: "0 14px",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: "6px",
    background: enabled ? "#1a1a1a" : "#ffffff",
    color: enabled ? "#ffffff" : "#1a1a1a",
    font: "600 14px Arial, sans-serif",
    cursor: "pointer",
    boxShadow: "0 3px 12px rgba(0,0,0,0.22)",
  });
  document.body.appendChild(button);

  function renderButton() {
    button.textContent = enabled ? "手語 On" : "手語 Off";
    button.style.background = enabled ? "#1a1a1a" : "#ffffff";
    button.style.color = enabled ? "#ffffff" : "#1a1a1a";
  }

  async function loadModule() {
    if (module || loading) return module;
    loading = true;
    try {
      module = await import("/assets/js/interactive-highlight.js?v=20260928dv");
    } finally {
      loading = false;
    }
    return module;
  }

  async function enable() {
    const loaded = await loadModule();
    await loaded.addInteractiveHighlightSequence();
    loaded.enableSignLanguage();
  }

  button.addEventListener("click", async () => {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, String(enabled));
    renderButton();
    const loaded = await loadModule();
    if (enabled) {
      await enable();
    } else {
      loaded.disableSignLanguage();
    }
  });

  renderButton();
  if (enabled) {
    enable().catch((error) => console.error("Unable to initialize sign language:", error));
  }
})();
