var inputString = process.argv;
var fs = require("fs");
var inquirer = require('inquirer');
var request = require("request");
var Twitter = require('twitter');
var spotify = require('spotify');
var tKeys = require('./keys.js');
var client = new Twitter(tKeys.twitterKeys);

LunchApp(process.argv[2], process.argv[3]);

function LunchApp(arg2, arg3){
    switch(arg2){
        case 'my-tweets':
            myTweets();
            break;
        case 'spotify-this-song':
            if ( !arg3 ){
                arg3 = 'The Sign Ace of Base';
            }
            spotifyThisSong(arg3);
            break;
        case 'movie-this':
            if (arg3.length > 0){
                movieThis(arg3);
            } else {
                console.log('Please specify the movie name.')
            }
            break;
        case 'do-what-it-says':
            doWhatItSays();
            break;
        case '*':
            showList();
            break;
        default:
            console.log("\nFor pick from the list -> *" +
            "\nPlease use a valid command after 'node liri.js':" +
            "\nFor Last 20 tweets -> my-tweets\nFor search for a song -> spotify-this-song '<song name here>'" + 
            "\nFor search for a movie -> movie-this '<movie name here>'\nFor random search -> do-what-it-says" + 
            "\n**********\n");
    };
};

function myTweets(){
    var params = {screen_name: 'amirizad_dev', count: 20};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if(error){
            console.log('Something went wrong while LOADING...');
            console.log(response.statusMessage + " - " + response.body);
        } else {
            var tweetsTxt = "\n*** Last 20 tweets ***\n------------------------------";
            for ( i = 0 ; i < tweets.length ; i++){
                tweetsTxt = tweetsTxt + "\n" + (i + 1) + ") Created on: " + tweets[i].created_at +
                "\n" + tweets[i].text + "\n------------------------------";
            }
            logResult(tweetsTxt);
        }
    });
};

function movieThis(movieName){
    var url = 'http://www.omdbapi.com/?t=' + movieName + '&apikey=40e9cece';
    request(url, function (error, response, data) {
        if(error){
            console.log('Something went wrong while SEARCHING...');
            console.log(response.statusMessage + " - " + response.body);
        } else {
            var movie = JSON.parse(data);
            var title = movie.Title;
            var year = movie.Year;
            var imdb = movie.imdbRating;
            var country = movie.Country;
            var language = movie.Language;
            var plot = movie.Plot;
            var actors = movie.Actors;
            var url = movie.Website;
            
            var movieText = "\n*** Movies search result ***\n------------------------------" +
                "\nTitle: " + title + "\nYear: " + year + "\nIMDB Rating: " + imdb +
                "\nCountry: " + country + "\nLabguage: " + language +
                "\nPlot: " + plot + "\nActors: " + actors + 
                "\nURL: " + url + "\n------------------------------";
            logResult(movieText);
        };
    });   
};

function spotifyThisSong(song){
    spotify.search({ type: 'track', query: song }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }
        var songs = data.tracks.items;
        var songsLen = songs.length;
        if ( songsLen === 0 ) {
            spotifyThisSong('The Sign Ace of Base');
        } else {
            var spotifyTxt = "\n*** Spotify search result ***\n------------------------------";
            var queryLen = 0;
            if ( songsLen > 4 ) {
                queryLen = 5;
            } else {
                queryLen = songsLen;
            }
            for (i = 0 ; i < queryLen ; i++){
                spotifyTxt = spotifyTxt + "\nSong " + (i + 1) + ")\nArtist(s): "
                for ( j = 0 ; j < songs[i].artists.length ; j++ ){
                    spotifyTxt = spotifyTxt  + (j > 0 ? ", " : "") + songs[i].artists[j].name;
                }
                spotifyTxt = spotifyTxt + "\nName: " + songs[i].name;
                spotifyTxt = spotifyTxt + "\nAlbum Name: " + songs[i].album.name;
                spotifyTxt = spotifyTxt + "\nPreview URL: " + songs[i].preview_url;
                spotifyTxt = spotifyTxt + "\n------------------------------";
            }
            logResult(spotifyTxt);
        };
    });    
};

function doWhatItSays(){
    fs.readFile('random.txt', "utf8", function(error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",").map(function(s){return s.trim()});
        LunchApp(dataArr[0], dataArr[1]);
    });
};

function showList(){

};

function logResult(txt){
    console.log(txt);
    fs.appendFile("log.txt", txt, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("SAVED");
    });
};