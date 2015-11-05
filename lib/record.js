var _ = require('lodash');
var fs = require('fs');

var Container = function(data){
  if (!(this instanceof Container)) return new Container(data);
  this.type = data.type;
  this.version = data.version;
  this.entries = data.entries;
};

Container.prototype = {
  toLDIF: function(width){
    width = width || 78;
    var output = this.entries.map(function(item){
      return item.toLDIF(width);
    });
    var version = '';
    if (this.version) version = 'version: ' + this.version + '\n';
    return version + output.join('\n\n') + '\n';
  }
};

var Change = function(data,type){
  if (!(this instanceof Change)) return new Change(data,type);
  this.type = type || 'change';
  this.dn = data.dn;
  this.control = data.control;
  if (type == 'modrdn') { this.modrdn = data.changes; }
  else this.changes = Array.isArray(data.changes)? data.changes: [];
};

Change.prototype = {
  toLDIF: function(width){
    width = width || 78;
    var output;
    var self = this;
    if (this.modrdn) {
      output = Object.keys(this.modrdn).filter(function(key){
        return self.modrdn[key];
      }).map(function(key){
        return Attribute.prettyPrint(key,Value({ value: self.modrdn[key] }),width);
      });
    }
    else if (this.type == 'add'){
      output = this.changes.map(function(item){
        return Attribute.prettyPrint(item.attribute,item.value,width);
      });
    }
    else {
      output = this.changes.map(function(item){
        return item.toLDIF(width);
      });
    }
    output.unshift(Attribute.prettyPrint(
      'changetype',
      new Value({ value: this.type })
    ));
    output.unshift(Attribute.prettyPrint(
      'dn',
      new Value({ value: this.dn })
    ));
    return output.join('\n');
  }
};

var Record = function(dn,data){
  if (!(this instanceof Record)) return new Record(dn,data);
  this.type = 'record';
  this.dn = dn;
  this.attributes = [];
  this.populate(data || []);
};

Record.prototype = {
  getDn: function(){
    return this.dn;
  },
  populate: function(data){
    var self = this;
    data.forEach(function(item){
      if (!(item.value instanceof Value))
        item.value = new Value(item.value);
      if (!(item.attribute instanceof Attribute))
        item.attribute = new Attribute(item.attribute);
      self.attributes.push({
        attribute: item.attribute,
        value: item.value
      });
    });
    return this;
  },
  toLDIF: function(width){
    width = width || this.width || 78;
    var output = this.attributes.map(function(item){
      return Attribute.prettyPrint(item.attribute,item.value,width);
    });
    output.unshift(Attribute.prettyPrint('dn',new Value({ value: this.dn }),width));
    return output.join('\n');
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
  if (!(this instanceof Attribute)) return new Attribute(data);
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


var Value = function(data){
  if (!(this instanceof Value)) return new Value(data);
  this.type = data.type;
  this.value = data.value;
};

Value.prototype = {
  toObject: function(){
    return {
      type: this.type,
      value: this.value
    };
  },
  isFile: function(){
    return this.type == 'file';
  },
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
  toBase64: function(){
    return (new Buffer(this.getRawValue())).toString('base64');
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
    return this.getRawValue();
  },
  getRawValue: function(){
    return this.value;
  }
};


var ModifyCommand = function(type,attr,values){
  if (!(this instanceof ModifyCommand))
    return new ModifyCommand(type,attr,values);

  this.type = type;
  if (!(attr instanceof Attribute)) throw 'Not attribute';
  this.attribute = attr;
  this.values = values;
};

ModifyCommand.prototype = {
  toObject: function(){
    return {
      type: this.type,
      attribute: this.attribute.toObject(),
      values: this.values.map(function(item){
        return item.toObject();
      })
    };
  },
  toLDIF: function(width){
    width = width || 78;
    var self = this;
    var output = this.values.map(function(item){
      return Attribute.prettyPrint(self.attribute,item,width);
    });
    output.unshift(this.type + ': ' + this.attribute.getName(true));
    return output.join('\n') + '\n-';
  },
  toString: function(){
    return this.toLDIF();
  }
};

Record.defaults = {
  flatten: true,
  single: false,
  decode: true,
  preserveOptions: true,
  preferOptions: []
};

Attribute.prettyPrint = function(attribute,value,width){
  debugger;
  width = width || 77;
  var attrib = (typeof attribute === 'string')?
    attribute: attribute.toString();
  var is_safe = Value.isSafeString(value.getRawValue());
  var is_file = value.isFile();
  value = is_safe? value.getRawValue(): value.toBase64();
  var regex = new RegExp('.{1,'+width+'}','g');
  var sep = is_safe? ':': '::';
  if (is_file) sep = ':<';
  var output = attrib + sep + ' ' + value;
  return output.substr(0,1)+(output.substr(1).match(regex).join('\n '));
};

Attribute.isOID = function(data){
  if (typeof data !== 'string') return false;
  return data.match(/^[0-9]+(.[0-9]+)*$/);
};

Value.isSafeString = function(data){
  if (typeof data !== 'string') return false;
  return data.match(/^[\x01-\x09\x0B-\x0C\x0E-\x1F\x21-\x39\x3B\x3D-\x7F][\x01-\x09\x0B-\x0C\x0E-\x7F]*$/);
};

module.exports = {
  Container: Container,
  Change: Change,
  ModifyCommand: ModifyCommand,
  Record: Record,
  Attribute: Attribute,
  Value: Value
}
