(function () {
  const storageKey = "profile-theme";
  const toggle = document.getElementById("theme-toggle");
  const year = document.getElementById("year");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (toggle) {
      const isDark = theme === "dark";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.textContent = isDark ? "Light theme" : "Dark theme";
    }
  }

  function initialTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    return preferred.matches ? "dark" : "light";
  }

  applyTheme(initialTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }

  preferred.addEventListener("change", function (event) {
    if (!localStorage.getItem(storageKey)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function wrapPlaceholders(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];

    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.includes("PLACEHOLDER")) {
        nodes.push(walker.currentNode);
      }
    }

    nodes.forEach(function (textNode) {
      const parts = textNode.nodeValue.split(/(PLACEHOLDER)/g);
      const fragment = document.createDocumentFragment();

      parts.forEach(function (part) {
        if (part === "PLACEHOLDER") {
          const mark = document.createElement("mark");
          mark.className = "placeholder-mark";
          mark.textContent = part;
          fragment.appendChild(mark);
        } else if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  wrapPlaceholders(document.body);

  const placeholderCount = document.querySelectorAll(".placeholder-mark").length;
  console.info(
    "Profile page ready. Highlighted " + placeholderCount + " PLACEHOLDER tokens for replacement."
  );
})();
