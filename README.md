# Stratos, A Tournament Bot

## [Bot Wiki](https://github.com/bryan-ojay/stratos-bot/blob/master/WIKI.md)

## General Commands

- `*ping` / `*pong`: Pings the bot. Bot responds with `Pong!` or `Ping.`

- `*admin?` : Checks if you have privileges to use Administrator Commands. Bot responds with `Yep!` or `Nope!`

- `*info [soundcloud link]` : Bot gathers and responds with the author and title of the posted soundcloud link
  
  **Example**: `*info https://soundcloud.com/alex/soundcloud-wave-by-ibutters`
  
  Bot responds with:   
  **Name**: Alex  
  **Title**: SoundCloud Wave (by @ibutters)
  
- `*admins` : Bot responds with the roles that have privileges to use Administrator Commands.

- `*competitors` : Bot listing the competitors in the current weekly tournament.

- `*submit` : Bot responds with a link to the [Triumphant Submission Thread](https://redd.it/8e5xz0).

## Administrator Commands
These commands are locked to roles given the privileges to use these commands.

- `*ded!!` : Kills the bot, bot is shut down until started up again

- `*setsubmit [reddit link]` : Sets the link for the [Triumphant Submission Thread](https://redd.it/8e5xz0).

- `*addadmin [role name]` : Adds the given role to the admin list, if it exists in the server.

- `*deladmin [role name]` : Deletes the given role from the admin list, if it exists in the admin list.

- `*settrack [num] [link] [user]` : Sets a track for the weekly tournament. Existing competitors can be shown using the `*competitors` command.  
  Requires a number from 1-8, a valid soundcloud link and a valid Discord user.
  
- `*setweek [num]` : Sets the week number for the competition.

- `*setheader [num] [picture link]`: Sets the header image for each tournament match day.  
  Requires a number from 1-7 and a valid picture link.
  
- `*setemoji [num] [emoji]` : Sets the emote to vote for tracks with (Currently does not work with unicode emojis).
  Requires a number from 1-2 and a valid emote
  
- `*setspecial [event name]` : Sets the special event name for the weekly tournament. Clears automatically after the week ends.  
  Example: `*setspecial Track of the Month` sets the weekly title to `Triumphant Week 057 [Track of the Month]`
  
- `*delspecial` : Clears the special event name for the weekly tournament.

- `*start [votetime (optional)]` : Starts the tournament. The default for `votetime` is 1435 minutes, or 23 hours, 55 minutes.  
  Also creates a reddit post and Challonge bracket made for the current week's tournament.

- `*continue` : Resumes the tournament if paused.

- `*clear!` : Clears the tournament settings. Can only be used if no tournament is in progress.

- `*endround!` : Overrides the vote timer (to the minute) and abruptly ends the round, moving on to the next round. Can only be used if a tournament is in progress.

- `*cancel!` : Cancels the request to end the round. Can only be used if a tournament is in progress, `*endround!` was used, and the round has not ended yet.

- `*stop!!` : Stops the tournament and clears the tournament's specific settings. Also deletes the reddit post and challonge bracket for the tournament.
