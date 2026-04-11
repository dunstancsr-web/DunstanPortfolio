/**
 * Portfolio Main Script
 * Organized in modules for better maintainability and readability.
 */

// --- Configuration & Constants ---
const CONFIG = {
  theme: {
    storageKey: "dunstan-theme",
    modes: ["auto", "light", "dark"],
    icons: { auto: "◐", light: "☀︎", dark: "☾" }
  },
  glass: {
    storageKey: "dunstan-glass-mode",
    modes: ["liquid", "readable"],
    icon: "Aa"
  },
  animation: {
    threshold: 0.18,
    cardDelay: 50 // ms
  }
};

// --- Utilities ---
const Utils = {
  getStorage: (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  },
  setStorage: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Storage unavailable
    }
  },
  safeQuery: (selector) => document.querySelector(selector),
  safeQueryAll: (selector) => Array.from(document.querySelectorAll(selector))
};

// --- Tooltip Manager ---
const TooltipManager = {
  el: null,
  
  create() {
    if (this.el) return this.el;
    this.el = document.createElement('div');
    this.el.id = 'glassTooltip';
    this.el.className = 'glass-tooltip';
    document.body.appendChild(this.el);
    return this.el;
  },

  show(event, text) {
    const tooltip = this.create();
    tooltip.textContent = text;
    tooltip.style.display = 'block';

    // Micro-delay to allow for offset calculations
    requestAnimationFrame(() => {
      const rect = event.target.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      let top = rect.bottom + 12 + scrollY;
      // Flip to top if not enough room below
      if (window.innerHeight - rect.bottom < tooltip.offsetHeight + 24) {
        top = rect.top - tooltip.offsetHeight - 12 + scrollY;
      }

      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + scrollX}px`;
      tooltip.style.top = `${top}px`;
    });
  },

  hide() {
    if (this.el) this.el.style.display = 'none';
  }
};

// --- Theme Manager ---
const ThemeManager = {
  mode: "auto",
  btn: null,
  systemQuery: window.matchMedia("(prefers-color-scheme: dark)"),

  init() {
    this.btn = Utils.safeQuery("#themeToggle");
    this.mode = Utils.getStorage(CONFIG.theme.storageKey, "auto");
    this.apply(this.mode);
    this.bindEvents();
  },

  getResolved(mode) {
    if (mode === "auto") return this.systemQuery.matches ? "dark" : "light";
    return mode;
  },

  apply(mode) {
    const resolved = this.getResolved(mode);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-mode", mode);
    this.updateToggle(mode, resolved);
    this.mode = mode;
  },

  updateToggle(mode, resolved) {
    if (!this.btn) return;
    const isDark = resolved === "dark";
    this.btn.dataset.icon = CONFIG.theme.icons[mode];
    this.btn.dataset.modeLabel = mode === "auto" ? `Theme: Auto (${resolved})` : `Theme: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    this.btn.setAttribute("aria-label", `Theme mode: ${mode}. Click to switch.`);
    this.btn.setAttribute("aria-pressed", String(isDark));
  },

  toggle() {
    const idx = CONFIG.theme.modes.indexOf(this.mode);
    const next = CONFIG.theme.modes[(idx + 1) % CONFIG.theme.modes.length];
    this.apply(next);
    Utils.setStorage(CONFIG.theme.storageKey, next);
  },

  bindEvents() {
    this.btn?.addEventListener("click", () => this.toggle());
    this.systemQuery.addEventListener("change", () => {
      if (this.mode === "auto") this.apply("auto");
    });
  }
};

// --- Glass/Accessibility Manager ---
const GlassManager = {
  mode: "liquid",
  btn: null,

  init() {
    this.btn = Utils.safeQuery("#glassToggle");
    this.mode = Utils.getStorage(CONFIG.glass.storageKey, "liquid");
    this.apply(this.mode);
    this.bindEvents();
  },

  apply(mode) {
    document.documentElement.setAttribute("data-glass-mode", mode);
    this.updateToggle(mode);
    this.mode = mode;
  },

  updateToggle(mode) {
    if (!this.btn) return;
    const isLiquid = mode === "liquid";
    this.btn.dataset.icon = CONFIG.glass.icon;
    this.btn.dataset.modeLabel = isLiquid ? "Accessibility: Off" : "Accessibility: On";
    this.btn.classList.toggle("is-accessibility-on", !isLiquid);
    this.btn.classList.toggle("is-accessibility-off", isLiquid);
    
    const statusText = isLiquid 
      ? "Accessibility features are OFF. Click to enable high readability mode." 
      : "Accessibility features are ON. Click to return to liquid mode.";
    
    this.btn.setAttribute("aria-label", statusText);
    this.btn.setAttribute("aria-pressed", String(!isLiquid));
  },

  toggle() {
    const next = this.mode === "liquid" ? "readable" : "liquid";
    this.apply(next);
    Utils.setStorage(CONFIG.glass.storageKey, next);
  },

  bindEvents() {
    if (!this.btn) return;
    this.btn.addEventListener("click", () => this.toggle());
    
    const showTT = (e) => {
      const text = this.mode === "liquid" 
        ? "Accessibility features are OFF. Click to enable high readability mode." 
        : "Accessibility features are ON. Click to return to liquid mode.";
      TooltipManager.show(e, text);
    };

    this.btn.addEventListener("mouseenter", showTT);
    this.btn.addEventListener("focus", showTT);
    this.btn.addEventListener("mouseleave", () => TooltipManager.hide());
    this.btn.addEventListener("blur", () => TooltipManager.hide());
  }
};

// --- Scroll & Visibility Observer ---
const ScrollObserver = {
  observer: null,
  navLinks: [],
  sections: [],

  init() {
    this.navLinks = Utils.safeQueryAll('.primary-nav a[href^="#"]');
    this.sections = this.navLinks.map(link => {
      const id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    }).filter(Boolean);

    this.initVisibilityObserver();
    this.initScrollSpy();
  },

  initVisibilityObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.animation.threshold });

    Utils.safeQueryAll(".fade-section, .section").forEach(el => {
      el.classList.remove("is-visible");
      this.observer.observe(el);
    });
  },

  initScrollSpy() {
    const update = () => {
      if (this.sections.length === 0) return;
      const header = Utils.safeQuery(".site-header");
      const offset = header ? header.getBoundingClientRect().bottom : 0;
      
      let best = this.sections[0];
      for (const section of this.sections) {
        if (section.getBoundingClientRect().top <= offset) {
          best = section;
        }
      }
      
      this.navLinks.forEach(link => {
        const id = link.getAttribute("href").slice(1);
        const isActive = best.id === id;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    new ResizeObserver(update).observe(document.body);
    update();
  }
};

// --- Project Loader ---
const ProjectLoader = {
  grid: null,

  async init() {
    this.grid = Utils.safeQuery(".project-grid");
    if (!this.grid) return;

    try {
      const response = await fetch("projects.json");
      if (!response.ok) throw new Error("Could not load projects");
      const data = await response.json();
      this.render(data);
    } catch (err) {
      console.error(err);
      this.grid.innerHTML = `<p class="error-msg">Note: To view projects locally, please run a local server or visit the live site.</p>`;
    }
  },

  render(projects) {
    if (!Array.isArray(projects)) return;
    
    const fragment = document.createDocumentFragment();
    projects.forEach(project => {
      const article = document.createElement("article");
      article.className = "project-card";
      
      const linksHtml = (project.links || []).map(link => `
        <a class="project-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
          ${link.label || "View Project"}${link.badge ? ` <span class="project-link-badge">${link.badge}</span>` : ""} ↗
        </a>
      `).join("");

      const infoHtml = project.linkInfo ? `
        <span class="project-link-info" tabindex="0" role="note" aria-label="${project.linkInfo}" data-tooltip="${project.linkInfo}">i</span>
      ` : "";

      article.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        ${linksHtml ? `<div class="project-link-group">${linksHtml}${infoHtml}</div>` : ""}
        <ul>
          ${project.role ? `<li><strong>Role:</strong> ${project.role}</li>` : ""}
          <li><strong>Impact:</strong> ${project.impact}</li>
          <li><strong>Tools:</strong> ${Array.isArray(project.tools) ? project.tools.join(", ") : project.tools}</li>
        </ul>
      `;
      fragment.appendChild(article);
    });

    this.grid.innerHTML = "";
    this.grid.appendChild(fragment);

    // Re-observe new cards
    Utils.safeQueryAll(".project-card").forEach(card => ScrollObserver.observer.observe(card));
  }
};

// --- Main Init ---
document.addEventListener("DOMContentLoaded", () => {
  // Update year
  const yearEl = Utils.safeQuery("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize Modules
  ThemeManager.init();
  GlassManager.init();
  ScrollObserver.init();
  ProjectLoader.init();
});