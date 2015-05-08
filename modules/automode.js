var fs = require('fs');
var isAdmin = require('./is-admin.js');
var usermodes = ["i", "s", "w", "o", "v", "b", "a"  ]
/*
 * Helper for checking if a nick is on channel's auto-mode list
 * -----------------------------------------------------------------------------
 */

function autoModes(client, channel, nick) {

  if (!fs.existsSync('./config/automode.json')) { return false; }
  var automodes = require('../config/automode.json')

  if (automodes == undefined) { return false; }

  var chans = Object.keys(automodes);
  chans.forEach(function(chan) {
    if (chan.toLowerCase() == channel.toLowerCase()){
      var users = Object.keys(automodes[chan]);
      users.forEach(function(user) {
        if (user.toLowerCase() == nick.toLowerCase()){
          //var value = automodes[chan][user]
          var value = automodes[chan][user].split('');
          var error = "FALSE";
loop1:         
          for(var i=0;i<value.length;i++) {
            if ( error == "FALSE"){
              for(var i2=0;i2 <usermodes.length; i2++) {
                if (value[i] == usermodes[i2]){
                  break loop1;
                } else {
                  error = "TRUE";
                  console.log("Auto-mode: In %s > %s > %s is not a valid user mode.", chan, user, value[i])
                  break loop1;
                }
              }
            } else {
              console.log("Auto-mode: Error in modes list")
              break loop1;
            }
          }
          if (error == "FALSE"){
            console.log("Auto-mode: Set MODE %s to %s on %s.", value.toString(), user, chan)
            client.send('MODE', channel, '+'+value.toString(), nick);
          }
        } else {
          //no user matches in chan
          return false;
        }
      });
    } else {
      //no channel matches
      return false;
    }
  });
};

module.exports = function(client, channel, nick, message) {

  // auto-op bor admin and optionally /MODE configured users on automodes.json
  if (isAdmin(message.prefix)) {
    client.send('MODE', channel, '+o', nick);
  }else{
    autoModes(client, channel, nick);
  }
}
