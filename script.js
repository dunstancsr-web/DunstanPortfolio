// Fade-in animation for sections
document.addEventListener("DOMContentLoaded", () => {
  const fadeSections = document.querySelectorAll(".fade-section, .section");
  const observer = new window.IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );
  fadeSections.forEach((section) => {
    section.classList.remove("is-visible");
    observer.observe(section);
  });
});
const yearElement = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");
const glassToggle = document.getElementById("glassToggle");
const themeStorageKey = "dunstan-theme";
const themeModes = ["auto", "light", "dark"];
const glassStorageKey = "dunstan-glass-mode";
const glassModes = ["liquid", "readable"];
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const getPreferredTheme = () => {
  if (systemThemeQuery.matches) {
    return "dark";
  }

  return "light";
};

const getResolvedTheme = (mode) => {
  if (mode === "auto") {
    return getPreferredTheme();
  }

  return mode;
};

const updateToggleState = (mode, resolvedTheme) => {
  if (!themeToggle) {
    return;
  }

  if (mode === "auto") {
    themeToggle.dataset.icon = "◐";
    themeToggle.dataset.modeLabel = `Theme: Auto (${resolvedTheme})`;
    themeToggle.setAttribute("aria-label", `Theme mode: Auto (${resolvedTheme}). Switch mode`);
    themeToggle.title = `Theme: Auto (${resolvedTheme})`;
    themeToggle.setAttribute("aria-pressed", "false");
    return;
  }

  const isDark = mode === "dark";
  themeToggle.dataset.icon = isDark ? "☾" : "☀︎";
  themeToggle.dataset.modeLabel = `Theme: ${isDark ? "Dark" : "Light"}`;
  themeToggle.setAttribute("aria-label", `Theme mode: ${mode}. Switch mode`);
  themeToggle.title = `Theme: ${mode}`;
  themeToggle.setAttribute("aria-pressed", String(isDark));
};

const applyThemeMode = (mode) => {
  const resolvedTheme = getResolvedTheme(mode);

  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.setAttribute("data-theme-mode", mode);

  updateToggleState(mode, resolvedTheme);
};

const getNextMode = (mode) => {
  const modeIndex = themeModes.indexOf(mode);

  if (modeIndex === -1 || modeIndex === themeModes.length - 1) {
    return themeModes[0];
  }

  return themeModes[modeIndex + 1];
};

let initialMode = "auto";

try {
  const savedMode = localStorage.getItem(themeStorageKey);

  if (savedMode && themeModes.includes(savedMode)) {
    initialMode = savedMode;
  }
} catch (error) {
  initialMode = "auto";
}

applyThemeMode(initialMode);

const updateGlassToggleState = (mode) => {
  if (!glassToggle) {
    return;
  }

  const isLiquid = mode === "liquid";
  const modeLabel = isLiquid ? "Accessibility: Off" : "Accessibility: On";

  glassToggle.dataset.icon = "Aa";
  glassToggle.dataset.modeLabel = modeLabel;
  glassToggle.classList.toggle("is-accessibility-on", !isLiquid);
  glassToggle.classList.toggle("is-accessibility-off", isLiquid);
  glassToggle.setAttribute("aria-label", `Liquid Glass: ${isLiquid ? "On" : "Off"}. Switch mode`);
  glassToggle.title = `Liquid Glass: ${isLiquid ? "On" : "Off"} (${isLiquid ? "Very Liquid" : "Readable"})`;
  glassToggle.setAttribute("aria-pressed", String(isLiquid));
};

const applyGlassMode = (mode) => {
  document.documentElement.setAttribute("data-glass-mode", mode);
  updateGlassToggleState(mode);
};

const getNextGlassMode = (mode) => {
  const modeIndex = glassModes.indexOf(mode);

  if (modeIndex === -1 || modeIndex === glassModes.length - 1) {
    return glassModes[0];
  }

  return glassModes[modeIndex + 1];
};

let initialGlassMode = "liquid";

