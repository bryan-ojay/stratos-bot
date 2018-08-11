const fs = require('fs');
const challonge = require('challonge');
const syst = require('./setup.js');
const client = challonge.createClient({
  apiKey: 'API_KEY_HERE'
})

module.exports = {
  create: create,
  update: update,
  change: change,
  final: final,
  del: del
}

function create() {
  var week_title = syst.info.settings.week_title
  client.tournaments.create({
    'tournament': {
      'name': `Triumphant Week ${week_title} ${syst.info.settings.special}`,
      'url': 'tw' + week_title,
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
    i = 8
    part_add = setInterval(function(){
      i--;
      // replace '&' with HTML format to fix title cutoff bug
      player = syst.info.matches.tracks[i].title.replace(/&/g, "%26")
      client.participants.create({
        'id': 'tw' + week_title,
        'participant': {
          'name': player,
          'seed': 1
        },
        callback: (err, data) => {
          if (err) {
            // Outer layer is attempt 1 of adding the title
            // Inner layer is attempt 2, adds the competitor number to the
            // title
            console.log ("Outer layer: " + i, err)

            //reenter the participant
            client.participants.create({
              'id': 'tw' + week_title,
              'participant': {
                'name': player + ' ' + `(${i + 1})`,
                'seed': 1
              },
              callback: (err, data) => {
                if (err) {console.log ("Inner layer: " + i, err)}
                else{console.log('Participant added.')}
              }
            })
          }
          else{console.log('Participant added.')}
        }
      })
      if (i == 0) {
        clearInterval(part_add)
        setTimeout(function(){
          client.tournaments.start({
            id: 'tw' + week_title,
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
    id: 'tw' + week_title,
    callback: (err, data) => {
      if (err){console.log(err)}
      else{console.log('Tournament deleted.')}
      }
  })
}

function change(week_title, player_num, player_name) {
  client.participants.index({
    'id': 'tw' + week_title,
    callback: (err, data) => {
      if (err){console.log(err)};
      console.log("Participants retrieved.")
      part_id = data[`${player_num}`].participant.id

      client.participants.update({
        'id': 'tw' + week_title,
        'participant_id': part_id,
        'participant': {
          'name': player_name
        },
        callback: (err, data) => {
          if (err){console.log(err, 'tw' + week_title, player_num, player_name, part_id);}
          else{console.log('Participant updated.')}
        }
      })
    }
  })
}

function update(week_title, match_num, p1score, p2score) {
  client.matches.index({
    'id': 'tw' + week_title,
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
      'id': 'tw' + week_title,
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
  }, 1000)
}

function final(week_title) {
  client.tournaments.finalize({
    'id': 'tw' + week_title,
    callback: (err, data) => {
      if (err){console.log(err);}
      else{console.log('Tournament finalized.')}
    }
  });
}
