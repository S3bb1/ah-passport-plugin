
exports.authenticate = {
  name: "test",
  description: "Just a simple demo github login action",
  needsAuthenticationWith: 'github',
  run:function(api, data, next){
  	data.response.user = data.user;
	next();
  }
};