try {
  const savedGlassMode = localStorage.getItem(glassStorageKey);

  if (savedGlassMode && glassModes.includes(savedGlassMode)) {
    initialGlassMode = savedGlassMode;
  }
} catch (error) {
  initialGlassMode = "liquid";
}

applyGlassMode(initialGlassMode);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentMode = document.documentElement.getAttribute("data-theme-mode") || "auto";
    const nextMode = getNextMode(currentMode);

    applyThemeMode(nextMode);

    try {
      localStorage.setItem(themeStorageKey, nextMode);
    } catch (error) {
      // no-op when storage is unavailable
    }
  });
}

if (glassToggle) {
  glassToggle.addEventListener("click", () => {
    const currentGlassMode = document.documentElement.getAttribute("data-glass-mode") || "liquid";
    const nextGlassMode = getNextGlassMode(currentGlassMode);

    applyGlassMode(nextGlassMode);

    try {
      localStorage.setItem(glassStorageKey, nextGlassMode);
    } catch (error) {
      // no-op when storage is unavailable
    }
  });
}

systemThemeQuery.addEventListener("change", () => {
  const currentMode = document.documentElement.getAttribute("data-theme-mode") || "auto";

  if (currentMode === "auto") {
    applyThemeMode("auto");
  }
});

const navLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
const projectRevealButtons = Array.from(document.querySelectorAll(".project-reveal-btn[aria-controls]"));
const siteFooter = document.getElementById("siteFooter");

if (siteFooter) {
  siteFooter.hidden = true;
}

projectRevealButtons.forEach((button) => {
  const targetId = button.getAttribute("aria-controls");

  if (!targetId) {
    return;
  }

  const targetCard = document.getElementById(targetId);

  if (!targetCard) {
    return;
  }

  button.addEventListener("click", () => {
    if (targetId === "projectCard4") {
      targetCard.classList.add("is-expanded");
      button.setAttribute("aria-expanded", "true");
      button.setAttribute("aria-label", "Project details expanded");

      if (siteFooter) {
        siteFooter.hidden = false;
      }

      button.remove();
      return;
    }

    const isExpanded = targetCard.classList.toggle("is-expanded");
    const isIconOnly = button.classList.contains("project-reveal-btn--icon-only");

    button.setAttribute("aria-expanded", String(isExpanded));

    if (!isIconOnly) {
      button.textContent = isExpanded ? "Show Less" : "Show More";
    } else {
      const tooltipText = isExpanded ? "Show Less" : "Show More";

      button.title = tooltipText;
      button.setAttribute("data-tooltip", tooltipText);
    }

    button.setAttribute("aria-label", isExpanded ? "Collapse project details" : "Expand project details");
  });
});

if (navLinks.length > 0) {
  const sectionIds = navLinks
    .map((link) => link.getAttribute("href"))
    .filter((href) => href && href.length > 1)
    .map((href) => href.slice(1));

  const trackedSectionIds = sectionIds.filter((id) => id !== "home");

  const setActiveLink = (activeId) => {
    navLinks.forEach((link) => {
      const linkTarget = (link.getAttribute("href") || "").slice(1);
      const isActive = linkTarget === activeId;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let currentActiveId = "home";
  setActiveLink(currentActiveId);

  const updateActiveLinkByScroll = () => {
    const headerElement = document.querySelector(".site-header");
    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
    const activationPoint = window.scrollY + headerHeight + 1;
    let nextActiveId = "home";

    trackedSectionIds.forEach((id) => {
      const section = document.getElementById(id);

      if (section && activationPoint >= section.offsetTop) {
        nextActiveId = id;
      }
    });

    if (nextActiveId !== currentActiveId) {
      currentActiveId = nextActiveId;
      setActiveLink(currentActiveId);
    }
  };

  window.addEventListener("scroll", updateActiveLinkByScroll, { passive: true });
  window.addEventListener("resize", updateActiveLinkByScroll);
  updateActiveLinkByScroll();
}