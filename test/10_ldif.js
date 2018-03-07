var should = require('chai').should();
var ldif = require('../index');

describe('LDIF output', function () {

  it('Basic LDIF output', function (done) {
    var out = ldif.parseFile('./rfc/example1.ldif').toLDIF();
    out.should.be.a('string');
    out.should.equal(
      'version: 1\n' +
      'dn: cn=Barbara Jensen, ou=Product Development, dc=airius, dc=com\n' +
      'objectclass: top\n' +
      'objectclass: person\n' +
      'objectclass: organizationalPerson\n' +
      'cn: Barbara Jensen\n' +
      'cn: Barbara J Jensen\n' +
      'cn: Babs Jensen\n' +
      'sn: Jensen\n' +
      'uid: bjensen\n' +
      'telephonenumber: +1 408 555 1212\n' +
      'description: A big sailing fan.\n' +
      '\n' +
      'dn: cn=Bjorn Jensen, ou=Accounting, dc=airius, dc=com\n' +
      'objectclass: top\n' +
      'objectclass: person\n' +
      'objectclass: organizationalPerson\n' +
      'cn: Bjorn Jensen\n' +
      'sn: Jensen\n' +
      'telephonenumber: +1 408 555 1212\n'
    );
    done();
  });

  it('reparses LDIF example0', function (done) {
    var out = ldif.parseFile('./rfc/example0.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example1', function (done) {
    var out = ldif.parseFile('./rfc/example1.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example2', function (done) {
    var out = ldif.parseFile('./rfc/example2.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example3', function (done) {
    var out = ldif.parseFile('./rfc/example3.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example4', function (done) {
    var out = ldif.parseFile('./rfc/example4.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example5', function (done) {
    var out = ldif.parseFile('./rfc/example5.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example6', function (done) {
    var out = ldif.parseFile('./rfc/example6.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example7', function (done) {
    var out = ldif.parseFile('./rfc/example7.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example8', function (done) {
    var out = ldif.parseFile('./rfc/example8.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example9', function (done) {
    var out = ldif.parseFile('./rfc/example9.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

  it('reparses LDIF example10', function (done) {
    var out = ldif.parseFile('./rfc/example10.ldif').toLDIF();
    out.should.equal(ldif.parse(out).toLDIF());
    done();
  });

});
