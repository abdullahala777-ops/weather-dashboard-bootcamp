// كل التعامل مع Open-Meteo و localStorage في هذا الملف
// Open-Meteo مجاني للاستخدام غير التجاري وما يحتاج مفتاح

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CASHE_MINS = 10;
const CACHE_KEY = "weatherCashe";


// نكتب getJson و findCity و getForecast و getCityWeather مع بعض في اللايف
async function getJson(url) {
    let response;
    try {
        response = await fetch(url);
    } catch(error) {
        throw new Error("تأكد من الاتصال بالانترنت");
    }
    if(response.status === 429) throw new Error("طلبات كثيرة, جرب بعد دقيقة");
    if(!response.ok) throw new Error("الخدمة غير متاحة");

    return response.json();
}


async function findCity(city) {
    const url = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=ar&format=json`;
    const data = await getJson(url);

    if(!data.results || data.results.length === 0) {
        throw new Error(`ما لقينا مدينة اسمها ${city}`)
    }

    console.log(data.results[0])
    return data.results[0];
}

async function getForecast(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: 5,
    wind_speed_unit: "ms",
  });
    console.log(params);
    return getJson(`${FORECAST_URL}?${params}`)
}

function readCache() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY))
    } catch(err) {
        return {};
    }
}

export async function getCityWeather(city) {
    const key = city.trim();
    // const cache = readCache();
    // const saved = cache[key];
    // if(saved && Date.now() - saved.time < CASHE_MINS * 60 * 1000) {
    //     return { ...saved.data, fromCashe: true}
    //  }

    const place = await findCity(city);
    console.log(place)
    const weather = await getForecast(place);

    const data = {
        place,
        weather,
    }

    //  cache[key] = {time: Date.now(), data};

    return {
        ...data,
        fromCashe: false
    }
}