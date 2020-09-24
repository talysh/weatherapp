var currentWeatherApi = "15580072c59db7bc678ccd31999345cc";
var today = moment().format("M/D/YY");
var cities = [""];
var lastSearchedCity = {};


// Primary functions
// *********************************************
// *********************************************

// Given city name, return latitude and longitude
function getLatAndLon(cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${currentWeatherApi}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        searchCity(response.coord.lat, response.coord.lon, cityName);
    });
}

//Display daily forecast
function displayForecast(city, day) {
    var date = moment().add(day, 'days').format("M/D/YY");
    var dateDisplay = $("<p class='forecast-date'>").text(date);
    var temperature = $("<p>").text(`Temp: ${kelvinToFahrenheit(city.daily[day].temp.day)} °F`);
    var humidity = $("<p>").text(`Humidity: ${city.daily[day].humidity}%`);
    var weatherIcon = $("<img class='forecast-icon'>").attr("src", `http://openweathermap.org/img/w/${city.daily[day].weather[0].icon}.png`);
    weatherIcon.attr("alt", city.current.weather[0].main);

    $(`*[data-day="${day}"]`).empty();
    $(`*[data-day="${day}"]`).append(dateDisplay, weatherIcon, temperature, humidity);
}


// Search for city's weather information
function searchCity(lat, lon, cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${currentWeatherApi}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        persistLastCity(lat, lon, cityName);
        clearCityInfo();

        var cityAndDate = $("<p class='city-and-date'>").text(`${capitalize(cityName)} (${today})`);
        var weatherIcon = $("<img class='weather-icon'>").attr("src", `http://openweathermap.org/img/w/${response.current.weather[0].icon}.png`);
        weatherIcon.attr("alt", response.current.weather[0].main);
        cityAndDate.append(weatherIcon);
        var temperature = $("<p>").text(`Temperature: ${kelvinToFahrenheit(response.current.temp)} °F`);
        var humidity = $("<p>").text(`Humidity: ${response.current.humidity}%`);
        var windSpeed = $("<p>").text(`Wind Speed: ${response.current.wind_speed} MPH`);

        var uvIndex = $("<p>").html(`UV Index: <span style="color:white; background-color:${uvIndexStyler(parseFloat(response.current.uvi))}">${response.current.uvi}</span>`);

        $('.search-results').append(cityAndDate, temperature, humidity, windSpeed, uvIndex);

        for (let i = 1; i < 6; i++) {

            displayForecast(response, i);
        }


    });

}


//HELPER FUNCTIONS
// *********************************************
// *********************************************


// Add the curent city name to search history
function addCityToHistory(cityName) {
    var searchedCity = $(`<button class='btn text-left btn-outline-secondary ml-1 col-xl-12 searched-city' data-city='${cityName}'>`).text(cityName);
    $('.search-history').prepend(searchedCity);
}

// Clear the current city information 
function clearCityInfo() {
    $('.search-results').empty();
}


// Convert kelvin to fahrenheit
function kelvinToFahrenheit(kelvin) {
    return ((9 / 5) * (kelvin - 273) + 32).toFixed(2);
}

// Titlecase function from stack-overflow
function capitalize(cityName) {
    var split = cityName.toLowerCase().split(' ');
    for (var i = 0; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);
    }
    return split.join(' ');
}

function uvIndexStyler(uvIndex) {
    if (uvIndex < 4) {
        return "green";
    } else
        if (uvIndex < 7) {
            return "orange";
        } else {
            return "red";
        }
}


// Get user's current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}


// Display current conditions and weather forecast for the user's location
function showPosition(position) {
    searchCity(position.coords.latitude, position.coords.longitude, "Your location");
}


// Save last searched city to local storage
function persistLastCity(lat, lon, cityName) {
    var city = {
        lat: lat,
        lon: lon,
        cityName: cityName
    };

    var lastCity = JSON.stringify(city);
    localStorage.setItem("lastCity", lastCity);
}




// Event functions
// *********************************************
// *********************************************

// When search button is clicked if the city hasn't already been searched, look for it's current weather and 5-day forecast
$("#search-btn").on("click", function () {
    var cityName = $('.city-name').val().trim();
    if (!cities.includes(cityName.toLowerCase())) {
        cities.push(cityName.toLowerCase());
        getLatAndLon(cityName);
        addCityToHistory(capitalize(cityName));
    }
});

// Listen for click's on dynamically created buttons
$(document).on("click", ".searched-city", function () {
    getLatAndLon($(this).data('city'));
});





// Website startup
//On startup, if there is a last stored city in localStorage, display it's result, otherwise, display user location weather information
function startUp() {
    lastSearchedCity = JSON.parse(localStorage.getItem("lastCity"));
    if (lastSearchedCity) {
        searchCity(lastSearchedCity.lat, lastSearchedCity.lon, lastSearchedCity.cityName);
    } else getLocation();
}


startUp();