module.exports = function ( objects ) {
  var extended = {};
  var merge = function (obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        extended[prop] = obj[prop];
      }
    }
  };
  merge(arguments[0]);
  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];
    merge(obj);
  }
  return extended;
};
