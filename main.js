var version = "v1.3.3 (07172015N)"

//Required for Openshift
var http = require('http');

function handleRequest(request, response){
    response.end('UberBot '+version+' is Online.');
}

var server = http.createServer(handleRequest);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

server.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});

//database
var mongojs = require('mongojs');
var connection_string = process.env.OPENSHIFT_APP_NAME || 'nodejs';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
var db = mongojs(connection_string, ['visitor','info']);

// Create the configuration
var auth = []
var authpass = "redacted"
var randomquote = ["If you see this, something is broken.","...And that's how Bush did 9/11","lol that UberActivist guy is such a pussy, I swear.","Drugs are bad, kids. I got ebola from meth once.","All hail gaben, the one true god.","No children have ever meddled with the Republican Party and lived to tell about it.","Congrats, you have unboxed an Unusual pile of debt.","Woah woah woah, take it easy man.","Oh god what did I do with my weed stash?"]

var config = {
	channels: ["#UberActivist"],
	server: "irc.rizon.net",
	botName: "UberBot",
	realName:"UberBot",
	userName:"UberBot"
};
// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels,
	realName: config.realName,
	userName: config.userName
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
			console.log(from + ' successfully authed');
			bot.say(from,"You have been successfully authed.");
		}
		else {
			console.log(from + ' failed to authenticate')
			bot.say(from,"Authentication failed")
		};
	}
	else if (msg.substr(0,5) == ".help") {
		bot.say(from,"--------Commands--------");
		bot.say(from,".help -- Lists the commands you are able to use.");
		bot.say(from,".auth <password> -- Authenticates you as a Bot Admin");
		bot.say(from,".say <#channel/Nick> <message> -- Send a message to a person/channel.");
		bot.say(from,".me <#channel/Nick> <message> -- Send action to a person/channel.");
		bot.say(from,".join <#channel> -- Make the bot join a channel.");
		bot.say(from,".part <#channel> -- Make the bot part a channel.");
		bot.say(from,".version -- Returns the version of UberBot.");
		bot.say(from,"-----End Of Commands-----");
	}
	else if (msg.substr(0,8) == ".version") {
		bot.say(from,"I'm running UberBot "+version);
		bot.say(from,"For more information PM UberActivist and he'll get back to you as soon as possible.");
	}
	else {
		for (i=0; i < auth.length; i++) {
			var authed = false
			if (from == auth[i]){
				authed = true
				if (msg.substr(0,4) == ".say") {
					var msgs = message.split(" ")
					var maths = msgs[0].length + msgs[1].length + 2
					bot.say(msgs[1], from + ": " + message.slice(maths));
				}
				else if (msg.substr(0,3) == ".me") {
					var msgs = message.split(" ")
					var maths = msgs[0].length + msgs[1].length + 2
					bot.action(msgs[1], from + ": " + message.slice(maths));
				}
				else if (msg.substr(0,5) == ".join"){
					bot.join(message.slice(6));
				}
				else if (msg.substr(0,5) == ".part"){
					bot.part(message.slice(6));
				};
			}
			else {
				if (i == auth.length && authed == false) {
					bot.say(from,"You are not authorized to do that.");
				};
			};
		};
	};
});

bot.addListener('message#UberActivist', function (from, message) {
	if (message.toLowerCase() == "hi" || message.toLowerCase() == "hello") {
		bot.say("#UberActivist",randomquote[randomnum(1,randomquote.length)]);
	}
	else if (message.toLowerCase().substr(0,5) == ".help") {
		bot.notice(from,"--------Commands--------");
		bot.notice(from,".help -- Lists the commands you are able to use.");
		bot.notice(from,".visits -- Lists the number of Visits this channel has on record.");
		bot.notice(from,".joinmessage <message> -- Assign a message or quote to be said when you join the channel.");
		bot.notice(from,".version -- Returns the version of UberBot.");
		bot.notice(from,"-----End Of Commands-----");
	}
	else if (message.toLowerCase().substr(0,8) == ".version") {
		bot.notice(from,"I'm running UberBot "+version);
		bot.notice(from,"For more information PM UberActivist and he'll get back to you as soon as possible.");
	}
	else if (message.toLowerCase().substr(0,7) == ".visits") {
		db.visitor.find({query: {name: "UberActivist"}}).limit(1, function(err, doc) {
			if ( typeof(doc) == 'object' && (doc instanceof Array) && doc[0] && doc[0].name) {
				bot.notice(from, "There have been " + doc[0].score + " visitors to #UberActivist");
			}
		});
	}
	else if (message.toLowerCase().substr(0,12) == ".joinmessage") {
		db.info.find({query: {name: from}}).limit(1, function(err, doc) {
			if( typeof(doc)=='object'
				&& (doc instanceof Array)
				&& doc[0] && doc[0].name)
			{
				// update
				db.info.update({name: from}, {$set:{listing:message.slice(13)}}, function(err) {
				bot.notice(from, "Updated your join message");
				});
			}		else{
				// insert
				db.info.insert({name: from, listing: message.slice(13)}, function(err) {
				bot.notice(from, "Added your join message.");
				});
			}
		});
	}
});

bot.addListener('join#UberActivist', function (person,raw) {
	if (person != "UberBot") {
		bot.notice(person,"Welcome to #UberActivist, "+person+"! Say .help for a list of commands.");
		db.visitor.find({query: {name: "UberActivist"}}).limit(1, function(err, doc) {
			if( typeof(doc)=='object'
				&& (doc instanceof Array)
				&& doc[0] && doc[0].name)
			{
				// update
				db.visitor.update({name: "UberActivist"}, {$inc:{score:1}}, function(err) {
				bot.notice(person, "You are visitor number " + ( 1 + doc[0].score ));
				});
			}		else{
				// insert
				db.visitor.insert({name: "UberActivist", score: 1}, function(err) {
				bot.notice(person, "You are visitor number 1");
				});
			}
		});
		db.info.find({query: {name: person}}).limit(1, function(err, doc) {
			if( typeof(doc)=='object'
				&& (doc instanceof Array)
				&& doc[0] && doc[0].name)
			{
				// say it
				bot.say("#UberActivist","["+ person + "] "+doc[0].listing)
			};
		});
	};
});