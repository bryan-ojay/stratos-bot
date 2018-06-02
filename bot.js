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

/** Discord **/
// ready to connect
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('error', err => {
  console.log(err);
});


// message event
client.on('message', msg => {
  //check if user has privileges to use locked bot commands
  //this keeps giving errors for some reason so it gets its own try/catch
  try{
    isAdmin = msg.member.roles.some(r=>syst.info.settings.admin_roles.includes(r.name))
  }
  catch(err){isAdmin = false}

  try{ //failsave in case an unknown error is thrown
    if (msg.content == '*ping') {
      msg.channel.send('Pong!');
    }

    //checks if user has special privileges
    if (msg.content == '*admin?') {
      setTimeout(function(){
        if (isAdmin) msg.channel.send("Yep!")
        else msg.channel.send("Nope!")
      }, 250)
    }

    //get info of track on SoundCloud
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

    //the bot will copy what you say, but in code text
    else if (msg.content.startsWith('*text ')) {
      msg.channel.send("`" + msg + "`")
    }

    else if (msg.content == ('*admins')) {
      msg.channel.send(`Admin roles: ${syst.info.settings.admin_roles}`)
    }

    //add admin roles
    else if (msg.content.startsWith('*addadmin ') && isAdmin) {
      newRole = msg.guild.roles.find("name", msg.content.slice(10))

      if (newRole && !(syst.info.settings.admin_roles.includes(newRole.name))) {
        syst.addAdmin(newRole.name)
        msg.channel.send("Admin role added.")
      }
      else if (syst.info.settings.admin_roles.includes(newRole.name)) {
        msg.channel.send("This is already an admin role.")
      }
      else {
        msg.channel.send("Role not found.")
      }
    }

    //delete admin roles
    else if (msg.content.startsWith('*deladmin ') && isAdmin) {
      oldRole = msg.content.slice(10)
      if (syst.info.settings.admin_roles.includes(oldRole)) {
        syst.delAdmin(oldRole)
        msg.channel.send("Role deadmined.")
      }
      else {
        msg.channel.send("Role not found.")
      }
    }

    // kill bot
    else if (msg.content == '*ded!!' && isAdmin)  {
      msg.channel.send('Logging off...');
      client.destroy()
      .then(console.log("Logged off Discord."))
      .catch(err => {
        msg.channel.send(`Uhh, I can't log off. Here's why: ${err}`)
        console.log(err);
      })
    }

    //set tracks for the week
    else if (msg.content.startsWith('*settrack ') && isAdmin) {
      // can't set a track if tournament has started
      if (syst.info.settings.tournament_started){
        msg.channel.send("A triumphant tournament is in progress. "
        + "Please try again later.")
      }
      else {
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
          }, 1850)
        })
        .catch(err => {
          progMsg.edit(`Error adding track: ${err}`)
          console.log(err);
        })
        msg.delete(2000)
      }
    }

    //set week number (mostly used for testing)
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

    //set header image for each week
    else if (msg.content.startsWith('*setheader ') && isAdmin){
      msg_split = msg.content.split(' ')
      num = msg_split[1]
      link = msg_split[2]
      msg.channel.send("Setting header...")
      .then(thisMsg => {
          progMsg = thisMsg
          syst.setHeader(num, link)
          progMsg.edit("Header set: \n<" + link + ">")
      })
      .catch(err => {
        progMsg.edit(`Error setting header: ${err}`)
        console.log(err);
      })
      msg.delete(2000)
    }

    //set the emoji people will use to vote
    else if (msg.content.startsWith('*setemoji ') && isAdmin){
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

    //set special event
    else if (msg.content.startsWith('*setspecial ') && isAdmin){
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
            progMsg.delete(2000)
        })
        .catch(err => {
          progMsg.edit(`Error setting special event: ${err}`)
          console.log(err);
        })
        msg.delete(2000)
      }
    }

    //reset special event
    else if (msg.content == ('*delspecial') && isAdmin){
      if (syst.info.settings.tournament_started){
        msg.channel.send("A triumphant tournament is in progress. "
        + "Please try again later.")
      }
      else if (syst.info.settings.special == ''){
        msg.channel.send("There is no special event to remove.")
      }
      else {
        msg.channel.send("Removing special event...")
        .then(thisMsg => {
            progMsg = thisMsg
            syst.setSpecial('')
            progMsg.edit('Special event removed.')
            progMsg.delete(2000)
        })
        .catch(err => {
          progMsg.edit(`Error removing special event: ${err}`)
          console.log(err);
        })
        msg.delete(2000)
      }
    }

    // Start tournament
    else if ((msg.content == '*start' || msg.content.startsWith('*start ')
             || msg.content == '*continue') && isAdmin) {

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

      else if (msg.content == '*continue' && in_progress){
        msg.channel.send("The timer is currently running already.")
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
             if (countdown != 0){
               thisMsg.edit("Triumphant Week " + syst.info.settings.week_title
                            + " starting in: " + countdown)
             }
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

       // continue a paused tournament (most likely if bot crashes)
       else if (msg.content == '*continue') {
         //set flags for matchup and embed message save points
         foundMatchup = foundEmbed = false
         const chan = msg.guild.channels.find('name', 'triumphant');
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
             if (curr_time > end_time) {
               msg.channel.send("This match has run over time. " +
                           "Voters have 1 minute left to vote...")
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
               msg.channel.send("Timer resuming in 1 minute...")
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
           }
           else {
             saveMsg.edit("Could not restart matchup, save point(s) not found.")
           }
          }, 2000)
        }
      }
      // Posts header image
      // Also sets channel topic if on the first match
      function startMatch(matchNum, voteTime = 1435){
        //start tournament and update settings
        syst.info.settings.tournament_started = true;
        syst.info.matches.progress.match = matchNum
        syst.info.matches.progress.voteTime = voteTime
        syst.save()
        console.log('Sending message in #triumphant...');
        const chan = msg.guild.channels.find('name', 'triumphant');
        // change channel topic for new week
        if (matchNum == 1) {
          topic = "👁‍🗨 ʀᴇᴀᴅ-ᴏɴʟʏ " +
                  "\n| Channel for daily Triumphant voting." +
                  "\n| 💿 SUBMIT YOUR TRACKS HERE: " +
                  syst.info.settings.submit_thread +
                  "\n| 🏅 Tournament Bracket: https://challonge.com/tw" +
                  syst.info.settings.week_title
          chan.setTopic(topic);
        }
        // get competitors from settings
        var competitors = syst.info.matches[rounds[matchNum]]
        // upload attachment
        chan.send({
          files:[syst.info.settings.header_images[matchNum]]
        }).then(setTimeout(postMatch, 2000));

        // Posts daily matchup and reactions
        function postMatch(){
          var matchup = ''
          for (i = 0; i < 2; i++){
              matchup += syst.info.settings.emojis[i] + competitors[i].userID +
                         ' // ' + competitors[i].title + '\n' +
                         competitors[i].url + '\n\n'
          }
          chan.send(matchup)
          .then(matchupMsg => { //react to post
            for (i = 0; i < 2; i++){
              matchupMsg.react(syst.info.settings.emojis[i].slice(-19,-1))
              .then()
              .catch(err => {
                msg.channel.send(`Error adding reactions: ${err}`)
                console.log(err)
              })
            }
            postEmbed(matchupMsg)
          })
        }
        // Posts embed with match and weekly triumphant info
        function postEmbed(matchupMsg){
          // set timer (and save points in case bot crashes)
          // update settings
          var time = (new Date().getTime())
          run_time = syst.info.settings.start = (time - (time % 60000)) / 60000
          end_time = syst.info.settings.end = run_time + voteTime
          syst.save('s')
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
                "icon_url": syst.info.settings.embed_icons[matchNum]
              },
              "description": embed_desc,
              "color": syst.info.settings.embed_colours[matchNum],
              "footer": {
                "icon_url": syst.info.settings.footer_thumbnail,
                "text": syst.info.settings.info
              },
              "thumbnail": {"url": syst.info.settings.embed_thumbnail},
              "fields": [
                {
                  "name": "This Week's Competitors",
                  "value": syst.info.settings.reddit_link
                },
                {
                  "name": "Tournament Bracket",
                  "value": "https://challonge.com/tw"
                  + syst.info.settings.week_title,
                },
                {
                  "name": "Submission Thread",
                  "value": syst.info.settings.submit_thread
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
            syst.save()
            runTimer(matchNum, run_time, end_time, matchupMsg, embedMsg, voteTime)
          })
          .catch(err => {
            msg.channel.send(`Error posting timer: ${err}`)
            console.log(err)
          })
        }
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
        const chan = msg.guild.channels.find('name', 'triumphant');
        embed = syst.info.settings.embed
        in_progress = true
        var timeout = setInterval(function(){
          //end round early
          if (end_round) {
            start = end
            end_round = false
          }
          else start += 1

          // when timer reaches 0, collect reaction scores and update embed
          if (start >= end && !(stop_tourney)) {
            // collect scores for each reaction
            chan.fetchMessage(matchupMsg.id).then(thisMsg => {
              thisMsg.reactions.forEach(object => {
                reacts[object._emoji.id] = object.count
              });
            });
            setTimeout(function() {
              //record scores and send to challonge bracket
              var score1 = reacts[syst.info.settings.emojis[0].slice(-19,-1)]
              var score2 = reacts[syst.info.settings.emojis[1].slice(-19,-1)]
              if (score1 == score2) score1 -= 1
              score_desc = `${score1}-${score2}`
              chal.update(syst.info.settings.week_title, matchNum,
                          score1, score2)
              // update embed
              delete embed.embed.color
              embed.embed.fields[3].value = "Round Over"
              embed.embed.fields[4] = {
                "name": "Score",
                "value": score_desc
              }
              timerMsg.edit(embed)
              .then(function(){
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

                    if (winner.userID.length == 1) {
                      winMsg = `${winner.userID} **is Triumphant!**\n ` +
                                `${winner.url}`
                    }
                    else {
                      winMsg = `${winner.userID} **are Triumphant!**\n ` +
                                `${winner.url}`
                    }
                    chan.send(winMsg)
                        .then(winnerMsg => {
                          winnerMsg.react('🏆')
                          winnerMsg.react('🔥')
                          redd.editWinner(winner)

                          setTimeout(function(){
                            chal.final(syst.info.settings.week_title)
                            syst.setWeekNum((syst.info.settings.week_num) + 1)
                            syst.reset()
                          }, 500)
                        })
                        .catch(err => {
                          chan.send(`Error declaring winner: ${err}`);
                          console.log(err);
                        })
                    break;
                }
              })
              .catch(err => {
                chan.send(`Error ending round: ${err}`)
                console.log(err)
              })
            }, 500)
            clearInterval(timeout)
          }
          else if (stop_tourney){
            start = end
            stop_tourney = false
            clearInterval(timeout)
          }
          formatTime(end - start)
          embed.embed.fields[3].value = info.time //update time
          if (start < end) { //keep updating time until time reaches 0
            timerMsg.edit(embed)
            .then()
            .catch(err => {
              msg.channel.send(`Error updating timer: ${err}`)
              console.log(err)
            })
          }
        }, 60000);
      }
    }

    else if (msg.content == ('*clear!') && isAdmin) {
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

    else if (msg.content == ('*endround!') && isAdmin){
      if (syst.info.settings.tournament_started) {
        msg.channel.send("Round ending in less than a minute...")
        .then(delMsg => delMsg.delete(60000))
        end_round = true
        msg.delete(60000)
      }
      else {
        msg.channel.send("There's no tournament currently in progress.")
      }
    }

    else if (msg.content == ('*stop!!') && isAdmin){
      if (syst.info.settings.tournament_started) {
        const chan = msg.guild.channels.find('name', 'triumphant');
        //clear & reset settings
        chal.del(syst.info.settings.week_title)
        redd.delPost()
        syst.reset()
        //confirmation and stop runTimer
        stop_tourney = true
        chan.send("Tournament stopped.")
        msg.delete(60000)
      }
      else {
        msg.channel.send("There's no tournament currently in progress.")
      }
    }
  }
  // all unkown errors are forwarded here
  catch(err){
    const error_log = msg.guild.channels.find('name', 'triumphant-format');
    if (error_log){
      error_log.send("An error occured, please make sure everything is okay.")
    }
    else{
      msg.channel.send("An error occured, please make sure everything is okay.")
    }
    console.log(err)
  }
});
client.login(disc_token);
