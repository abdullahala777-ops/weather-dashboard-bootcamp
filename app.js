// لوحة الطقس: الجلسة 19 (بيانات Open-Meteo)
// افتح الصفحة بـ Live Server لأن الملفات من نوع module

import { getCityWeather } from "./weather-api.js";


const MIN_LETTERS = 3;
const DEBOUNCE_MS = 600;

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const recentBox = document.querySelector("#recent");
const statusText = document.querySelector("#status");
const spinner = document.querySelector("#spinner");
const currentBox = document.querySelector("#current");
const forecastSection = document.querySelector("#forecast-section");
const forecastList = document.querySelector("#forecast");

const state = {
    status: "idle", // idle - loading - error - success
    error: "",
    weather: null,
    place: null,
    fromCashe: false
}

function describe(code) {
  if (code === 0) return { text: "سماء صافية", icon: "☀️" };
  if (code === 1) return { text: "صافي غالباً", icon: "🌤️" };
  if (code === 2) return { text: "غائم جزئياً", icon: "⛅" };
  if (code === 3) return { text: "غائم", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "ضباب", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { text: "رذاذ", icon: "🌦️" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { text: "مطر", icon: "🌧️" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { text: "ثلج", icon: "❄️" };
  if (code >= 95) return { text: "عاصفة رعدية", icon: "⛈️" };
  return { text: "غير معروف", icon: "🌡️" };
}

// نكتب الباقي مع بعض في اللايف، مرحلة بمرحلة

function render() {
    spinner.hidden = state.status !== "loading";
    statusText.classList.toggle("error", state.status === "error");

    if(state.status === "loading") statusText.textContent = "جاري جلب الطقس..."
    else if(state.status === "error") statusText.textContent = state.error;
    else if(state.status === "success") statusText.textContent = "اقل من 10 دقايق من الذاكرة"
    else statusText.textContent = "اكتب اسم المدينة و انتظر لحظة";

    const hasData = state.status === "success";
    currentBox.hidden = !hasData
    forecastSection.hidden = !hasData

    if(hasData){
        console.log(state)
        renderCurrent();
        renderForecast();
    }

    // renderRecent();
}

function renderCurrent() {
     const c = state.weather.current;
     const place = state.place;
     const temp = Math.round(c.temperature_2m);
     const look = describe(c.weather_code);

    document.querySelector("#icon").textContent = look.icon;
    document.querySelector("#description").textContent = look.text
    document.querySelector("#city-name").textContent = place.country ? `${place.name}, ${place.country}` : place.name
    document.querySelector("#temp").textContent = `${temp}`
    document.querySelector("#feels").textContent = `${Math.round(c.apparent_temperature)}`;
    document.querySelector("#humidity").textContent = `${c.relative_humidity_2m}`;
    document.querySelector("#wind").textContent = `${c.wind_speed_10m} م/ث`
    }

function renderForecast() {
    const daily = weather.daily;
    return;
}

let lastRequest = 0;

async function search(city) {
    if(!city) return;
    const requestId = ++lastRequest;
    state.status = "loading";
    render();
    console.log(city, "inside search")

    try{
        const data = await getCityWeather(city);
        console.log("skip");
        if(requestId !== lastRequest) return;
        state.place = data.place
        state.weather = data.weather;
        state.fromCashe = data.fromCashe;
        state.status = "success";
    }catch(error) {
        if(requestId !== lastRequest) return;
        state.status = "error";
        state.error = error.message
    }
    render()
}

const debouncedSearch = debounce(search, DEBOUNCE_MS)

function debounce(fn, delay) {
    let timerId; 
    const debounced = (value) => {
        clearInterval(timerId);
        timerId = setTimeout(() => fn(value), delay);
    }
    debounced.cancel = () => clearTimeout(timerId);
    return debounced
}

cityInput.addEventListener("input", () => {
    const city = cityInput.value.trim();
    if(city.length >= MIN_LETTERS) debouncedSearch(city)
})

form.addEventListener("submit", (event) => {
    event.preventDefault();
    debouncedSearch.cancel();
    search(cityInput.value.trim());
})


render();

