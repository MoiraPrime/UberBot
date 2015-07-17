//Required for Openshift
var http = require('http');

function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}

var server = http.createServer(handleRequest);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + port )
});

// Create the configuration
var auth = []
var authpass = "UberBOT"
var randomquote = ["If you see this, something is broken.","...And that's how Bush did 9/11","lol that UberActivist guy is such a pussy, I swear.","Drugs are bad, kids. I got ebola from meth once.","All hail gaben, the one true god.","No children have ever meddled with the Republican Party and lived to tell about it.","Congrats, you have unboxed an Unusual pile of debt."]

var config = {
	channels: ["#UberActivist"],
	server: "irc.rizon.net",
	botName: "UberBot"
};
// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

bot.addListener('error', function(message) {
    console.log('error: ', message);
});

//random number
function randomnum(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
};

// Everything below here is me
bot.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
	var msg = message.toLowerCase();
	if (msg.substr(0,5) == ".auth") {
		if (message.slice(6) == authpass) {
			auth[auth.length] = from;
			console.log(from + ' successfully authed')
		}
		else {
			console.log(from + ' failed to authenticate')
		};
	}
	else {
		for (i=0; i < auth.length; i++) {
			if (from==auth[i]){
				if (msg.substr(0,4) == ".say") {
					var msgs = message.split(" ")
					var maths = msgs[0].length + msgs[1].length + 2
					bot.say(msgs[1], from + ": " + message.slice(maths));
				};
				//else if (msg.substr(0,5) == ".join"){
				//	bot.join(message.slice(6));
				//}
				//else if (msg.substr(0,5) == ".part"){
				//	bot.part(message.slice(6));
				//};
			}
		};
	};
});

bot.addListener('message#UberActivist', function (from, message) {
	if (message.toLowerCase() == "hi" || message.toLowerCase() == "hello") {
		bot.say("#UberActivist",randomquote[randomnum(1,randomquote.length)]);
	};
});

