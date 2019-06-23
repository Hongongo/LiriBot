/*
    Config
 */

require("dotenv").config();
var fs = require("fs");


var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var axios = require("axios");
var moment = require('moment');

var spotify = new Spotify(keys.spotify);

var type = process.argv[2];
var value = process.argv[3];

/*
    Handling system files
 */

function readFile(file) {
    fs.readFile(file, "utf8", function (error, data) {
            if (error) {
                return console.log(error);
            }

            var dataArray = data.split(",");
            processCommand(dataArray[0], dataArray[1]);
        }
    )
}

function appendFile(file, text){
    fs.appendFile(file, text, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Content Added");
        }
    });
}

/*
    Handling user input
 */

processCommand(type, value);

function processCommand(cmnd, value) {
    var executed = cmnd + " " + value+"\n";
    appendFile("log.txt", executed);
    switch (cmnd) {
        case "concert-this":
            getConcertInfo(value);
            break;
        case "spotify-this-song":
            getSpotifyInfo(value);
            break;
        case "movie-this":
            getMovieInfo(value);
            break;
        case "do-what-it-says":
            readFile("random.txt");
            break;
    }
}

/*
    Connections
 */

function getConcertInfo(value) {
    axios.get("https://rest.bandsintown.com/artists/" + value + "/events?app_id=codingbootcamp")
        .then(function (response) {
            printBandData(response.data, value)
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getSpotifyInfo(valueToExecute) {
    if (valueToExecute == undefined) {
        valueToExecute = "The Sign - Ace of base";
    }
    spotify.search(
        {
            type: 'track', query: valueToExecute
        }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        printSpotifyData(data);
    });
}

function getMovieInfo(valueToExecute) {
    if (valueToExecute == undefined) {
        valueToExecute = "Mr. Nobody";
    }

    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + valueToExecute)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

/*
    Printing data
 */

function printBandData(data, searchValue) {
    for (let i = 0; i < data.length; i++) {
        var search = searchValue;
        var name = data[i].venue.name;
        var location = data[i].venue.city + ", " + data[i].venue.country;
        var date = moment(data[i].datetime).format("MM-DD-YYYY");

        console.log("Search: " + search
            + "\nName: " + name
            + "\nLocation: " + location
            + "\nDate: " + date);
        console.log("**************************");
    }
}

function printSpotifyData(data) {
    for (let i = 0; i < data.tracks.items.length; i++) {
        var artist = data.tracks.items[i].artists[0].name;
        var song = data.tracks.items[i].name;
        var album = data.tracks.items[i].album.name;
        var preview = data.tracks.items[i].preview_url;

        if (preview == null) {
            preview = "No preview available."
        }

        console.log("Artist: " + artist
            + "\nSong: " + song
            + "\nAlbum: " + album
            + "\nPreview: " + preview);
        console.log("**************************");
    }
}
