var _ = require('lodash');
var fs = require('fs');

var Record = function(dn,data){
  if (!(this instanceof Record)) return new Record(dn,data);
  this.dn = dn;
  this.attributes = [];
  this.populate(data || []);
};

Record.defaults = {
  flatten: true,
  single: false,
  decode: true,
  preserveOptions: true,
  preferOptions: []
};

Record.prototype = {
  getDn: function(){
    return this.dn;
  },
  populate: function(data){
    var self = this;
    data.forEach(function(item){
      self.attributes.push({
        attribute: new Attribute(item.attribute),
        value: new Value(item.value)
      });
    });
    return this;
  },
  toObject: function(options){
    return {
      dn: this.getDn(),
      attributes: this.getAttributes(options)
    };
  },
  getAttributes: function(options){
    options = _.assign({},Record.defaults,options);
    options = options || {};
    var output = {};

    // Single mode implies flatten
    if (options.single) options.flatten = true;

    // Build output array
    this.attributes.forEach(function(item){
      var attrname = item.attribute.getName(options.preserveOptions);
      if (!output[attrname]) output[attrname] = [];
      else if (options.single) {
        if (options.preferOptions &&
          item.attribute.hasOption(options.preferOptions)) {
          output[attrname] = [ item.value.getValue(options.decode) ];
        }
        return;
      }
      output[attrname].push(item.value.getValue(options.decode));
    });

    // Flatten values (optional)
    if (options.flatten){
      Object.keys(output).forEach(function(item){
        if (output[item].length == 1)
          output[item] = output[item].shift();
      });
    }

    return output;
  }
};

var Attribute = function(data){
  this.type = data.type;
  this.options = Array.isArray(data.options)? data.options: [];
  switch(this.type){
    case 'oid':
      this.oid = data.oid;
      break;
    default:
      this.attribute = data.attribute;
      break;
  }
};

Attribute.prototype = {
  hasOption: function(list){
    if (typeof list === 'string')
      return (this.options.indexOf(list) >= 0);
    else if (Array.isArray(list))
      return list.some(this.hasOption,this);
  },
  getBaseName: function(){
    return (this.type == 'oid')? this.oid : this.attribute;
  },
  getName: function(preserveOptions){
    var options = this.options.join(';');
    if (options) options = ';' + options;
    return preserveOptions?
      this.getBaseName() + options: this.getBaseName();
  },
  toString: function(){
    return this.getName(true);
  }
};

Attribute.isOID = function(data){
  if (typeof data !== 'string') return false;
  return data.match(/^[0-9]+(.[0-9]+)*$/);
};

var Value = function(data){
  this.type = data.type;
  this.value = data.value;
};

Value.prototype = {
  getValue: function(decode){
    switch(this.type){
      case 'base64':
        return this.getEncodedValue(decode);
      case 'file':
        return this.getFileValue(decode);
      default:
      case 'value':
        return this.getBasicValue(decode);
    }
  },
  getEncodedValue: function(decode){
    var buf = new Buffer(this.value,'base64');
    return decode? buf.toString(): buf;
  },
  getFileValue: function(decode){
    if (decode) return fs.readFileSync(this.value,'utf8');
      else return fs.readFileSync(this.value);
  },
  getBasicValue: function(decode){
    return this.value;
  }
};

Value.isSafeString = function(data){
  if (typeof data !== 'string') return false;
  return data.match(/^[\x01-\x09\x0B-\x0C\x0E-\x1F\x21-\x39\x3B\x3D-\x7F][\x01-\x09\x0B-\x0C\x0E-\x7F]*$/);
};

module.exports = Record;
