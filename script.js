// Fade-in animation for sections
document.addEventListener("DOMContentLoaded", () => {
    // Parallax effect for projects section
    const projectsSection = document.getElementById('projects');
    const heroSection = document.querySelector('.microsite-hero');
    if (projectsSection && heroSection) {
      function onProjectsParallax() {
        const scrollY = window.scrollY;
        const heroRect = heroSection.getBoundingClientRect();
        // Stronger parallax: projects move at 120% scroll speed
        if (heroRect.bottom > 0) {
          const parallaxY = scrollY * 1.2;
          projectsSection.style.transform = `translateY(${-parallaxY}px)`;
        } else {
          projectsSection.style.transform = '';
        }
      }
      window.addEventListener('scroll', onProjectsParallax, { passive: true });
      onProjectsParallax();
    }
  // Parallax scaling/fading for Apple-style hero
  const micrositeHero = document.querySelector('.microsite-hero');
  const heroInner = document.querySelector('.microsite-hero-inner');
  const heroImg = document.querySelector('.microsite-hero-image');
  const heroTitle = document.querySelector('.microsite-hero-title');
  const heroSubtitle = document.querySelector('.microsite-hero-subtitle');
  const heroAbout = document.querySelector('.microsite-hero-about');
  if (micrositeHero && heroInner && heroImg && heroTitle && heroSubtitle && heroAbout) {
    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }
    function onParallaxScroll() {
      const scrollY = window.scrollY;
      const heroRect = micrositeHero.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Slightly slower fade/scale
      const progress = clamp(2.2 * (1 - (heroRect.bottom / windowH)), 0, 1);
      const scale = 1 - progress * 0.38;
      const opacity = 1 - progress * 2.0;
      // Move the whole hero intro up as it fades/shrinks
      const baseTranslate = -progress * 120;
      heroInner.style.transform = `translateY(${baseTranslate}px)`;
      heroImg.style.transform = `scale(${scale + 0.14}) translateY(${-progress * 120 + baseTranslate}px)`;
      heroImg.style.opacity = opacity;
      heroTitle.style.transform = `scale(${scale}) translateY(${-progress * 120 + baseTranslate}px)`;
      heroTitle.style.opacity = opacity;
      heroSubtitle.style.transform = `scale(${scale}) translateY(${-progress * 120 + baseTranslate}px)`;
      heroSubtitle.style.opacity = opacity;
      heroAbout.style.transform = `scale(${scale}) translateY(${-progress * 120 + baseTranslate}px)`;
      heroAbout.style.opacity = opacity;
    }
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    window.addEventListener('resize', onParallaxScroll);
    onParallaxScroll();
  }
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
                  // If hero is scaled, also scale the card
                  if (document.body.classList.contains('hero-scaled')) {
                    entry.target.classList.add('card-scaled');
                  }
                  obs.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.18 }
          );
          cards.forEach(card => {
            card.classList.remove('is-visible', 'card-scaled');
            cardObserver.observe(card);
          });

          // Listen for hero scale changes and update visible cards
          const updateCardScale = () => {
            const heroScaled = document.body.classList.contains('hero-scaled');
            cards.forEach(card => {
              if (card.classList.contains('is-visible')) {
                if (heroScaled) {
                  card.classList.add('card-scaled');
                } else {
                  card.classList.remove('card-scaled');
                }
              }
            });
          };
          window.addEventListener('scroll', updateCardScale, { passive: true });
          updateCardScale();
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