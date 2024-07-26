const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".btn");
const locationButton = document.querySelector(".lbtn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_key = "4cc98c822335bc1a87f46484418bbe46";

const createWeatherCard = (cityName, element, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${element.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(element.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${element.wind.speed} M/S</h4>
                    <h4>Humidity: ${element.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png">
                    <h4>${element.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>${element.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png">
                    <h4>Temperature: ${(element.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${element.wind.speed} M/S</h4>
                    <h4>Humidity: ${element.main.humidity}%</h4>
                </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const Weather_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

    fetch(Weather_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];

            const fiveDays = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });
            cityInput.value = "";
            weatherCardsDiv.innerHTML = ""; // Clear previous results
            currentWeatherDiv.innerHTML = ""; // Clear previous results

            fiveDays.forEach((element, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, element, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, element, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                  
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Request denied")
            }
        }
    )
}

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
