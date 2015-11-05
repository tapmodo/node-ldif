# node-ldif
#### Nodejs LDIF (LDAP Data Interchange Format) parser based on [RFC2849](https://github.com/tapmodo/node-ldif/tree/master/rfc)

Unless you are an LDAP aficionado you may not know about the LDIF format.
I was surprised to learn that no LDIF parsing library existed for node.

So I wrote one, with [peg.js](http://pegjs.org). It aims to be RFC-compliant.  
Now I'll never have to use that cursed perl script again!

## Installation

Install easily with **npm**!

    npm install ldif

## LDIF Format

RFC2849 defines a somewhat complex format that can specify
**either** a series of LDAP records, or a series of changes to
LDAP records. There are other nuances that make it difficult to
parse using a lot of hand-written conditionals, such as values
that can span multiple lines, options on attribute values that
may be present, or be repeating, and so on.

A simple hand-made parser could be written for the most common
and simple use-cases, but this library aims to parse (and write)
the entire range of LDIF possible.

## Design Goals

  * 100% RFC-compliance; should comprehend any valid LDIF file
  * Parsed records stored internally intact
  * Methods are provided to extract record data in various formats
  * Outputs exactly compatilble LDIF for any parsed record or file
  * Automatic decoding and outputting of base64 data
  * No external library dependencies; pure Node Javascript

## Usage

### Parsing

##### Parsing strings
```javascript
var ldif = require('ldif'),
    file = './rfc/example1.ldif',
    input = require('fs').readFileSync(file,'utf8');

console.log(ldif.parse(input));
```

After reading the file, it's parsed as a string. There's also a
shorthand to read in a file (synchronously, as above).:

##### File parsing shorthand
```javascript
var ldif = require('ldif');
console.log(ldif.parseFile('./rfc/example1.ldif'));
```

Both of these return an object format for an entire LDIF file.
In this case, example1.ldif specifies the contents of two LDAP records.

##### Shifting records from parsed file
```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif');

console.log(file.shift());
```

Records are stored in an internal format, using classic
Javascript **objects**. The type or value specified in a `type`
property for all objects, but they can also be tested for
specific constructor types:

```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif');

console.log(file instanceof ldif.Container);        //true
console.log(file.shift() instanceof ldif.Record);   //true
```

### Converting

##### Record to plain object
```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif'),
    output_options = {};

var record = file.shift();
console.log(record.toObject(output_options));
```

Output of the above code is this:

```
{ dn: 'cn=Barbara Jensen, ou=Product Development, dc=airius, dc=com',
  attributes: 
   { objectclass: [ 'top', 'person', 'organizationalPerson' ],
     cn: [ 'Barbara Jensen', 'Barbara J Jensen', 'Babs Jensen' ],
     sn: 'Jensen',
     uid: 'bjensen',
     telephonenumber: '+1 408 555 1212',
     description: 'A big sailing fan.' } }
```

Notice that the default behavior is to output an attributes key that
containts each attribute name as a key, and either an array or string
value. Since an attribute can be single- or multi-valued, this format
makes sense in most cases.

##### Outputting LDIF for parsed files

```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif');

// the whole file
console.log(file.toLDIF());

// or just a single record
console.log(file.shift().toLDIF());
```

### TODO

  * Streaming read interface (coming soon--probably as a seperate package))
  * Construct and alter objects
  * More complete documentation
  * Test suite

