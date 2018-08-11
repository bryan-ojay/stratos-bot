const reddit = require('snoowrap');
const sc = require('./soundcloud.js');
const syst = require('./setup.js');
const client = new reddit({
  userAgent: "Stratos v0.3.2, a bot by StreaK",
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  username: 'USERNAME',
  password: 'PASSWORD'
})
post = {};

module.exports = {
  textPost: textPost,
  editWinner: editWinner,
  delPost: delPost,
  editPost: editPost
}

function textPost(){
  createBody()
  link = client.getSubreddit('elevate').submitSelfpost({
    title: 'Triumphant Week ' + syst.info.settings.week_title,
    text: post.body
  }).assignFlair({text: 'Triumphant', css_class: 'triumphant'})
  .then(sub => {
    post.name = (sub.name.slice(3))
    console.log(post.name)
    syst.info.config.reddit_link = "https://redd.it/" + sub.name.slice(3)
    syst.info.settings.reddit_info = post.body
    syst.save('sc')
  })
  .catch(err => {
    if (err) {
      console.log("Reddit post unavailable");
      syst.info.config.reddit_link = "Temporarily Unavailable"
      syst.save('c')
    }
  })
}

function createBody(){
  post.body =
  `###[Submission Thread]( ${syst.info.config.submit_thread} )\n\n---` +
  "\n\n###[Tournament Bracket]" +
  "(http://challonge.com/tw" +  syst.info.settings.week_title +  ")" +
  "\n\n---\n\n**Competitors** |" +
  "\n-- |"

  syst.info.matches.tracks.forEach(function(track_info){
    // make a clone of the track_info so it does not interfere with
    // matches.json
    const track = Object.create(track_info)
    // if a pipe char exists in the title, format it in HTML
    track.title = track.title.replace(/\|/g, '&#124;')
    post.body += `\n[ ${track.title} ]( ${track.url} )|`
  })

  post.body += "\n ---"
}

function editPost() {
  createBody()
  link = syst.info.config.reddit_link.split("https://redd.it/")[1]
  client.getSubmission(link).edit(post.body)
        .then(() => {
          console.log("Post edited.")
          syst.info.settings.reddit_info = post.body
          syst.save('s')
        })
        .catch(err =>  console.log(`Error editing post: ${err}`))
}

function editWinner(winner){
  link = syst.info.config.reddit_link.split("https://redd.it/")[1]
  winner_text = (winner.userID.length == 1) ?
  `\n\n###[ ${winner.artist} is Triumphant! ]( ${winner.url} )`:
  `\n\n###[ ${winner.artist} are Triumphant! ] ( ${winner.url} )`;
  client.getSubmission(link).edit(syst.info.settings.reddit_info + winner_text)
        .then(console.log("Post updated."))
        .catch(err => console.log(`Error updating post: ${err}`))
}

function delPost(){
  link = syst.info.config.reddit_link.split("https://redd.it/")[1]
  client.getSubmission(link).delete()
        .then(console.log("Post deleted."))
        .catch(err => console.log(`Error deleting post: ${err}`))
}
