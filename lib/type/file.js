
var File = function(url){
  if (!(this instanceof File)) return new File(url);
  this.type = this.type;
  this.url = url;
};

File.prototype = {
  type: 'file',
  read: function(callback){
    if (typeof callback != 'function'){
      return new Promise(function(resolve,reject){
        this.read(function(err,data){
          if (err) reject(err);
          else resolve(data);
        });
      });
    }
    this._readRaw(callback);
  },
  _readRaw: function(callback){
  },
  toString: function(){
    return this.value;
  }
};

module.exports = File;
