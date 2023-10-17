// Grabbing HTML elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const historyList = document.getElementById('history-list');

// OpenWeather API Key and Base URL
const API_KEY = 'd87713e9b7796218c5f9a9980d9c9589';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Display weather data for Los Angeles initially
window.onload = function() {
    fetchWeatherData('Los Angeles');
    populateSearchHistory();
};

searchBtn.addEventListener('click', function() {
    const cityName = cityInput.value.trim();
    if (cityName) {
        fetchWeatherData(cityName);
    }
});

function fetchWeatherData(cityName) {
    const weatherUrl = `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=imperial`;
    
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data.list[0], cityName);
            displayForecast(data.list.slice(0, 40));
            saveToHistory(cityName);
        })
        .catch(error => {
            alert('Error fetching weather data.');
        });
}

function displayCurrentWeather(currentData, cityName) {
    const currentDate = new Date().toLocaleDateString();
    const temperature = currentData.main.temp;
    const humidity = currentData.main.humidity;
    const windSpeed = currentData.wind.speed;
    const weatherIcon = currentData.weather[0].icon;
    
    document.getElementById('current-city').textContent = `${cityName} (${currentDate})`;
    document.getElementById('current-temp').textContent = `${temperature}°F`;
    document.getElementById('current-humidity').textContent = `${humidity}%`;
    document.getElementById('current-wind').textContent = `${windSpeed} m/s`;
    document.getElementById('current-icon').src = `http://openweathermap.org/img/w/${weatherIcon}.png`;
}

function displayForecast(dailyData) {
    const forecastCards = document.querySelectorAll('.forecast-card');

    // Extract unique dates from the dailyData
    let uniqueDates = [...new Set(dailyData.map(data => new Date(data.dt * 1000).toLocaleDateString()))];

    // Ensure that we only consider the next 5 days including today.
    uniqueDates = uniqueDates.slice(0, 5);

    let dailyForecast = [];
    uniqueDates.forEach(date => {
        const noonForecast = dailyData.find(data => 
            new Date(data.dt * 1000).toLocaleDateString() === date && 
            new Date(data.dt * 1000).getHours() === 12
        );
        
        if (noonForecast) {
            dailyForecast.push(noonForecast);
        } else {
            const firstAvailableForecast = dailyData.find(data => 
                new Date(data.dt * 1000).toLocaleDateString() === date
            );
            if (firstAvailableForecast) {
                dailyForecast.push(firstAvailableForecast);
            }
        }
    });

    
    for (let i = 0; i < Math.min(dailyForecast.length, 5); i++) {

        const data = dailyForecast[i] ;

        const date = new Date(data.dt * 1000).toLocaleDateString();
        const temperature = data.main.temp;
        const windSpeed = data.wind.speed;
        const humidity = data.main.humidity;
        const weatherIcon = data.weather[0].icon;

        const card = forecastCards[i];
        card.querySelector('.forecast-date').textContent = date;
        card.querySelector('.forecast-icon').src = `http://openweathermap.org/img/w/${weatherIcon}.png`;
        card.querySelector('.forecast-temp').textContent = `Temp: ${temperature}°F`;
        card.querySelector('.forecast-wind').textContent = `Wind: ${windSpeed} m/s`;
        card.querySelector('.forecast-humidity').textContent = `Humidity: ${humidity}%`;
    }
}








function saveToHistory(cityName) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(cityName)) {
        history.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        populateSearchHistory();
    }
}

function populateSearchHistory() {
    historyList.innerHTML = '';
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        listItem.addEventListener('click', function() {
            fetchWeatherData(city);
        });
        historyList.appendChild(listItem);
    });
}
