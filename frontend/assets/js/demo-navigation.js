(function () {
  if (document.getElementById("demo-page-navigation")) return;

  const pages = [
    ["Demo Home", "/portal"],
    ["Prevent Fraud", "/prevent-fraud"],
    ["Investment Scams", "/investment-scams"],
    ["Job Scams", "/job-scams"],
    ["WhatsApp / Instagram", "/instant-messaging-app-scams"],
    ["Romance Scams", "/romance-scams"],
    ["Passwords", "/passwords"],
  ];

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const suffix = /\/(en|sc)$/i.test(path) ? path.match(/\/(en|sc)$/i)[0] : "";
  const basePath = suffix ? path.slice(0, -suffix.length) : path;
  const localizedRoutes = new Set(pages.map(([, href]) => href));
  const languagePaths = {
    "zh-hk": basePath,
    "zh-cn": `${basePath}/sc`,
    "en-hk": `${basePath}/en`,
  };

  function localizeLanguageLinks() {
    if (!localizedRoutes.has(basePath)) return;
    document.querySelectorAll(".locale-management a[lang]").forEach((link) => {
      const localPath = languagePaths[link.getAttribute("lang")];
      if (localPath) link.setAttribute("href", localPath);
    });
  }

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest(".locale-management a[lang]");
      const localPath = link && languagePaths[link.getAttribute("lang")];
      if (!localPath || !localizedRoutes.has(basePath)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(localPath);
    },
    true,
  );

  localizeLanguageLinks();

  const root = document.createElement("div");
  root.id = "demo-page-navigation";
  root.innerHTML = `
    <button id="demo-nav-toggle" type="button" aria-expanded="false" aria-controls="demo-nav-menu">
      Demo Pages
    </button>
    <nav id="demo-nav-menu" aria-label="Demo pages">
      ${pages
        .map(([label, href]) => {
          const target = href === "/portal" ? href : `${href}${suffix}`;
          const active = basePath === href;
          return `<a href="${target}"${active ? ' class="is-active" aria-current="page"' : ""}>${label}</a>`;
        })
        .join("")}
    </nav>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #demo-page-navigation {
      position: fixed;
      left: max(12px, env(safe-area-inset-left));
      bottom: max(12px, env(safe-area-inset-bottom));
      z-index: 2147482000;
      font-family: Arial, "Helvetica Neue", sans-serif;
    }
    #demo-nav-toggle {
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid rgba(255,255,255,0.45);
      border-radius: 6px;
      background: #1a1a1a;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.28);
    }
    #demo-nav-menu {
      display: none;
      width: min(300px, calc(100vw - 24px));
      max-height: min(70vh, 560px);
      margin-bottom: 8px;
      padding: 8px;
      overflow-y: auto;
      border: 1px solid #d9dde5;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 12px 32px rgba(0,0,0,0.24);
    }
    #demo-page-navigation.is-open #demo-nav-menu {
      display: grid;
      gap: 4px;
    }
    #demo-nav-menu a {
      display: block;
      padding: 10px 11px;
      border-radius: 6px;
      color: #1f2937;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
    }
    #demo-nav-menu a:hover,
    #demo-nav-menu a:focus-visible {
      background: #eef2f7;
      outline: none;
    }
    #demo-nav-menu a.is-active {
      background: #e8effa;
      color: #234d87;
    }
  `;

  document.documentElement.appendChild(style);
  document.body.appendChild(root);

  const toggle = root.querySelector("#demo-nav-toggle");
  toggle.addEventListener("click", () => {
    const open = root.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
})();
