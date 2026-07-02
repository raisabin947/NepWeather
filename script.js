const BASE_URL = "https://api.openweathermap.org/data/2.5";

const state = {
  unit: "metric",
  lastCity: localStorage.getItem("lastCity") || ""
};

const elements = {
  currentLocation: document.getElementById("currentLocation"),
  currentDate: document.getElementById("currentDate"),
  currentTime: document.getElementById("currentTime"),
  cityInput: document.getElementById("cityInput"),
  searchForm: document.getElementById("searchForm"),
  locationBtn: document.getElementById("locationBtn"),
  unitToggle: document.getElementById("unitToggle"),

  loadingScreen: document.getElementById("loadingScreen"),
  messageContainer: document.getElementById("messageContainer"),

  weatherSection: document.getElementById("weatherSection"),
  forecastSection: document.getElementById("forecastSection"),
  hourlySection: document.getElementById("hourlySection"),
  emptyState: document.getElementById("emptyState"),

  forecastContainer: document.getElementById("forecastContainer"),
  hourlyContainer: document.getElementById("hourlyContainer")
};
const weather = {
  cityName: document.getElementById("cityName"),
  countryName: document.getElementById("countryName"),
  weatherIcon: document.getElementById("weatherIcon"),
  temperature: document.getElementById("temperature"),
  weatherCondition: document.getElementById("weatherCondition"),
  feelsLike: document.getElementById("feelsLike"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  uvIndex: document.getElementById("uvIndex"),
  airQuality: document.getElementById("airQuality"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset")
};

/*DATE & TIME*/

function updateClock() {
  const now = new Date();

  elements.currentDate.textContent =
    now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

  elements.currentTime.textContent =
    now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
}

setInterval(updateClock, 1000);
updateClock();

/*HELPERS*/

function showLoading() {
  elements.loadingScreen.classList.remove("hidden");
}

function hideLoading() {
  elements.loadingScreen.classList.add("hidden");
}

function hideSplashScreen() {
  const splashScreen = document.getElementById("splashScreen");
  if (splashScreen) {
    splashScreen.classList.add("hide");
  }
}

function showError(message) {
  elements.messageContainer.textContent = message;
  elements.messageContainer.classList.remove("hidden");
}

function clearError() {
  elements.messageContainer.classList.add("hidden");
}

function showSections() {
  elements.emptyState.classList.add("hidden");

  elements.weatherSection.classList.remove("hidden");
  elements.forecastSection.classList.remove("hidden");
  elements.hourlySection.classList.remove("hidden");
}

function getIcon(icon) {
  return `https://openweathermap.org/img/wn/${icon}@4x.png`;
}

function formatTime(timestamp) {
  return new Date(timestamp * 1000)
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
}

/*BACKGROUND*/

function updateBackground(condition) {
  document.body.className = "";

  const c = condition.toLowerCase();

  if (c.includes("clear")) {
    document.body.classList.add("sunny");
  } else if (c.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (
    c.includes("rain") ||
    c.includes("drizzle")
  ) {
    document.body.classList.add("rainy");
  } else if (c.includes("snow")) {
    document.body.classList.add("snowy");
  } else if (c.includes("thunder")) {
    document.body.classList.add("thunderstorm");
  } else {
    document.body.classList.add("mist");
  }
}

/*API*/

async function fetchWeather(city) {
  const response = await fetch(
    `${BASE_URL}/weather?q=${city}&units=${state.unit}&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("City not found.");
  }

  return response.json();
}

async function fetchForecast(city) {
  const response = await fetch(
    `${BASE_URL}/forecast?q=${city}&units=${state.unit}&appid=${API_KEY}`
  );

  return response.json();
}

async function fetchAQI(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );

  return response.json();
}

async function fetchUV(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${API_KEY}`
  );

  return response.json();
}

/* RENDER*/

function renderWeather(data) {
  weather.cityName.textContent = data.name;
  weather.countryName.textContent =
    data.sys.country;

  weather.temperature.textContent =
    `${Math.round(data.main.temp)}°`;

  weather.weatherCondition.textContent =
    data.weather[0].description;

  weather.feelsLike.textContent =
    `${Math.round(data.main.feels_like)}°`;

  weather.humidity.textContent =
    `${data.main.humidity}%`;

  weather.windSpeed.textContent =
    `${data.wind.speed} m/s`;

  weather.pressure.textContent =
    `${data.main.pressure} hPa`;

  weather.visibility.textContent =
    `${(data.visibility / 1000).toFixed(1)} km`;

  weather.sunrise.textContent =
    formatTime(data.sys.sunrise);

  weather.sunset.textContent =
    formatTime(data.sys.sunset);

  weather.weatherIcon.src =
    getIcon(data.weather[0].icon);

  weather.weatherIcon.alt =
    data.weather[0].description;

  elements.currentLocation.textContent =
    `${data.name}, ${data.sys.country}`;

  updateBackground(
    data.weather[0].main
  );
}

function renderHourly(data) {
  elements.hourlyContainer.innerHTML = "";

  const hours = data.list.slice(0, 8);

  hours.forEach(item => {
    const card =
      document.createElement("div");

    card.className = "hour-card";

    card.innerHTML = `
      <p>
        ${new Date(item.dt * 1000)
          .toLocaleTimeString([], {
            hour: "numeric"
          })}
      </p>

      <img
        src="${getIcon(
          item.weather[0].icon
        )}"
      >

      <h3>
        ${Math.round(
          item.main.temp
        )}°
      </h3>
    `;

    elements.hourlyContainer
      .appendChild(card);
  });
}

function renderForecast(data) {
  elements.forecastContainer.innerHTML =
    "";

  const days = data.list.filter(
    x =>
      x.dt_txt.includes(
        "12:00:00"
      )
  );

  days.forEach(day => {
    const card =
      document.createElement("div");

    card.className =
      "forecast-card";

    card.innerHTML = `
      <h3>
        ${new Date(day.dt * 1000)
          .toLocaleDateString([], {
            weekday: "short"
          })}
      </h3>

      <img
        src="${getIcon(
          day.weather[0].icon
        )}"
      >

      <p>
        ${day.weather[0].description}
      </p>

      <strong>
        ${Math.round(
          day.main.temp_max
        )}°
        /
        ${Math.round(
          day.main.temp_min
        )}°
      </strong>
    `;

    elements.forecastContainer
      .appendChild(card);
  });
}

/* AQI */

function getAQI(level) {
  const map = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor"
  };

  return map[level];
}

/* LOAD CITY */

async function loadCity(city) {
  try {
    showLoading();
    clearError();

    const weatherData =
      await fetchWeather(city);

    const forecast =
      await fetchForecast(city);

    renderWeather(weatherData);
    renderHourly(forecast);
    renderForecast(forecast);

    const aqi =
      await fetchAQI(
        weatherData.coord.lat,
        weatherData.coord.lon
      );

    weather.airQuality.textContent =
      getAQI(
        aqi.list[0].main.aqi
      );

    try {
      const uv =
        await fetchUV(
          weatherData.coord.lat,
          weatherData.coord.lon
        );

      weather.uvIndex.textContent =
        uv.current.uvi;
    } catch {
      weather.uvIndex.textContent =
        "N/A";
    }

    localStorage.setItem(
      "lastCity",
      city
    );

    showSections();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

/* LOCATION */

function getCurrentLocation() {
  if (
    !navigator.geolocation
  ) {
    showError(
      "Geolocation unsupported."
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      const {
        latitude,
        longitude
      } = position.coords;

      try {
        showLoading();

        const response =
          await fetch(
            `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${state.unit}&appid=${API_KEY}`
          );

        const data =
          await response.json();

        loadCity(data.name);
      } catch {
        showError(
          "Unable to get location."
        );
      } finally {
        hideLoading();
      }
    },
    () => {
      showError(
        "Location permission denied."
      );
    }
  );
}

/*EVENTS*/

elements.searchForm.addEventListener(
  "submit",
  e => {
    e.preventDefault();

    const city =
      elements.cityInput.value.trim();

    if (!city) {
      showError(
        "Please enter a city."
      );
      return;
    }

    loadCity(city);
    elements.cityInput.value = "";
  }
);

elements.locationBtn.addEventListener(
  "click",
  getCurrentLocation
);

elements.unitToggle.addEventListener(
  "click",
  () => {
    state.unit =
      state.unit === "metric"
        ? "imperial"
        : "metric";

    const last =
      localStorage.getItem(
        "lastCity"
      );

    if (last) {
      loadCity(last);
    }
  }
);

window.addEventListener(
  "offline",
  () => {
    showError(
      "No internet connection."
    );
  }
);

/* INIT */

window.addEventListener(
  "DOMContentLoaded",
  () => {
    // Hide splash screen after 2.5 seconds (loading bar animation duration)
    setTimeout(() => {
      hideSplashScreen();
    }, 2500);

    if (state.lastCity) {
      loadCity(
        state.lastCity
      );
    } else {
      getCurrentLocation();
    }
  }
);
window.addEventListener("load", () => {
  const splash = document.getElementById("splashScreen");

  setTimeout(() => {
    splash.classList.add("hide");

    setTimeout(() => {
      splash.remove();
    }, 1000);
  }, 2500);
});