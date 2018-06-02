const fs = require('fs');
const challonge = require('challonge');
const syst = require('./setup.js');
const client = challonge.createClient({
  apiKey: 'API_KEY_HERE',
})

module.exports = {
  create: create,
  update: update,
  final: final,
  del: del
}

function create() {
  var week_title = syst.info.settings.week_title
  client.tournaments.create({
    'tournament': {
      'name': `Triumphant Week ${week_title} ${syst.info.settings.special}`,
      'url': 'tw_' + week_title,
      'description': 'Week ' + week_title +
          ' of Elevate\'s Triumphant Competition. ' +
          'Join the Elevate Discord: https://discord.io/elevate',
      'sequential_pairings': true,
      'open_signup': false,
      'game_name': 'Music',
      'hide_seeds': true
    },
    callback: (err, data) => {
      if (err){console.log(err);}
      else{console.log('Tournament created.')};
    }
  });

  setTimeout(function(){
    i = 7
    part_add = setInterval(function(){

      player = syst.info.matches.tracks[i].title
      if (player.includes("&")) player.replace(/&/g, "%26")

      client.participants.create({
        'id': 'tw_' + week_title,
        'participant': {
          'name': player,
          'seed': 1
        },
        callback: (err, data) => {
          if (err) {
            console.log ("Outer layer: " + i, err)

            //reenter the participant
            client.participants.create({
              'id': 'tw_' + week_title,
              'participant': {
                'name': syst.info.matches.tracks[i].title + ' ' + `(${i + 1})`,
                'seed': 1
              },
              callback: (err, data) => {
                if (err) {console.log ("Inner layer: " + i, err)}
                else{console.log('Participant added.')}
              }
            })
          }
          else{console.log('Participant added.')}
          i--
        }
      })
      if (i == 0) {
        clearInterval(part_add)
        setTimeout(function(){
          client.tournaments.start({
            id: 'tw_' + week_title,
            callback: (err, data) => {
              if (err){console.log(err);}
              else{console.log('Tournament started.')}
            }
          });
        }, 600)
      }
    }, 600)
  }, 600)
}

function del(week_title){
  client.tournaments.destroy({
    id: 'tw_' + week_title,
    callback: (err, data) => {
      if (err){console.log(err)}
      else{console.log('Tournament deleted.')}
      }
  })
}

function update(week_title, match_num, p1score, p2score) {
  client.matches.index({
    'id': 'tw_' + week_title,
    callback: (err, data) => {
      if (err){console.log(err)};
      matches = data;
      console.log("Data retrieved.")
    }
  })

  setTimeout(function(){
    var player_match = matches[`${match_num}`]
    var match_id = player_match.match.id
    var match_winner = (p1score > p2score) ?
    player_match.match.player1Id : player_match.match.player2Id;
    client.matches.update({
    'id': 'tw_' + week_title,
    'match_id': match_id,
    'match': {
      'scores_csv': `${p1score}-${p2score}`,
      'winner_id': match_winner
    },
    callback: (err, data) => {
      if (err){console.log(err);}
      else{console.log('Match updated.')}
    }
    });
  }, 700)
}

function final(week_title) {
  client.tournaments.finalize({
    'id': 'tw_' + week_title,
    callback: (err, data) => {
      if (err){console.log(err);}
      else{console.log('Tournament finalized.')}
    }
  });
}
