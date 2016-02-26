var HTTPS = require('https'),
Forecast = require('forecast.io'),
botID = process.env.BOT_ID,
Q = require("q");

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/bot$/,
      msg = request.text,
      firstWord = msg.split(" ")[0],
      cmd = msg.split(" ")[1],
      rest = msg.split(" ").slice(2);

  if(request.text && botRegex.test(firstWord) && cmd) {
    var commands = {
      "help": sendHelp,
      "8ball": eightBall,
      "weather": weather
    };

    this.res.writeHead(200);

    commands[cmd](rest);

    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function sendHelp() {
  var response = "8ball - magic 8ball\ngif - for a gif";
  postMessage(response);
}

function eightBall() {
  var answers = [
    'It is certain',
    'It is decidedly so',
    'Without a doubt',
    'Yes, definitely',
    'You may rely on it',
    'As I see it, yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',
    'Reply hazy try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
    "Don't count on it",
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful'
  ],
  selectedAnswer;

  selectedAnswer = answers[Math.floor(Math.random() * answers.length)];

  postMessage(selectedAnswer);
}

function weather(rest) {
  var options;

  console.log(getLatLong(rest[0]));
  // zipData = getLatLong(rest[0]);
  // console.log('zipData: ', zipData);
  // lat = zipData.lat,
  // lng = zipData.lng;

  // options = {
  //   APIKey: process.env.FORECAST_API_KEY
  // };

  // forecast = new Forecast(options);

  // forecast.get(lat, lng, function (err, res, data) {
  //   if (err) throw err;
  //   var today = data.daily.data[0],
  //   tomorrow = data.daily.data[1],
  //   msg;

  //   msg = "Today: " + writeWeather(today.summary, today.temperatureMax, today.temperatureMin);
  //   msg += "\nTomorrow: " + writeWeather(tomorrow.summary, tomorrow.temperatureMax, tomorrow.temperatureMin);

  //   postMessage(msg);
  // });

  // postMessage("done");
}

function getLatLong(zip) {
  var options,
  auth_id = process.env.ZIPCODE_AUTH_ID,
  auth_token = process.env.ZIPCODE_AUTH_TOKEN;

  options = {
    hostname: 'api.smartystreets.com',
    path: '/zipcode?' + 'auth-id=' + auth_id + '&' + 'auth-token=' + auth_token + '&zipcode=' + zip,
    method: 'GET'
  }

  var botReq = HTTPS.request(options, function(res) {
    var str = '';

    res.on('data', function (chunk) {
      str += chunk;
    })

    res.on('end', function() {
      return JSON.parse(str);
    })
  });

  botReq.end();
  return botReq;
}

function writeWeather(s,h,l){
  h = Math.round(h);
  l = Math.round(l);

  return s + " The high is " + h + " and the low is " + l + ".";
}

function postMessage(botResponse) {
  var botResponse, options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;