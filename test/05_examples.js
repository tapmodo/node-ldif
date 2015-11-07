var should = require('chai').should();
var ldif = require('../index');
var ex = [];

describe('Parses RFC Examples',function(){

  it('parse example1',function(done){
    var out = ldif.parseFile('./rfc/example1.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('content');
    ex.push(out);
    done();
  });

  it('parse example2',function(done){
    var out = ldif.parseFile('./rfc/example2.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('content');
    ex.push(out);
    done();
  });

  it('parse example3',function(done){
    var out = ldif.parseFile('./rfc/example3.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('content');
    ex.push(out);
    done();
  });

  it('parse example4',function(done){
    var out = ldif.parseFile('./rfc/example4.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('content');
    ex.push(out);
    done();
  });

  it('parse example5',function(done){
    var out = ldif.parseFile('./rfc/example5.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('content');
    ex.push(out);
    done();
  });

  it('parse example6',function(done){
    var out = ldif.parseFile('./rfc/example6.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('changes');
    ex.push(out);
    done();
  });

  it('parse example7',function(done){
    var out = ldif.parseFile('./rfc/example7.ldif');
    out.should.be.instanceof(ldif.Container);
    out.type.should.be.equal('changes');
    ex.push(out);
    done();
  });

});

describe('Test RFC Examples',function(){
  it('test example1',function(done){
    var out = ex[0];
    out.should.have.property('entries');
    out.entries.should.be.length(2);
    out.shift().toObject().should.be.deep.equal({
      "dn": "cn=Barbara Jensen, ou=Product Development, dc=airius, dc=com",
      "attributes": {
        "objectclass": [
          "top",
          "person",
          "organizationalPerson"
        ],
        "cn": [
          "Barbara Jensen",
          "Barbara J Jensen",
          "Babs Jensen"
        ],
        "sn": "Jensen",
        "uid": "bjensen",
        "telephonenumber": "+1 408 555 1212",
        "description": "A big sailing fan."
      }
    });
    out.shift().toObject().should.be.deep.equal({
      "dn": "cn=Bjorn Jensen, ou=Accounting, dc=airius, dc=com",
      "attributes": {
        "objectclass": [
          "top",
          "person",
          "organizationalPerson"
        ],
        "cn": "Bjorn Jensen",
        "sn": "Jensen",
        "telephonenumber": "+1 408 555 1212"
      }
    });
    done();
  });

  it('test example2',function(done){
    var out = ex[1];
    out.should.have.property('entries');
    out.entries.should.be.length(1);
    out.shift().toObject().should.be.deep.equal({
      "dn": "cn=Barbara Jensen, ou=Product Development, dc=airius, dc=com",
      "attributes": {
        "objectclass": [
          "top",
          "person",
          "organizationalPerson"
        ],
        "cn": [
          "Barbara Jensen",
          "Barbara J Jensen",
          "Babs Jensen"
        ],
        "sn": "Jensen",
        "uid": "bjensen",
        "telephonenumber": "+1 408 555 1212",
        "description": "Babs is a big sailing fan, and travels extensively "+
          "in search of perfect sailing conditions.",
        "title": "Product Manager, Rod and Reel Division"
      }
    });
    done();
  });

  it('test example3',function(done){
    var out = ex[2];
    out.should.have.property('entries');
    out.entries.should.be.length(1);
    out.shift().toObject().should.be.deep.equal({
      "dn": "cn=Gern Jensen, ou=Product Testing, dc=airius, dc=com",
      "attributes": {
        "objectclass": [
          "top",
          "person",
          "organizationalPerson"
        ],
        "cn": [
          "Gern Jensen",
          "Gern O Jensen"
        ],
        "sn": "Jensen",
        "uid": "gernj",
        "telephonenumber": "+1 408 555 1212",
        "description": "What a careful reader you are!  This value "+
          "is base-64-encoded because it has a control character in "+
          "it (a CR).\r  By the way, you should really get out more."
      }
    });
    done();
  });

  it('test example4',function(done){
    var out = ex[3];
    out.should.have.property('entries');
    out.entries.should.be.length(2);
    out.shift().toObject().should.be.deep.equal({
      "dn": "ou=営業部,o=Airius",
      "attributes": {
        "objectclass": [
          "top",
          "organizationalUnit"
        ],
        "ou": "営業部",
        "ou;lang-ja": "営業部",
        "ou;lang-ja;phonetic": "えいぎょうぶ",
        "ou;lang-en": "Sales",
        "description": "Japanese office"
      }
    });
    out.shift().toObject().should.be.deep.equal({
      "dn": "uid=rogasawara,ou=営業部,o=Airius",
      "attributes": {
        "userpassword": "{SHA}O3HSv1MusyL4kTjP+HKI5uxuNoM=",
        "objectclass": [
          "top",
          "person",
          "organizationalPerson",
          "inetOrgPerson"
        ],
        "uid": "rogasawara",
        "mail": "rogasawara@airius.co.jp",
        "givenname;lang-ja": "ロドニー",
        "sn;lang-ja": "小笠原",
        "cn;lang-ja": "小笠原 ロドニー",
        "title;lang-ja": "営業部 部長",
        "preferredlanguage": "ja",
        "givenname": "ロドニー",
        "sn": "小笠原",
        "cn": "小笠原 ロドニー",
        "title": "営業部 部長",
        "givenname;lang-ja;phonetic": "ろどにー",
        "sn;lang-ja;phonetic": "おがさわら",
        "cn;lang-ja;phonetic": "おがさわら ろどにー",
        "title;lang-ja;phonetic": "えいぎょうぶ ぶちょう",
        "givenname;lang-en": "Rodney",
        "sn;lang-en": "Ogasawara",
        "cn;lang-en": "Rodney Ogasawara",
        "title;lang-en": "Sales, Director"
      }
    });
    done();
  });

  it('test example5');
  it('test example6');
  it('test example7');

});

