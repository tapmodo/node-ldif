/**
 * Node LDIF parser package
 * @author Kelly Hallman <khallman@tapmodo.com>
 * @copyright 2015 Tapmodo Interactive LLC
 * @license MIT
 */

var fs = require('fs');
var type = require('./lib/record');

module.exports = {
  parseFile: function(filename){
    return this.parse(fs.readFileSync(filename,'utf8'));
  },
  parse: require('./lib/parser').parse,
  Container: type.Container,
  Record: type.Record,
  Change: type.Change,
  Attribute: type.Attribute,
  Value: type.Value,
  Modification: type.Modification,
  _extend: type._extend
};
