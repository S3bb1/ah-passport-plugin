/*jslint node: true */
"use strict";

exports["default"]=
{
	AHPassportPlugin: function(api)
	{
		return {

			_toExpand:false, 
			strategies:
			{
				"github":
				{
					pluginNPMModuleName:"passport-github",
					pluginSubObjectName:"Strategy",
					strategyConfig:
					{
						clientID: "***",
						clientSecret: "***",
						scope:["public_repo"],
						callbackURL: "http://localhost:8080/api/ah-passport-plugin/github/callback"
					},

					// TODO: Decide if it's worthwhile having this param
					useBuiltinSessions:true
				}
			},
			userIdExpire : 1000, // 1 second
			cachePrefix: 'users:'
		};
	}
};

exports.production=
{
	AHPassportPlugin: function(api)
	{
		return {
			
		};
	}
};

exports.uat=
{
	AHPassportPlugin: function(api)
	{
		return {
			
		};
	}
};

exports.development=
{
	AHPassportPlugin: function(api)
	{
		return {
			
		};
	}
};



