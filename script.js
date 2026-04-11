// Custom tooltip for accessibility button
function createGlassTooltip() {
  let tooltip = document.getElementById('glassTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'glassTooltip';
    tooltip.className = 'glass-tooltip';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

function showGlassTooltip(e, text) {
  const tooltip = createGlassTooltip();
  tooltip.textContent = text;
  tooltip.style.display = 'block';
  // Wait for DOM to update so we can get offsetWidth/Height
  setTimeout(() => {
    const rect = e.target.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    // Prefer below, fallback above if not enough space
    let top = rect.bottom + 12 + scrollY;
    if (window.innerHeight - rect.bottom < tooltip.offsetHeight + 24) {
      top = rect.top - tooltip.offsetHeight - 12 + scrollY;
    }
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + scrollX + 'px';
    tooltip.style.top = top + 'px';
  }, 0);
}

function hideGlassTooltip() {
  const tooltip = document.getElementById('glassTooltip');
  if (tooltip) tooltip.style.display = 'none';
}
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

  // Phase 2: Experiment - Fetch and log projects.json
  fetch('projects.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      console.log('Loaded project data:', data);
      // Phase 3: Dynamically add all project cards from JSON
      if (Array.isArray(data) && data.length > 0) {
        const projectGrid = document.querySelector('.project-grid');
        if (projectGrid) {
          data.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card project-card--json';
            // Render links if present
            let linksHtml = '';
            if (Array.isArray(project.links) && project.links.length > 0) {
              linksHtml = '<div class="project-link-group" aria-label="Project links">';
              project.links.forEach(link => {
                linksHtml += `<a class="project-link" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label || 'View Project'}${link.badge ? ` <span class='project-link-badge'>${link.badge}</span>` : ''} ↗</a>`;
              });
              if (project.linkInfo) {
                linksHtml += `<span class="project-link-info" tabindex="0" role="note" aria-label="${project.linkInfo}" data-tooltip="${project.linkInfo}">i</span>`;
              }
              linksHtml += '</div>';
            }
            card.innerHTML = `
              <h3>${project.title}</h3>
              <p>${project.summary}</p>
              ${linksHtml}
              <ul>
                ${project.role ? `<li><strong>Role:</strong> ${project.role}</li>` : ''}
                <li><strong>Impact:</strong> ${project.impact}</li>
                <li><strong>Tools:</strong> ${Array.isArray(project.tools) ? project.tools.join(', ') : project.tools}</li>
              </ul>
            `;
            projectGrid.appendChild(card);
          });
          // Apple-esque transition: animate cards as they scroll into view
          const cards = projectGrid.querySelectorAll('.project-card');
          const cardObserver = new window.IntersectionObserver(
            (entries, obs) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
                  obs.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.18 }
          );
          cards.forEach(card => {
            card.classList.remove('is-visible');
            cardObserver.observe(card);
          });
        }
      }
    })
    .catch(error => {
      console.error('Error loading projects.json:', error);
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
  const statusText = isLiquid ? "Accessibility features are OFF. Click to enable high readability mode." : "Accessibility features are ON. Click to return to liquid mode.";
  glassToggle.setAttribute("aria-label", statusText);
  glassToggle.setAttribute("aria-pressed", String(isLiquid));
  // Remove native tooltip
  glassToggle.removeAttribute('title');
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
    } catch (error) { }
  });
  glassToggle.addEventListener("mouseenter", (e) => {
    const isLiquid = (document.documentElement.getAttribute("data-glass-mode") || "liquid") === "liquid";
    const statusText = isLiquid ? "Accessibility features are OFF. Click to enable high readability mode." : "Accessibility features are ON. Click to return to liquid mode.";
    showGlassTooltip(e, statusText);
  });
  glassToggle.addEventListener("mouseleave", hideGlassTooltip);
  glassToggle.addEventListener("focus", (e) => {
    const isLiquid = (document.documentElement.getAttribute("data-glass-mode") || "liquid") === "liquid";
    const statusText = isLiquid ? "Accessibility features are OFF. Click to enable high readability mode." : "Accessibility features are ON. Click to return to liquid mode.";
    showGlassTooltip(e, statusText);
  });
  glassToggle.addEventListener("blur", hideGlassTooltip);
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
  // Map each nav link to its target section element
  const sections = navLinks
    .map((link) => {
      const id = (link.getAttribute("href") || "").slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  let currentActive = null;

  const setActive = (el) => {
    if (el === currentActive) return;
    currentActive = el;
    navLinks.forEach((link) => {
      const id = (link.getAttribute("href") || "").slice(1);
      const on = !!(el && el.id === id);
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  const update = () => {
    if (sections.length === 0) return;

    const headerEl = document.querySelector(".site-header");
    const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;

    // Walk sections in DOM order (top to bottom).
    // The active section is the LAST one whose top has passed above the header bottom.
    // If no section has passed the header yet, default to the first one.
    let best = sections[0];

    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top <= headerBottom) {
        best = section; // keep updating: last one above header wins
      }
    }

    setActive(best);
  };

  // Listen to window scroll
  window.addEventListener("scroll", update, { passive: true });
  // Listen to ANY element scrolling on the page (capture phase)
  document.addEventListener("scroll", update, { passive: true, capture: true });

  window.addEventListener("resize", update);
  // Re-evaluate when content loads (JSON projects expanding the page)
  new ResizeObserver(update).observe(document.body);

  // Initial check
  setTimeout(update, 100);
  update();
}