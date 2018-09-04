# Stratos, A Tournament Bot

This bot, known as Stratos, was made to be used over the [Discord API](https://discordapp.com/developers/docs/) in the [Elevate Discord Server](https://discord.io/elevate).
The purpose of Stratos is to automate the process of creating "Song of the Week" tournaments, known as Triumphant in the Elevate Discord.

Stratos was coded using [node.js](https://nodejs.org), mainly with the [discord.js](https://discord.js.org) module.
For security reasons, all API keys and access tokens are hidden in this repository.

Stratos makes use of several APIs, which are listed below:

## Discord API

Stratos operates using a client on the [Discord API](https://discordapp.com/developers/docs/) via the [discord.js module](https://discord.js.org). 
Using the API, Stratos is able to read and send messages, change and update tournament or match settings, and record votes, using in-chat commands from the Discord server.
All of the code used to operate within the Discord API can be found in the [bot.js file](https://github.com/bryan-ojay/stratos-bot/blob/master/bot.js).

## SoundCloud API

Stratos uses the [SoundCloud API](https://developers.soundcloud.com/docs/api/guid) to obtain SoundCloud tracks for the weekly tournaments. 
Though not implemented at the moment, Stratos will be able to like, repost and add the obtained SoundCloud tracks to playlists in the near future. 
All of the code used to operate within the SoundCloud API can be found mostly in the [soundcloud.js file](https://github.com/bryan-ojay/stratos-bot/blob/master/soundcloud.js).

## Reddit API

Stratos uses the [Reddit API](https://www.reddit.com/dev/api/) via the [snoowrap module](https://github.com/not-an-aardvark/snoowrap) to post the tracks for each weekly tournament on the [Elevate subreddit](https://reddit.com/r/elevate).
Using the Reddit APi, Stratos is able to create, edit, and add flairs to posts made on a provided reddit account. 
All of the code used to operate within the Reddit API can be found mostly in the [reddit.js file](https://github.com/bryan-ojay/stratos-bot/blob/master/reddit.js).
An example of the Reddit posts can be found [here](https://redd.it/9cl1am).

## Challonge API

Stratos uses the [Challonge API](https://api.challonge.com/v1) via the [node-challonge module](https://github.com/Tidwell/node-challonge) to create a visual bracket for the weekly tournaments.
Stratos is able to create tournaments as well as update and edit scores in each tournament match. 
All of the code used to operate within the Challonge API can be found mostly in the [challonge.js file](https://github.com/bryan-ojay/stratos-bot/blob/master/challonge.js).
An example of the Challonge brackets can be found [here](https://challonge.com/tw057).
