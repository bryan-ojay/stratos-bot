const Discord = require('discord.js');
const client = new Discord.Client();
const syst = require('./setup.js');
const sc = require('./soundcloud.js');
const chal = require('./challonge.js');
const redd = require('./reddit.js')
var disc_token = "API_TOKEN_HERE"
var rounds = ["duel1", "duel2", "duel3", "duel4", "semi1", "semi2", "final"]
var info = {}
var end_round = false
var stop_tourney = false
var in_progress = false
var sd_vote = {}

/** Discord **/
// ready to connect
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.on('error', err => {
  console.log(err);
})


// message event
client.on('message', msg => {
  //check if user has privileges to use locked bot commands
  //this keeps giving errors for some reason so it gets its own try/catch
  try {
    isAdmin = msg.member.roles.some(r=>syst.info.config.admin_roles.includes(r.name))
  }
  catch(err){isAdmin = false}

  try { //failsave in case an unknown error is thrown

    //Ping commands
    if (msg.content == '*ping') {
      msg.channel.send('Pong!');
    }

    else if (msg.content == '*pong') {
      msg.channel.send('Ping.')
    }

    //Logout Bot command
    else if (msg.content == '*ded!!' && isAdmin)  {
      msg.channel.send('Logging off...');
      client.destroy()
      .then(console.log("Logged off Discord."))
      .catch(err => {
        msg.channel.send(`Uhh, I can't log off. Here's why: ${err}`)
        console.log(err);
      })
    }

    //"Check if admin" commmand
    if (msg.content == '*admin?') {
      setTimeout(function(){
        if (isAdmin) msg.channel.send("Yep!")
        else msg.channel.send("Nope!")
      }, 150)
    }

    //Get SoundCloud info command
    else if (msg.content.startsWith('*info ')) {
      var sc_link = msg.content.split('*info ')[1]
      msg.channel.send('Loading info...')
      .then(thisMsg => { //send the artist name and track title
        infoMsg = thisMsg
        sc.getInfo(sc_link)
        setTimeout(function() {
          infoMsg.edit(`**Name**: ${sc.info.name}\n**Title**: ${sc.info.title}`)
          .then()
        }, 1850)
      })
      .catch(err => {
        infoMsg.edit(`Error getting info: ${err}`)
        console.log(err);
      })
    }

    //"Copy text" command
    else if (msg.content.startsWith('*text ')) {
      msg.channel.send("`" + msg + "`")
    }

    //Get Admin Roles command
    else if (msg.content == '*admins') {
      msg.channel.send(`Admin roles: ${syst.info.config.admin_roles}`)
    }

    //Get weekly competitors command
    else if (msg.content == '*competitors') {
      comp_list = ''
      for (i = 0; i < 8; i++) {
        comp_list += `${i+1}. ${syst.info.matches.tracks[i].userID} // `
                   + `[${syst.info.matches.tracks[i].title}]`
                   + `(${syst.info.matches.tracks[i].url})\n\n`
      }
      comp_embed = {
        "embed": {
          "author": {
            "name": "Competitors",
            "url": "https://challonge.com/tw"
            + syst.info.settings.week_title,
            "icon_url": syst.info.config.embed_icons[0]
          },
          "description": comp_list,
          "color": syst.info.config.embed_colours[0],
          "footer": {
            "icon_url": syst.info.config.footer_thumbnail,
            "text": syst.info.config.info
          },
        }
      }
      msg.channel.send(comp_embed)
    }

    //Get Submission Thread command
    else if (msg.content.split(' ')[0] == '*submit') {
      msg.channel.send("Want to be featured in Triumphant? "
      + "Submit your tracks for a better chance to be picked!:"
      + `\n${syst.info.config.submit_thread}`)
    }

    //Set Submission Thread command
    else if (msg.content.startsWith('*setsubmit ') && isAdmin) {
      msg_split = msg.content.split(' ')
      link = msg_split[1]
      msg.channel.send("Setting submission thread...")
      .then(thisMsg => {
          progMsg = thisMsg
          syst.setSubmit(link)
          progMsg.edit(`Submission thread set to <${link}>`)
      })
      .catch(err => {
        progMsg.edit(`Error setting submission thread: ${err}`)
        console.log(err);
      })
      msg.delete(2000)
    }

    //Add Admin Roles command
    else if (msg.content.startsWith('*addadmin ') && isAdmin) {
      newRole = msg.guild.roles.find("name", msg.content.slice(10))

      if (newRole && !(syst.info.config.admin_roles.includes(newRole.name))) {
        syst.addAdmin(newRole.name)
        msg.channel.send("Admin role added.")
      }
      else if (syst.info.config.admin_roles.includes(newRole.name)) {
        msg.channel.send("This is already an admin role.")
      }
      else {
        msg.channel.send("Role not found.")
      }
    }

    //Delete Admin Roles command
    else if (msg.content.startsWith('*deladmin ') && isAdmin) {
      oldRole = msg.content.slice(10)
      if (syst.info.config.admin_roles.includes(oldRole)) {
        syst.delAdmin(oldRole)
        msg.channel.send("Role deadmined.")
      }
      else {
        msg.channel.send("Role not found.")
      }
    }

    //Set Track command
    else if (msg.content.startsWith('*settrack ') && isAdmin) {
      msg_split = msg.content.split(' ')
      num = msg_split[1]
      link = msg_split[2]
      tags = msg_split.slice(3)
      msg.channel.send("Adding track...")
      .then(thisMsg => {
        progMsg = thisMsg
        syst.setTrack(num, link, tags)
        setTimeout(function(){
          progMsg.edit(`Added "${sc.info.title}" as track ${num}.` +
                       `\n<` + link + '>')
          // checks if tournament is active to update bracket and reddit post
          if (syst.info.settings.tournament_started) {
            redd.editPost()
            chal.change(syst.info.settings.week_title, num - 1, syst.info.matches.tracks[num - 1].title)
          }
        }, 1850)
      })
      .catch(err => {
        progMsg.edit(`Error setting track: ${err}`)
        console.log(err);
      })
      msg.delete(2000)
    }

    //Set Week Number command
    else if (msg.content.startsWith('*setweek ') && isAdmin){
      msg_split = msg.content.split(' ')
      num = msg_split[1]
      msg.channel.send("Setting week number...")
      .then(thisMsg => {
          progMsg = thisMsg
          syst.setWeekNum(num)
          progMsg.edit(`Set week number to ${num}.`)
      })
      .catch(err => {
        progMsg.edit(`Error setting week number: ${err}`)
        console.log(err);
      })
      msg.delete(2000)
    }

    //Set Header Image command
    else if (msg.content.startsWith('*setheader ') && isAdmin){
      msg_split = msg.content.split(' ')
      num = msg_split[1]
      link = msg_split[2]
      msg.channel.send("Setting header...")
      .then(thisMsg => {
          progMsg = thisMsg
          syst.setHeader(num, link)
          progMsg.edit(`Header ${num} set: \n<${link}>`)
      })
      .catch(err => {
        progMsg.edit(`Error setting header: ${err}`)
        console.log(err);
      })
      msg.delete(2000)
    }

    //Set Voting Emoji command
    else if (msg.content.startsWith('*setemoji ') && isAdmin){
      // can't set a new emoji if a tournament has started
      if (syst.info.settings.tournament_started){
        msg.channel.send("A triumphant tournament is in progress. "
        + "Please try again later.")
      }
      else{
        msg_split = msg.content.split(' ')
        num = msg_split[1]
        emote = msg_split[2]
        msg.channel.send("Setting emote...")
        .then(thisMsg => {
            progMsg = thisMsg
            syst.setEmoji(num, emote)
            progMsg.edit(`Emote ${num} set to ${emote}.`)
        })
        .catch(err => {
          progMsg.edit(`Error setting emote: ${err}`)
          console.log(err);
        })
        msg.delete(2000)
      }
    }

    //Set Special Event command
    else if (msg.content.startsWith('*setspecial ') && isAdmin){
      // can't set a new special event if a tournament has started
      if (syst.info.settings.tournament_started){
        msg.channel.send("A triumphant tournament is in progress. "
        + "Please try again later.")
      }
      else{
        msg_split = msg.content.split('*setspecial ')
        desc = msg_split[1]
        msg.channel.send("Setting special event...")
        .then(thisMsg => {
            progMsg = thisMsg
            syst.setSpecial('[' + desc + ']')
            progMsg.edit(`Special event set: ${desc}`)
        })
        .catch(err => {
          progMsg.edit(`Error setting special event: ${err}`)
          console.log(err);
        })
        msg.delete(2000)
      }
    }

    //Delete Special Event command
    else if (msg.content == '*delspecial' && isAdmin){
      // can't remove the special event if the tournament has started
      if (syst.info.settings.tournament_started){
        msg.channel.send("A triumphant tournament is in progress. "
        + "Please try again later.")
      }
      // can't remove an already removed special event
      else if (syst.info.settings.special == ''){
        msg.channel.send("There is no special event to remove.")
      }
      else {
        msg.channel.send("Removing special event...")
        .then(thisMsg => {
            progMsg = thisMsg
            syst.setSpecial('')
            progMsg.edit('Special event removed.')
        })
        .catch(err => {
          progMsg.edit(`Error removing special event: ${err}`)
          console.log(err);
        })
        msg.delete(2000)
      }
    }

    //Start Tournament command
    else if ((msg.content.split(' ')[0] == '*start'
            || msg.content == '*continue') && isAdmin) {
      const chan = msg.guild.channels.find('name', 'triumphant');

      // can't start a tournament when another tournament is in progress
      if (msg.content.startsWith('*start') &&
         syst.info.settings.tournament_started) {
       msg.channel.send("A Triumphant tournament is in progress. "
       + "Please try again later.")
      }
      // can't continue a tournament that isn't in progress
      else if (msg.content == '*continue' &&
              !(syst.info.settings.tournament_started)){
       msg.channel.send("There's no tournament currently in progress.")
      }

      // can't continue a tournament that's already running
      else if (msg.content == '*continue' && in_progress){
        msg.channel.send("The timer is already running.")
      }

      else {
       // start a new tournament
       if (msg.content.startsWith('*start')){
         // Create Reddit post and Challonge tournament
         redd.textPost()
         chal.create()
         //Start countdown
         countdown = 10
         msg.channel.send("Triumphant Week " + syst.info.settings.week_title
                          + " starting in: " + countdown)
         .then(thisMsg => {
           starting = setInterval(function(){
             countdown -= 1
             // Countdown until it hits 0
             if (countdown != 0){
               thisMsg.edit("Triumphant Week " + syst.info.settings.week_title
                            + " starting in: " + countdown)
             }
             // start the tournament once countdown reaches 0
             else if (countdown == 0){
               clearInterval(starting)
               thisMsg.edit(`Tournament starting...`)
               .then(thisMsg.delete(3000))

               //check if custom timer is given
               has_timer = parseInt(msg.content.split(' ')[1])
               if (has_timer && has_timer > 0) {
                 startMatch(0, has_timer)
               }
               else{startMatch(0)}
               msg.delete(1000)
             }
           }, 1000)
         })
         .catch(err => {
           msg.channel.send(`Error starting Triumphant: ${err}`);
           console.log(err);
         })
       }

       // continue a paused tournament
       else if (msg.content == '*continue') {
         //set flags for finding matchup and embed message save points
         foundMatchup = foundEmbed = false
         msg.channel.send("Finding save point...")
         .then(thisMsg => {
           // get current time and update timer, given the embed msg is found
           saveMsg = thisMsg
           var time = (new Date().getTime())
           curr_time = (time - (time % 60000)) / 60000
           end_time = syst.info.settings.end
           matchNum = syst.info.matches.progress.match
           voteTime = syst.info.matches.progress.voteTime
           thisMsg.delete(60000)
         })
         setTimeout(function(){
           // find matchup message
           try {
             chan.fetchMessage(syst.info.settings.matchup_id)
             .then(thisMsg => {
               matchupMsg = thisMsg
               msg.channel.send("Matchup save point found.")
               .then(delMsg => {delMsg.delete(60000)})
               console.log("Matchup message found.")
               foundMatchup = true
             })
           }
           catch(err){
             saveMsg.edit("Save point not found.")
             console.log(err);
           }

           try {
             // find embed message
             chan.fetchMessage(syst.info.settings.embed_id)
             .then(thisMsg => {
               embedMsg = thisMsg
               msg.channel.send("Embed save point found.")
               .then(delMsg => {delMsg.delete(60000)})
               console.log("Embed message found.")
               foundEmbed = true
             })
           }
           catch(err){
             saveMsg.edit("Save point not found.")
             console.log(err);
           }
         }, 1000)

         setTimeout(function(){
           // if both matchups are found, restart the tournament matchup
           if (foundMatchup && foundEmbed){
             // end round if match is restarted after original end voting time
             confirmMsg = (curr_time >= end_time) ?
             ("This match has run over time. " +
             "Voters have 1 minute left to vote..."):
             ("Timer resuming in 1 minute...")
             msg.channel.send(confirmMsg)
             .then(delMsg => {
               delMsg.delete(60000)
               runTimer(matchNum, curr_time, end_time,
                        matchupMsg, embedMsg, voteTime)
             })
             .catch(err => {
               saveMsg.edit(`Error restarting matchup: ${err}`)
               console.log(err);
             })
           }
           else {
             saveMsg.edit("Could not restart matchup, save point(s) not found.")
           }
          }, 2000)
        }
      }
    }

    //Reset Tournament Settings command
    else if (msg.content == '*clear!' && isAdmin) {
      if (!(syst.info.settings.tournament_started)) {
        msg.channel.send("Clearing tournament settings...")
        .then(progMsg => {
          syst.reset('ms')
          progMsg.edit("Tournament settings cleared.")
        })
      }
      else{
        msg.channel.send("A triumphant tournament is currently in progress." +
                         " Please stop the tournament or wait for it to end.")
      }
    }

    //End Tournament Round command
    else if (msg.content == '*endround!' && isAdmin) {
      if (syst.info.settings.tournament_started) {
        msg.channel.send("Round ending in less than a minute...")
        .then(delMsg => delMsg.delete(60000))
        end_round = true
        msg.delete(2000)
      }
      else {
        msg.channel.send("There's no tournament currently in progress.")
      }
    }

    //Cancel Tournament Round End command
    else if (msg.content == '*cancel!' && isAdmin) {
      if (syst.info.settings.tournament_started && end_round){
        msg.channel.send("Cancelled round end. Match continuing.")
        .then(delMsg => delMsg.delete(60000))
        end_round = false
        msg.delete(2000)
      }
      else if (syst.info.settings.tournament_started) {
        msg.channel.send("The round was not called to end early.")
      }
      else {
        msg.channel.send("There's no tournament currently in progress.")
      }
    }

    //Stop Tournament command
    else if (msg.content == '*stop!!' && isAdmin) {
      if (syst.info.settings.tournament_started) {
        //clear & reset settings
        chal.del(syst.info.settings.week_title)
        redd.delPost()
        //confirmation and stop runTimer
        stop_tourney = true
        msg.channel.send("Tournament stopping in less than a minute...")
        .then(delMsg => delMsg.delete(60000))
        msg.delete(2000)
        setTimeout(function(){
          stop_tourney = false
          syst.reset()
        }, 60000)
      }
      else {
        msg.channel.send("There's no tournament currently in progress.")
      }
    }

    //Test Error command
    else if (msg.content == '*error!!' && isAdmin) {throw "Unknown error."}
  }
  // all unknown errors are forwarded here
  catch(err) {
    msg.member.send("An unknown error occured, please make sure everything is okay.")
    console.log(err)
  }

  //Tournament Functions

  // Posts header image
  // Also sets channel topic if on the first match
  function startMatch(matchNum, voteTime = 1435){
    const chan = msg.guild.channels.find('name', 'triumphant');
    //start tournament and update settings
    syst.info.settings.tournament_started = true;
    syst.info.matches.progress.match = matchNum
    syst.info.matches.progress.voteTime = voteTime
    syst.save('sm')
    console.log('Sending message in #triumphant...');
    // change channel topic for new week
    if (matchNum == 0) {
      topic = "👁‍🗨 ʀᴇᴀᴅ-ᴏɴʟʏ " +
              "\n| Channel for daily Triumphant voting." +
              "\n| 💿 SUBMIT YOUR TRACKS HERE: " +
              syst.info.config.submit_thread +
              "\n| 🏅 Tournament Bracket: https://challonge.com/tw" +
              syst.info.settings.week_title
      chan.setTopic(topic)
      .then(console.log("Channel topic updated."))
      .catch(err => {
        msg.channel.send(`Error updating channel topic: ${err}`)
        console.log(err)
      })
    }
    // get competitors from settings
    var competitors = syst.info.matches[rounds[matchNum]]
    // upload attachment
    chan.send({
      files:[syst.info.config.header_images[matchNum]]
    }).then(setTimeout(postMatch, 2000));

    // Posts daily matchup and reactions
    function postMatch(){
      const chan = msg.guild.channels.find('name', 'triumphant');
      var matchup = ''
      for (i = 0; i < 2; i++){
          matchup += syst.info.config.emojis[i] + competitors[i].userID +
                     ' // ' + competitors[i].title + '\n' +
                     competitors[i].url + '\n\n'
      }
      chan.send(matchup)
      .then(matchupMsg => { //react to post
        setTimeout(function(){
          for (i = 0; i < 2; i++){
            matchupMsg.react(syst.info.config.emojis[i].slice(-19,-1))
            .then()
            .catch(err => {
              msg.channel.send(`Error adding reactions: ${err}`)
              console.log(err)
            })
          }
        }, 1000)
        postEmbed(matchNum, matchupMsg, voteTime)
      })
    }
  }
  // Posts embed with match and weekly triumphant info
  function postEmbed(matchNum, matchupMsg, voteTime){
    var competitors = syst.info.matches[rounds[matchNum]]
    // set timer (and save points in case bot crashes)
    // update settings
    const chan = msg.guild.channels.find('name', 'triumphant');
    var time = (new Date().getTime())
    run_time = syst.info.settings.start = (time - (time % 60000)) / 60000
    end_time = syst.info.settings.end = run_time + voteTime
    formatTime(end_time - run_time)

    //embed template
    embed_desc = `[${competitors[0].title}](${competitors[0].url})`
    + `\nVS\n`+ `[${competitors[1].title}](${competitors[1].url})`
    embed = {
      "embed": {
        "author": {
          "name": "Triumphant Week " + syst.info.settings.week_title
          + ' ' + syst.info.settings.special,
          "url": "https://challonge.com/tw"
          + syst.info.settings.week_title,
          "icon_url": syst.info.config.embed_icons[matchNum]
        },
        "description": embed_desc,
        "color": syst.info.config.embed_colours[matchNum],
        "footer": {
          "icon_url": syst.info.config.footer_thumbnail,
          "text": syst.info.settings.info
        },
        "thumbnail": {"url": syst.info.config.embed_thumbnail},
        "fields": [
          {
            "name": "This Week's Competitors",
            "value": syst.info.config.reddit_link
          },
          {
            "name": "Tournament Bracket",
            "value": "https://challonge.com/tw"
            + syst.info.settings.week_title,
          },
          {
            "name": "Submission Thread",
            "value": syst.info.config.submit_thread
          },
          {
            "name": "Time Left To Vote",
            "value": info.time
          }
        ]
      }
    }
    chan.send(embed)
    .then(embedMsg => {
      syst.info.settings.matchup_id = matchupMsg.id
      syst.info.settings.embed_id = embedMsg.id
      syst.info.settings.embed = embed
      syst.info.matches.progress.status[matchNum] = [1,0]
      syst.save('ms')
      runTimer(matchNum, run_time, end_time, matchupMsg, embedMsg, voteTime)
    })
    .catch(err => {
      msg.channel.send(`Error posting timer: ${err}`)
      console.log(err)
    })
  }

  //format time to hours and minutes
  function formatTime(i){
    hr = (i - (i % 60)) / 60 // integer division
    min = i % 60
    if (hr > 1 && min > 1) {info.time = `${hr} hours, ${min} minutes`}
    else if (hr > 1 && min == 1) {info.time = `${hr} hours, ${min} minute`}
    else if (hr == 1 && min > 1) {info.time = `${hr} hour, ${min} minutes`}
    else if (hr == 1 && min == 1) {info.time = `${hr} hour, ${min} minute`}
    else if (hr > 1) {info.time = `${hr} hours`}
    else if (hr == 1) {info.time = `${hr} hour`}
    else if (min > 1) {info.time = `${min} minutes`}
    else if (min == 1) {info.time = `${min} minute`}
  }

  // start the timer on the embed
  function runTimer(matchNum, start, end, matchupMsg, timerMsg, voteTime){
    reacts = {}
    embed = syst.info.settings.embed
    in_progress = true
    competitors = syst.info.matches[rounds[matchNum]]
    console.log("Timer running.")
    const chan = msg.guild.channels.find('name', 'triumphant');
    // timer runs on a 1 minute interval
    var timeout = setInterval(function(){

      //check if the round was called to end early
      if (end_round) {
        start = end
        end_round = false
      }
      else start += 1

      // check if the tournament was called to stop early
      if (stop_tourney) {
        clearInterval(timeout)
        embed.embed.fields[3].value = "Tournament Stopped"
        delete embed.embed.color
        timerMsg.edit(embed)
        .then()
        .catch(err => {
          msg.channel.send(`Error stopping timer: ${err}`)
          console.log(err)
        })
      }

      //keep updating time until time reaches 0
      else if (start < end) {
        //update time
        formatTime(end - start)
        embed.embed.fields[3].value = info.time
        timerMsg.edit(embed)
        .then()
        .catch(err => {
          msg.channel.send(`Error updating timer: ${err}`)
          console.log(err)
        })
      }

      // when timer reaches 0, collect reaction scores and update embed
      else if (start >= end && !(stop_tourney)) {
        // collect scores for each reaction
        chan.fetchMessage(matchupMsg.id).then(thisMsg => {
          thisMsg.reactions.forEach(object => {
            reacts[object._emoji.id] = object.count
          })
        })
        //record scores and check if the score is tied
        setTimeout(function() {
          var score1 = reacts[syst.info.config.emojis[0].slice(-19,-1)]
          var score2 = reacts[syst.info.config.emojis[1].slice(-19,-1)]
          if (!score1) score1 = 0
          if (!score2) score2 = 0
          score_desc = `${score1}-${score2}`

          //update embed to signify the match is over
          delete embed.embed.color
          embed.embed.fields[4] = {
            "name": "Score",
            "value": score_desc
          }

          //match was not a tie, continue as usual
          if (score1 != score2) {
            embed.embed.fields[3].value = "Voting Over"
            timerMsg.edit(embed)
            .then(endRound(matchNum, score1, score2, voteTime))
            .catch(err => {
              chan.send(`Error ending round: ${err}`)
              console.log(err)
            })
          }

          // match was a tie, start a 3-min sudden death
          else if (score1 == score2) {//score2 += 1
            embed.embed.fields[3].value = "0 minutes"
            timerMsg.edit(embed)

            /* Sudden Death Embed */
            var time = (new Date().getTime())
            sd_time = 3
            formatTime(sd_time)

            //embed template
            embed_desc = `[${competitors[0].title}](${competitors[0].url})`
            + `\nVS\n`+ `[${competitors[1].title}](${competitors[1].url})`
            sd_embed = {
              "embed": {
                "author": {
                  "name": "Sudden Death Tiebreaker",
                  "url": "https://challonge.com/tw"
                  + syst.info.settings.week_title,
                  "icon_url": syst.info.config.embed_icons[matchNum]
                },
                "description": embed_desc,
                "footer": {
                  "icon_url": syst.info.config.footer_thumbnail,
                  "text": syst.info.settings.info
                },
                "thumbnail": {"url": syst.info.config.embed_thumbnail},
                "fields": [
                  {
                    "name":"Time Left To Vote",
                    "value":"Loading..."
                  },
                  {
                    "name":"Winner",
                    "value":"---"
                  },
                  {
                    "name":"First To Vote",
                    "value":"---"
                  }
                ]
              }
            }
            chan.send("**Sudden Death Tiebreaker**: "
            + `\n${syst.info.config.emojis[0]}${competitors[0].userID} VS`
            + `${competitors[1].userID} ${syst.info.config.emojis[1]}`
            + "\nFirst to vote in the next 3 minutes decides the winner!"
            + "\nVoting begins in 5 seconds...", sd_embed)
            .then(thisMsg => {
              sdMsg = thisMsg
              syst.info.settings.sudden_id = sdMsg.id
              //react to sudden death message and save to settings
              setTimeout(function(){
                for (i = 0; i < 2; i++) {
                  sdMsg.react(syst.info.config.emojis[i].slice(-19,-1))
                  .then()
                  .catch(err => {
                    msg.channel.send(`Error adding reactions: ${err}`)
                    console.log(err)
                  })
                }
              }, 2000)
            })
            .catch(err => {
              msg.channel.send(`Error posting timer: ${err}`)
              console.log(err)
            })

            //run timer and vote on embed
            setTimeout(function(){
              syst.info.settings.sudden_death = true
              sd_embed.embed.color = 12255232
              sd_embed.embed.fields[0].value = info.time
              sdMsg.edit("**Sudden Death Tiebreaker**: "
              + `\n${syst.info.config.emojis[0]}${competitors[0].userID} VS`
              + `${competitors[1].userID} ${syst.info.config.emojis[1]}`
              + "\nFirst to vote in the next 3 minutes decides the winner!"
              + "\nVoting has started!", sd_embed)
              .then()
              .catch(err => {
                msg.channel.send(`Error updating timer: ${err}`)
                console.log(err)
              })
              syst.save()
              //2 intervals needed

              //Interval 1 checks if a vote was placed (40 ms)
              reactCheck = setInterval(function(){
                if (sd_vote.pick && syst.info.settings.sudden_death) {
                  syst.info.settings.sudden_death = false
                  sd_embed.embed.fields[0].value = "Voting Over"
                  sd_embed.embed.fields[1].value =
                  `${competitors[sd_vote.pick].userID} //  ${competitors[sd_vote.pick].title}`
                  if (sd_vote.pick == '0') {
                    sd_embed.embed.color = 16760832
                    score1 += 1
                  }
                  else if (sd_vote.pick == '1') {
                    sd_embed.embed.color = 39423
                    score2 += 1
                  }
                  sd_embed.embed.fields[2].value = `<@${sd_vote.user_id}>`
                  sdMsg.edit("**Sudden Death Tiebreaker**: "
                  + `\n${syst.info.config.emojis[0]}${competitors[0].userID} VS`
                  + `${competitors[1].userID} ${syst.info.config.emojis[1]}`
                  + "\nFirst to vote in the next 3 minutes decides the winner!"
                  + "\nVoting has ended!", sd_embed)
                  .then(function(){
                    delete sd_vote.pick
                    delete sd_vote.user_id
                    delete syst.info.settings.sudden_id
                    endRound(matchNum, score1, score2, voteTime)
                    clearInterval(updateTimer)
                    clearInterval(reactCheck)
                  })
                  .catch(err => {
                    msg.channel.send(`Error finishing match: ${err}`)
                    console.log(err)
                  })
                }
              }, 40)

              //Interval 2 updates the timer (60 sec)
              updateTimer = setInterval(function(){
                sd_time -= 1
                // update the timer
                if (sd_time > 0) {
                  formatTime(sd_time)
                  sd_embed.embed.fields[0].value = info.time
                  sdMsg.edit("**Sudden Death Tiebreaker**: "
                  + `\n${syst.info.config.emojis[0]}${competitors[0].userID} VS`
                  + `${competitors[1].userID} ${syst.info.config.emojis[1]}`
                  + "\nFirst to vote in the next 3 minutes decides the winner!"
                  + "\nVoting has started!", sd_embed)
                  .then()
                  .catch(err => {
                    msg.channel.send(`Error updating timer: ${err}`)
                    console.log(err)
                  })
                }
                // timer runs to 0, end the match with an auto vote
                else if (sd_time <= 0) {
                  syst.info.settings.sudden_death = false
                  sd_embed.embed.fields[0].value = "Voting Over"
                  auto = 2 * Math.random()
                  auto_vote = auto - (auto % 1)
                  sd_embed.embed.fields[1].value =
                  `${competitors[auto_vote].userID} // ${competitors[auto_vote].title}`
                  switch(auto_vote) {
                    case 0:
                      sd_embed.embed.color = 16760832
                      score1 += 1
                      break;
                    case 1:
                      sd_embed.embed.color = 39423
                      score2 += 1
                      break;
                  }
                  sd_embed.embed.fields[2].value = "Auto-vote by Stratos"
                  sdMsg.edit("**Sudden Death Tiebreaker**: "
                  + `\n${syst.info.config.emojis[0]}${competitors[0].userID} VS`
                  + `${competitors[1].userID} ${syst.info.config.emojis[1]}`
                  + "\nFirst to vote in the next 3 minutes decides the winner!"
                  + "\nVoting has ended!", sd_embed)
                  .then(function(){
                    delete syst.info.settings.sudden_id
                    endRound(matchNum, score1, score2, voteTime)
                    clearInterval(reactCheck)
                    clearInterval(updateTimer)
                  })
                  .catch(err => {
                    msg.channel.send(`Error finishing match: ${err}`)
                    console.log(err)
                  })
                }
              }, 60000)
            }, 5000)
          }
        }, 500)
        clearInterval(timeout)
      }
    }, 60000);
  }

  function endRound(matchNum, score1, score2, voteTime) {
    const chan = msg.guild.channels.find('name', 'triumphant');
    chal.update(syst.info.settings.week_title, matchNum, score1, score2)
    //update the match progress
    //declare winner, move to semis/finals
    //if this matchup is the finals, declare the winner Triumphant
    syst.info.matches.progress.status[matchNum] = [1,1]
    syst.save('m')
    switch(matchNum){
      case 0:
        syst.info.matches.semi1[0] = (score1 > score2) ?
        syst.info.matches.duel1[0] : syst.info.matches.duel1[1];
        setTimeout(function(){startMatch(1, voteTime)}, 10000)
        break;
      case 1:
        syst.info.matches.semi1[1] = (score1 > score2) ?
        syst.info.matches.duel2[0] : syst.info.matches.duel2[1];
        setTimeout(function(){startMatch(2, voteTime)}, 10000)
        break;
      case 2:
        syst.info.matches.semi2[0] = (score1 > score2) ?
        syst.info.matches.duel3[0] : syst.info.matches.duel3[1];
        setTimeout(function(){startMatch(3, voteTime)}, 10000)
        break;
      case 3:
        syst.info.matches.semi2[1] = (score1 > score2) ?
        syst.info.matches.duel4[0] : syst.info.matches.duel4[1];
        setTimeout(function(){startMatch(4, voteTime)}, 10000)
        break;
      case 4:
        syst.info.matches.final[0] = (score1 > score2) ?
        syst.info.matches.semi1[0] : syst.info.matches.semi1[1];
        setTimeout(function(){startMatch(5, voteTime)}, 10000)
        break;
      case 5:
        syst.info.matches.final[1] = (score1 > score2) ?
        syst.info.matches.semi2[0] : syst.info.matches.semi2[1];
        setTimeout(function(){startMatch(6, voteTime)}, 10000)
        break;
      case 6:
        winner = syst.info.matches.winner = (score1 > score2) ?
        syst.info.matches.final[0] : syst.info.matches.final[1];
        winMsg = (winner.userID.length == 1) ?
        `${winner.userID} **is Triumphant!**\n${winner.url}`:
        `${winner.userID} **are Triumphant!**\n${winner.url}`;
        chan.send(winMsg)
            .then(winnerMsg => {
              winnerMsg.react('🏆')
              winnerMsg.react('🔥')
              redd.editWinner(winner)
              setTimeout(function(){
                chal.final(syst.info.settings.week_title)
                syst.setWeekNum((syst.info.settings.week_num) + 1)
                syst.reset()
              }, 1500)
            })
            .catch(err => {
              chan.send(`Error declaring winner: ${err}`);
              console.log(err);
            })
        break;
    }
  }
});

// Note: messageReactionAdd only works with cached messages
client.on('messageReactionAdd', (react, user) => {
  // check if someone reacted on a sudden death counter
  if (syst.info.settings.sudden_death &&
     (react.message.id == syst.info.settings.sudden_id) &&
     (user.id != client.user.id)) {
      sd_vote['user_id'] = user.id
      //check if the reaction was one of the voting emotes
      emotes = [syst.info.config.emojis[0].slice(-19,-1),
                syst.info.config.emojis[1].slice(-19,-1)]
      if (react.emoji.id == emotes[0]) {sd_vote['pick'] = '0'}
      else if (react.emoji.id == emotes[1]) {sd_vote['pick'] = '1'}
  }
})

client.login(disc_token);
