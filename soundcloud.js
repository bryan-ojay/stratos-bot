const fs = require('fs');
const http = require('follow-redirects').http;
//const sc = require('node-soundcloud'); //currently not needed
var clientID = "CLIENT_ID"
var token = "TOKEN_HERE";
var info = {}

module.exports = {
  info: info,
  getInfo: getInfo
}

/* GET track info */
function getInfo(link) {
  function parseInfo(url) {
    //soundcloud api access
    correct_reg = /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/\S+?/i;
    wrong_regs = [
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/sets$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/sets\/\S+?/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/tracks$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/reposts$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/albums$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/followers$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/following$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/likes$/i,
    /^(http|https):\/\/(www.)?soundcloud.com\/\S+?\/comments$/i
    ]

    wrong_regs.forEach(reg => {
      if ((url.match(reg)) || !(url.match(correct_reg))) {
        throw "Invalid soundcloud link."
      }
    })

    setTimeout(function(){
      apiUrl = "http://api.soundcloud.com/resolve.json?url=" + url +
      "&client_id=" + clientID;

      //http request
      http.get(apiUrl, function(res){
            var body = '';

            //write json data to file
            res.on('data', function(chunk){
                body += chunk;
                fs.writeFileSync('sc_info.json', body, 'utf8');
                console.log("Info retrieved.")
              })

            res.on('end', function(){ //nothing here yet
            /* if name in title:
                  info = title,
                else: info = name + ' - ' + title */
            })
        }).on('error', function(err){
              console.log("Got an error: ", err);
            })
    }, 600)
  }

  function postInfo(url){
    try {
        //get the contents of the json file
        fs.readFile('sc_info.json', 'utf8', (err, data) => {
            scParse = JSON.parse(data)
            if (scParse.errors){
              info['name'] = info['title'] = null
            }
            else{
              info['name'] = scParse.user.username
              info['title'] = scParse.title
            }
        });
    }
    catch(err2) {
      console.log("Error parsing JSON.")
    }
  }

  parseInfo(link)
  setTimeout(function(){ //have to put a delay cuz js likes async
    sc_info = postInfo(link)
  }, 1700)

}

/* Below are functions that do not function
function addToPlaylist(track, playlist) {
  parseInfo(track);
  var track_contents = fs.readFileSync('sc_info.json');
  //get track info, then get playlist info
  setTimeout(function(){
    var trackID = info.id

    parseInfo(playlist);
    setTimeout(function(){
      var set_contents = fs.readFileSync('sc_info.json');
      set_contents.tracks.shift(track_contents)
      // accomodate for private playlists
      uri = info.uri
      if (uri.includes('secret_token')) {
        sc.put('/playlists/' + playlistID + '/' + trackID +
      '?secret_token=' + uri.slice(-7))
      }
      else {sc.put('/playlists/' + playlistID + '/' + trackID)}

    }, 1500)
    //
  }, 1500)
  })
}
// Like, repost, add track to playlist
function supportTrack(url, playlist = null, options){
  //options is string, includes 1, 2 and/or 3
  sc.init({
    id: id,
    accessToken: token
  })

  getInfo(url);
  setTimeout(function(){
    trackID = info.id
    sc.put('/me/favorites/' + trackID,
    function(err, track) {
      if (err) throw err;
    })
    //sc.put('/e1/me/track_reposts/' + trackID) (doesn't work)
  }, 1500)
}
*/
