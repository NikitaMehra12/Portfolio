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

const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");
const weatherApiKey = "4980fe85ca714dc158edd204de6344d2";

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    weatherResult.textContent = "Please enter a city.";
    return;
  }

  weatherResult.textContent = "Loading weather...";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Check the spelling.");
      }
      if (response.status === 401) {
        throw new Error("API key is invalid or not active yet.");
      }
      if (response.status === 429) {
        throw new Error("Too many requests. Please wait and try again.");
      }
      throw new Error(data.message || "Unable to fetch weather. Please try again.");
    }

    weatherResult.innerHTML =
      "<h3>" + data.name + "</h3>" +
      "<p>Temperature: " + data.main.temp + "°C</p>" +
      "<p>Condition: " + data.weather[0].description + "</p>";
  } catch (error) {
    weatherResult.textContent = error.message ||
      "Unable to fetch weather. Please try again.";
    console.error(error);
  }
}

if (weatherButton) {
  weatherButton.addEventListener("click", getWeather);
}

if (cityInput) {
  cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      getWeather();
    }
  });
}