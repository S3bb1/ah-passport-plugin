/*jslint node: true */
"use strict";

exports.authenticate=
{
  name: "ah-passport-plugin/github/callback",
  description: "Just a simple demo github login - callback action",
   code: {
    required: false,

  },
  run:function(api, data, next)
  {
    api.log("ah-passport-plugin: Github callback action running", "debug");
    data.connection.rawConnection.req.query = data.connection.rawConnection.req.uri.query;
    api.AHPassportPlugin.authenticate('github', { failureRedirect: '/api/ah-passport-plugin/github/authenticate' },function (err, userProfile){
      api.cache.load(api.config.AHPassportPlugin.cachePrefix + data.connection.fingerprint, function(err, user){
        if(!user){
          user = {};
        }
        user[userProfile.provider] = userProfile;
        console.log("SAVE COnnectionid " + data.connection.fingerprint);
        api.cache.save(api.config.AHPassportPlugin.cachePrefix + data.connection.fingerprint, user, function(err, newKey){
          return next(err);
        });
      });
    })(data.connection.rawConnection.req, data.connection.rawConnection.res);


  }
};