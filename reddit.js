const reddit = require('snoowrap');
const sc = require('./soundcloud.js');
const syst = require('./setup.js');
const client = new reddit({
  userAgent: "Stratos v0.2.1, a bot by StreaK",
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  username: 'USERNAME',
  password: 'PASSWORD'
})
post = {};

module.exports = {
  textPost: textPost,
  editWinner: editWinner,
  delPost: delPost
}

function textPost(){
  createBody()
  link = client.getSubreddit('SUBREDDIT').submitSelfpost({
    title: 'Triumphant Week ' + syst.info.settings.week_title,
    text: post.body
  }).assignFlair({text: 'Triumphant', css_class: 'triumphant'})
  .then(sub => {
    post.name = (sub.name.slice(3))
    console.log(post.name)
    syst.info.settings.reddit_link = "https://redd.it/" + sub.name.slice(3)
    syst.info.settings.reddit_info = post.body
    syst.save('s')
  })
  .catch(err => {
    if (err) {
      console.log("Reddit post unavailable");
      syst.info.settings.reddit_link = "Temporarily Unavailable"
      syst.save('s')
    }
  })
}

function createBody(){
  post.body =
  `###[Submission Thread]( ${syst.info.settings.submit_thread} )\n\n---` +
  "\n\n###[Tournament Bracket]" +
  "(http://challonge.com/tw" +  syst.info.settings.week_title +  ")" +
  "\n\n---\n\n**Competitors** |" +
  "\n-- |"

  syst.info.matches.tracks.forEach(function(track_info){
    post.body += `\n[ ${track_info.title} ]( ${track_info.url} )|`
  })

  post.body += "\n ---"
}

function editWinner(winner){
  var link = syst.info.settings.reddit_link.split("https://redd.it/")[1]
  winner_text = `\n\n###[ ${winner.artist} is Triumphant! ]` +
  `( ${winner.url} )`
  client.getSubmission(link).edit(syst.info.settings.reddit_info +
                                  winner_text)
        .then(console.log("Post updated."))
        .catch(err => console.log("Error updating post:", err))
}

function delPost(){
  var link = syst.info.settings.reddit_link.split("https://redd.it/")[1]
  client.getSubmission(link).fetch()
        .then(sub => {
          sub.delete()
          .then(console.log("Post deleted."))
          .catch(err => console.log("Error deleting post:", err))
        })
}


syst.getSetup()
post.body =
`###[Submission Thread](http://reddit.com)\n\n---` +
"\n\n###[Tournament Bracket]" +
"(http://challonge.com/twtest1)" +
"\n\n---\n\n**Competitors** |" +
"\n-- |" +
`\n[ Test 1 \\| Hope this works ](https://soundcloud.com/streaksounds)|` +
`\n[ Test 2 \\| Hope this works ](https://soundcloud.com/streaksounds)|` +
`\n[ Test 3 \\| Hope this works ](https://soundcloud.com/streaksounds)|` +
`\n[ Test 4 \\| Hope this works ](https://soundcloud.com/streaksounds)|` +
'\n ---'

