// This is a really small function to decode base64 data
// It probably shouldn't be a separate include,
// however it may get more functionality in the future.

var Base64 = function(value){
  return (new Buffer(value,'base64')).toString();
};

module.exports = Base64;
