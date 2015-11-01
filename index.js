/**
 * Node LDIF parser package
 * @author Kelly Hallman <khallman@tapmodo.com>
 * @copyright 2015 Tapmodo Interactive LLC
 * @license MIT
 */

module.exports = {
  parse: require('./lib/parser').parse,
  type: require('./lib/types')
};
