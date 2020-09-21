var currentWeatherApi = "15580072c59db7bc678ccd31999345cc"; // Username talysh
var today = moment().format("M/D/YYYY");

// Add the curent city name to search history
function addCityToHistory(cityName) {
    var searchedCity = $(`<button class='btn btn-outline-secondary ml-1 col-9 searched-city' data-city='${cityName}'>`).text(cityName);
    $('.search-history').append(searchedCity);
}


function clearCurrentCityInformation() {
    $('.search-results').empty();
}



function kelvinToFahrenheit(kelvin) {
    return ((9 / 5) * (kelvin - 273) + 32).toFixed(2);
}

// Titlecase function from stack-overflow
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}


function getLatAndLon(cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${currentWeatherApi}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        searchCity(response.coord.lat, response.coord.lon, cityName);
    });
}

function displayForecast(response, day) {
    var date = moment().add(day, 'days').format("M/D/YYYY");
    console.log(date);
    var dateDisplay = $("<p class='forecast-date'>").text(date);
    var temperature = $("<p>").text(`Temp: ${kelvinToFahrenheit(response.daily[day].temp.day)} °F`);
    var weatherIcon = $("<img class='forecast-icon'>").attr("src", `http://openweathermap.org/img/wn/${response.daily[day].weather[0].icon}@2x.png`);
    weatherIcon.attr("alt", response.current.weather[0].main);
    var humidity = $("<p>").text(`Humidity: ${response.daily[day].humidity}%`);
    $(`*[data-day="${day}"]`).empty();
    $(`*[data-day="${day}"]`).append(dateDisplay, weatherIcon, temperature, humidity);
}


function searchCity(lat, lon, cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${currentWeatherApi}`;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        clearCurrentCityInformation();
        console.log(response);
        var cityAndDate = $("<p class='city-and-date'>").text(`${titleCase(cityName)} (${today})`);
        var weatherIcon = $("<img class='weather-icon'>").attr("src", `http://openweathermap.org/img/wn/${response.current.weather[0].icon}@2x.png`);
        weatherIcon.attr("alt", response.current.weather[0].main);
        cityAndDate.append(weatherIcon);
        var temperature = $("<p>").text(`Temperature: ${kelvinToFahrenheit(response.current.temp)} °F`);
        var humidity = $("<p>").text(`Humidity: ${response.current.humidity}%`);
        var windSpeed = $("<p>").text(`Wind Speed: ${response.current.wind_speed} MPH`);
        var uvIndex = $("<p>").text(`UV Index: ${response.current.uvi}`);
        $('.search-results').append(cityAndDate, temperature, humidity, windSpeed, uvIndex);

        for (let i = 1; i < 6; i++) {

            displayForecast(response, i);
        }


    });

}
$("#search-btn").on("click", function () {
    var cityName = $('.city-name').val();
    getLatAndLon(cityName);
    addCityToHistory(titleCase(cityName));
});


$(document).on("click", ".searched-city", function () {
    getLatAndLon($(this).data('city'));
});
