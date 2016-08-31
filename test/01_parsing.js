var should = require('chai').should();
var ldif = require('../index');

var data = "version: 1\ndn: cn=Barbara Jensen,ou=people,o=test\n"+
  "cn: Barbara Jensen\ncn: Babs Jensen\nsn: Jensen\ncn;lang-en: Babsy\n";
var out, entry;

describe('Basic parsing',function(){

  it('parse from string',function(done){
    ldif.should.respondTo('parse');
    out = ldif.parse(data);
    done();
  });

  it('parse from file',function(done){
    ldif.should.respondTo('parseFile');
    ldif.parseFile('./rfc/example1.ldif');
    done();
  });

  it('returns a content Container',function(done){
    out.should.be.an.instanceof(ldif.Container);
    out.should.have.property('type')
      .and.equal('content');
    done();
  });

  it('parses version number',function(done){
    out.should.have.property('version')
    out.version.should.be.a('number').and.equal(1);
    done();
  });

  it('contains one entry',function(done){
    out.should.have.property('entries')
      .and.have.length(1);
    done();
  });

  it('shift an entry',function(done){
    out.should.respondTo('shift');
    entry = out.shift();
    entry.should.be.instanceof(ldif.Record);
    done();
  });

  it('whitespace after version line',function(done){
    // This is a fix for Issue #1 on github
    var parsed = ldif.parse(
      'version: 1\n' +
      '\n' +    // <-- commenting out this line makes it work again
      'dn: dc=test\n' +
      'dc: test\n'
    );
    parsed.should.have.property('type').and.equal('content');
    parsed.should.have.property('version').and.equal(1);
    parsed.should.have.property('entries').and.have.length(1);
    done();
  });

});
describe('Records',function(){

  it('has distinguishedName',function(done){
    entry.should.have.property('dn');
    entry.dn.should.equal('cn=Barbara Jensen,ou=people,o=test');
    done();
  });

  it('has attributes',function(done){
    entry.should.have.property('attributes');
    entry.attributes.should.have.length(4);
    done();
  });

  it('converts to object',function(done){
    var obj = entry.toObject();
    obj.should.be.an('object');
    done();
  });

});
describe('Object conversion',function(){

  it('toObject defaults',function(done){
    var obj = entry.toObject();
    obj.should.be.deep.equal({
      "dn": "cn=Barbara Jensen,ou=people,o=test",
      "attributes": {
        "cn": [ "Barbara Jensen", "Babs Jensen" ],
        "cn;lang-en": "Babsy",
        "sn": "Jensen"
      }
    });
    done();
  });

  it('flatten: false',function(done){
    var obj = entry.toObject({ flatten: false });
    obj.should.be.an('object');

    obj.should.be.deep.equal({
      "dn": "cn=Barbara Jensen,ou=people,o=test",
      "attributes": {
        "cn": [ "Barbara Jensen", "Babs Jensen" ],
        "sn": [ "Jensen" ],
        "cn;lang-en": [ "Babsy" ]
      }
    });
    done();
  });

  it('single: true',function(done){
    var obj = entry.toObject({ single: true });
    obj.should.be.an('object');

    obj.should.be.deep.equal({
      "dn": "cn=Barbara Jensen,ou=people,o=test",
      "attributes": {
        "cn": "Barbara Jensen",
        "cn;lang-en": "Babsy",
        "sn": "Jensen"
      }
    });
    done();
  });

  it('preserveOptions: false',function(done){
    var obj = entry.toObject({ preserveOptions: false });
    obj.should.be.an('object');

    obj.should.be.deep.equal({
      "dn": "cn=Barbara Jensen,ou=people,o=test",
      "attributes": {
        "cn": [ "Barbara Jensen", "Babs Jensen", "Babsy" ],
        "sn": "Jensen"
      }
    });
    done();
  });

  it('preferOptions array',function(done){
    var obj = entry.toObject({
      single: true,
      preserveOptions: false,
      preferOptions: [ "lang-en" ]
    });
    obj.should.be.an('object');

    obj.should.be.deep.equal({
      "dn": "cn=Barbara Jensen,ou=people,o=test",
      "attributes": {
        "cn": "Babsy",
        "sn": "Jensen"
      }
    });
    done();
  });

  it('preferOptions string',function(done){
    entry.toObject({
      single: true,
      preserveOptions: false,
      preferOptions: [ "lang-en" ]
    }).should.be.deep.equal(entry.toObject({
      single: true,
      preserveOptions: false,
      preferOptions: "lang-en"
    }));
    done();
  });

});

