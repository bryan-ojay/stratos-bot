/*
- parses from tracks.json and settings.json

tracks.json will have 2 sets of the same 8 tracks
- first set, just a general list of TrackInfos
- second set, formatted tournament set
*/

const fs = require('fs');
const sc = require('./soundcloud.js');
var info = {}

module.exports = {
  getSetup: getSetup,
  info: info,
  addAdmin: addAdmin,
  delAdmin: delAdmin,
  setTrack: setTrack,
  setEmoji: setEmoji,
  setHeader: setHeader,
  setSpecial: setSpecial,
  fillMatches: fillMatches,
  setWeekNum: setWeekNum,
  save: save,
  reset: reset
}

function getSetup(){
  fs.readFile('matches.json', 'utf8', (err, data) => {
      if (err) {console.log(err)}
      else {info['matches'] = JSON.parse(data)}
  });
  fs.readFile('settings.json', 'utf8', (err, data) => {
     if (err) {console.log(err)}
     else {info['settings'] = JSON.parse(data)}
  });
  fs.readFile('matches_sample.json', 'utf8', (err, data) => {
      if (err) {console.log(err)}
      else {info['match_reset'] = JSON.parse(data)}
  });
}


function addAdmin(role){
  info.settings.admin_roles.push(role)
  save('s')
}

function delAdmin(role){
  new_list = info.settings.admin_roles.filter(admin => admin != role)
  info.settings.admin_roles = new_list
  save('s')
}

function setEmoji(num, emote) {
  if (num < 1 || num > 2) {
    throw "Number should be between 1 and 2."
  }
  var emote_reg = /^<:\S+:\d+>/
  if (!(emote.match(emote_reg))) {
    throw "Invalid emote."
  }
  info.settings.emojis[num - 1] = emote
  save('s')
}

function setHeader(num, link) {
  //error catching, num
  if (num < 1 || num > 8) {
    throw "Number should be between 1 and 8."
  }
  //error catching, link
  var link_reg =
  /^(http|https):\/\/(www.)?\S+?.\S+?\/\S+?.(png|jpg)$/i;
  if (!(link.match(link_reg))) {
    throw "Invalid image link."
  }
  info.settings.header_images[num - 1] = link
  save('s')
}

function setSpecial(desc){
  info.settings.special = desc
  save('s')
}

function setTrack(num, link, tags) {
  try{
    sc.getInfo(link)
    // don't set the track if the link is not valid
    setTimeout(function(){
      if (sc.info.name === null && sc.info.title === null) {
        throw "Invalid soundcloud link."
      }
    }, 1800)
  }
  catch(err){throw err;}
  // error catching, num
  if (num < 1 || num > 8) {
    throw "Number should be between 1 and 8."
  }
  // error catching, tags
  if (tags.length == 0) {throw "No Discord user was given."}
  for (i = 0; i < tags.length; i++){
    if (!((tags[i].startsWith('\\') || tags[i].startsWith('<')) &&
           tags[i].endsWith('>'))) {
      throw "Invalid Discord user(s)."
    }
    else if (tags[i].startsWith('\\')) tags[i] = " " + tags[i].slice(1)
    else if (tags[i].startsWith('<')) tags[i] = " " + tags[i]
  }

  // run function
  setTimeout(function() {
    var title = (sc.info.title.includes(sc.info.name)
              || (sc.info.title.includes(' - ') ||
                  sc.info.title.includes(' // '))) ?
    sc.info.title : `${sc.info.name} - ${sc.info.title}`;
    var name = (sc.info.title.includes(' - ') ||
                sc.info.title.includes(' // ')) ?
    sc.info.title.split(' - ')[0]:sc.info.name;
    info.matches.tracks[num - 1] = {
      "artist": name,
      "title": title,
      "url": link,
      "userID": tags
    }
    fillMatches(`${num}`)
  }, 1850)
}

function setWeekNum(num) {
  try{
    //make sure the number is an actual number
    num = parseInt(num)
    if (num < 1 || num === null) throw "Invalid number."
    else{
      info.settings.week_num = num
      if (num < 10) {num = '00' + num}
      else if (num < 100) {num = '0' + num}
      info.settings.week_title = num
      save('s')
    }
  }
  catch(err) {
    throw "Invalid number."
  }
}

function fillMatches(option = '12345678'){
  if (option.includes('1')){info.matches.duel1[0] = info.matches.tracks[0]}
  if (option.includes('2')){info.matches.duel1[1] = info.matches.tracks[1]}
  if (option.includes('3')){info.matches.duel2[0] = info.matches.tracks[2]}
  if (option.includes('4')){info.matches.duel2[1] = info.matches.tracks[3]}
  if (option.includes('5')){info.matches.duel3[0] = info.matches.tracks[4]}
  if (option.includes('6')){info.matches.duel3[1] = info.matches.tracks[5]}
  if (option.includes('7')){info.matches.duel4[0] = info.matches.tracks[6]}
  if (option.includes('8')){info.matches.duel4[1] = info.matches.tracks[7]}
  save('m')
}

function save(option = "ms"){
  try {
    if (option.includes('m')) {
        fs.writeFile('matches.json', JSON.stringify(info.matches), 'utf8',
        function(){})
    }
    if (option.includes('s')) {
        fs.writeFile('settings.json', JSON.stringify(info.settings), 'utf8',
        function(){})
    }
  }
  catch(err){
    console.log(err);
  }
}

function reset(option = 'rs'){
  //reset matches
  if (option.includes('r')) { //reset match settings
    info.matches.progress.match = 0
    info.matches.progress.status = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]
    info.matches.semi1[0] = info.matches.semi1[1] = info.matches.semi2[0] =
    info.matches.semi2[1] = info.matches.final[0] = info.matches.final[1] =
    {"artist": null, "title": null, "url": null, "userID": null}
  }
  //reset all of matches
  else if (option.includes('m')) {info.matches = info.match_reset}
  //reset settings
  if (option.includes('s')){
    delete info.settings.start
    delete info.settings.end
    delete info.settings.matchup_id
    delete info.settings.embed_id
    delete info.settings.embed
    delete info.settings.reddit_info
    info.settings.special = ""
    info.settings.tournament_started = false
  }
  save()
}

getSetup()
