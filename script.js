const yearElement = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");
const themeStorageKey = "dunstan-theme";
const themeModes = ["auto", "light", "dark"];
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
    themeToggle.dataset.modeLabel = "Auto";
    themeToggle.setAttribute("aria-label", `Theme mode: Auto (${resolvedTheme}). Switch mode`);
    themeToggle.title = `Theme: Auto (${resolvedTheme})`;
    themeToggle.setAttribute("aria-pressed", "false");
    return;
  }

  const isDark = mode === "dark";
  themeToggle.dataset.icon = isDark ? "☾" : "☀︎";
  themeToggle.dataset.modeLabel = isDark ? "Dark" : "Light";
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

systemThemeQuery.addEventListener("change", () => {
  const currentMode = document.documentElement.getAttribute("data-theme-mode") || "auto";

  if (currentMode === "auto") {
    applyThemeMode("auto");
  }
});

const navLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));

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
    const activationPoint = window.scrollY + window.innerHeight * 0.35;
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