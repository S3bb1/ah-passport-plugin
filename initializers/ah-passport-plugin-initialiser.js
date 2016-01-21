/*jslint node: true */
"use strict";

module.exports = {
  initialize: function(api, next){
    api.log("ah-passport-plugin initialiser: Started...", "debug");

    // Mediocre test, this needs improvement
    if(typeof(api.config.AHPassportPlugin)==="object") {
      api.log("ah-passport-plugin initialiser: Found config object!", "debug");

      // Set up the passport main object
      api.AHPassportPlugin=require("passport");
      api.AHPassportPlugin.actionHeroinitialize = function(passport) {

        return function initialize(req, res, next) {
          req._passport = {};
          req._passport.instance = passport;
          if (req.session && req.session[passport._key]) {
            // load data from existing session
            req._passport.session = req.session[passport._key];
          }

          next();
        };
      };

      // Passportjs Serialize User replacement, this saves the user Object in the cache
      api.AHPassportPlugin.serializeUser(function(user, done) {
          api.cache.save(user.id, user, function(){
              done(null, user.id);
          });
        
      });
      // Passportjs Deserialize User replacement, this loads the user out of the cache
      api.AHPassportPlugin.deserializeUser(function(id, done) {
        api.cache.load(id, function(err, data){
          done(err, data);
        });
      });
      api.log("ah-passport-plugin initialiser: passport 'require' done", "debug");

      var s;
      for(s in api.config.AHPassportPlugin.strategies){
        api.log("ah-passport-plugin initialiser: Adding passport strategy %s", "debug", s);

        // Create a local, convenience var for the passport strategy config
        var conf=api.config.AHPassportPlugin.strategies[s];

        // Require the passport plugin for this strategy...
        var R=require(conf.pluginNPMModuleName);
        api.log("ah-passport-plugin initialiser: passport strategy 'require' for %s done", "debug", s);

        // ...and if it has a subobject we should use (typically, but annoyingly not mandatorily, "Strategy")
        if(conf.pluginSubObjectName){
            R=R[conf.pluginSubObjectName];
            api.log("ah-passport-plugin initialiser: passport strategy sub-object name is %s", "debug", conf.pluginSubObjectName);
        }

        // Pull out the config and verification functions for this strategy
        var c=conf.strategyConfig || {};
        var v=function verifyFn(accessToken, refreshToken, params, profile, verified){
          var user = {};
          user.accessToken = accessToken;
          user.provider = profile.provider;
          user.refreshToken = refreshToken;
          user.params = params;
          user.profile = profile;
          if(typeof(verified)==="function"){
            return verified(null, user);
          } else {
            return false;
          }
        };

        api.AHPassportPlugin.use(new R(c,v));
      }

      // Actionhero Action Middleware
      // checks it the "needsAuthenticationWith" flag is set
      // tries to load the user object of the current connection fingerprint
      // if the "needsAuthenticationWith" provider is available, store the user object in the current data
      // otherwise return an error, that the current connection is not authenitcated with the provider
      var AHPassportPluginMiddleware=function(data, next){    
        if(data.actionTemplate.needsAuthenticationWith){
          api.cache.load(api.config.AHPassportPlugin.cachePrefix + data.connection.fingerprint, function(err, user){
            if(user && user[data.actionTemplate.needsAuthenticationWith]){
              data.user = {};
              data.user[data.actionTemplate.needsAuthenticationWith] = user[data.actionTemplate.needsAuthenticationWith];
              next();
            } else {
              next({message: "Not Authenticated with: "+data.actionTemplate.needsAuthenticationWith, authProvider: data.actionTemplate.needsAuthenticationWith});
            }
          });
        } else {
          next();
        }
      };

      var middleware={
        name: 'ah_passport',
        global: true,
        priority: 10,
        preProcessor: AHPassportPluginMiddleware
      };

      api.actions.addMiddleware(middleware);

      api.log("ah-passport-plugin initialiser: Adding preProcessor to run authentication middleware", "debug");
    }

    api.log("ah-passport-plugin initialiser: Done!", "debug");

    return next();
  },
  start: function(api, next){
      return next();
  },
  stop: function(api, next){
      return next();
  }
};