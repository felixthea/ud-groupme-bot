var HTTPS = require('https');

var botID = process.env.BOT_ID;

function respond() {
//   console.log("in respond");
//   console.log("this.req.chunks[0]: ", this.req.chunks[0]);
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/bot$/,
      msg = request.text,
      firstWord = msg.split(" ")[0],
      cmd = msg.split(" ")[1];

  if(request.text && botRegex.test(firstWord) && cmd) {
    var commands = {
      "help": sendHelp,
      "8ball": eightBall
    };

    this.res.writeHead(200);

    commands[cmd]();

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