var currentWeatherApi = "15580072c59db7bc678ccd31999345cc"; // Username talysh
var now = moment().format("M/D/YYYY");

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


function getUVIndex(lat, lon) {


    var queryURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${currentWeatherApi}&lat=${lat}&lon=${lon}`;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var uvIndex = $("<p>").text(`UV Index: ${response.value}`);
        $('.search-results').append(uvIndex);
    });

}

function searchCity(cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${currentWeatherApi}`;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        addCityToHistory(response.name);
        var cityAndDate = $("<p class='city-and-date'>").text(`${response.name} (${now})`);
        var temperature = $("<p>").text(`Temperature: ${kelvinToFahrenheit(response.main.temp)} °F`);
        var humidity = $("<p>").text(`Humidity: ${response.main.humidity}%`);
        var windSpeed = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
        getUVIndex(response.coord.lat, response.coord.lon);
        //    var uvIndex = $("<p>").text(`UV Index: ${response.wind.speed} MPH`);
        clearCurrentCityInformation();
        $('.search-results').append(cityAndDate, temperature, humidity, windSpeed);


    });

}
$("#search-btn").on("click", function () {
    var cityName = $('.city-name').val();
    searchCity(cityName);
});

