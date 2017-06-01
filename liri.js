var inputString = process.argv;
var fs = require("fs");
var inquirer = require('inquirer');
var request = require("request");
var Twitter = require('twitter');
var tKeys = require('./keys.js');
var client = new Twitter(tKeys.twitterKeys);
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi(tKeys.spotifyKeys);
var omdbapiKey = tKeys.omdbapiKey.key;

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    // console.log('The access token expires in ' + data.body['expires_in']);
    // console.log('The access token is ' + data.body['access_token']);
    spotifyApi.setAccessToken(data.body['access_token']);
    LunchApp(process.argv[2], process.argv[3]);
  }, function(err) {
        console.log('Something went wrong when retrieving an access token', err);
  });



function LunchApp(arg2, arg3){
    switch(arg2){
        case 'my-tweets':
            myTweets();
            break;
        case 'spotify-this-song':
        debugger;
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
            console.log("\n**********" +
            "\nPlease use a valid command after 'node liri.js':\n" +
            "\n- For pick from the list -> *" +
            "\n- For Last 20 tweets -> my-tweets" +
            "\n- For search a song  -> spotify-this-song '<song name here>'" + 
            "\n- For search a movie -> movie-this '<movie name here>'" +
            "\n- For random search  -> do-what-it-says" + 
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
    var url = 'http://www.omdbapi.com/?t=' + movieName + '&apikey=' + omdbapiKey;
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
    spotifyApi.searchTracks(song)
    .then(function(data) {
        // console.log('Search by "' + song + '"', data.body);
        var songs = data.body.tracks.items;
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


    }, function(err) {
        console.log('Error occurred: ' + err);
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
    inquirer.prompt([
        {
            type: "list",
            message: "What do you want LIRI to do for you?",
            choices: ["Show tweets", "Spotify a Song", "Search for a Movie", "Do what it says!"],
            name: "LIRI"
        },
    ]).then(function(choice) {
        var  thisLIRI = choice.LIRI;
        switch(thisLIRI){
            case 'Spotify a Song':
                inquirer.prompt([
                    {
                        type: "input",
                        message: "What is your desired song?",
                        name: "song"
                    }
                ]).then(function(song) {
                    LunchApp('spotify-this-song', song.song);
                });
                break;
            case 'Search for a Movie':
                inquirer.prompt([
                    {
                        type: "input",
                        message: "What is your desired movie?",
                        name: "movie"
                    }
                ]).then(function(movie) {
                    LunchApp('movie-this', movie.movie);
                });
                break;
            default:
                if (thisLIRI === 'Show tweets'){
                    thisLIRI = 'my-tweets';
                };
                if (thisLIRI === 'Do what it says!'){
                    thisLIRI = 'do-what-it-says';
                };
                LunchApp(thisLIRI, '');
        };
    });
};

function logResult(txt){
    console.log(txt);
    fs.appendFile("log.txt", txt, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("Result SAVED in log.txt");
    });
};