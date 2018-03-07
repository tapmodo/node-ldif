# node-ldif
#### Nodejs LDIF (LDAP Data Interchange Format) parser based on [RFC2849](https://github.com/tapmodo/node-ldif/tree/master/rfc)

Unless you are an LDAP aficionado you may not know about the LDIF format.
I was surprised to learn that no LDIF parsing library existed for node. So
I wrote one, with [peg.js](http://pegjs.org).

Now I'll never have to use that cursed perl script again!

### Design Goals

  * 100% RFC-compliance; should comprehend any valid LDIF file
  * Parsed records stored internally intact
  * Methods are provided to extract record data in various formats
  * Outputs exactly compatible LDIF for any parsed record or file
  * Automatic decoding and outputting of base64 data
  * No external library dependencies; pure Node Javascript
  * Includes complete test suite
  * The library can parse special language characters 

## Usage

### Installation

Install easily with *npm*!

    npm install ldif

### Parsing

##### Parsing strings
```javascript
var ldif = require('ldif'),
    file = './rfc/example1.ldif',
    input = require('fs').readFileSync(file,'utf8');

console.log(ldif.parse(input));
```

After reading the file, it's parsed as a string.  
There's also a shorthand to read in a file (synchronously, as above):

##### File parsing shorthand
```javascript
var ldif = require('ldif');
console.log(ldif.parseFile('./rfc/example1.ldif'));
```

Parsing an LDIF file returns an object format for an entire LDIF file.  
In this case, example1.ldif specifies contents of two LDAP records.

##### Shifting records from parsed file
```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif');

var record = file.shift();
```

Records are stored in an internal format, using classic
*Javascript objects*. The type or value specified in a `type`
property for all objects, but they can also be tested for
specific constructor types:

```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif');

(file instanceof ldif.Container)        === true
(file.shift() instanceof ldif.Record)   === true
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

```javascript
{ dn: 'cn=Barbara Jensen, ou=Product Development, dc=airius, dc=com',
  attributes: 
   { objectclass: [ 'top', 'person', 'organizationalPerson' ],
     cn: [ 'Barbara Jensen', 'Barbara J Jensen', 'Babs Jensen' ],
     sn: 'Jensen',
     uid: 'bjensen',
     telephonenumber: '+1 408 555 1212',
     description: 'A big sailing fan.' } }
```

Notice the default behavior outputs attribute key/value pairs
that have values of either an array or single string. Since an
attribute can be single- or multi-valued, this format makes
sense in most cases.

##### toObject(options)

The behavior of `toObject()` can be altered with options below.

Option | Type | Description | Deafult
------ | ---- | ----------- | ----------
flatten | boolean | Flatten single values into strings | true
single | boolean | Overrides flatten, only returns single values | false
decode | boolean | Decode values (not yet well-defined, leave true) | true
preserveOptions | boolean | Outputs any attribute options | true
preferOptions | array | Prefer these options when `preserveOptions` is false | [ ]

##### Outputting LDIF for parsed files

All parsed data can be written back to LDIF format using a
`toLDIF()` method (on files or entries).

```javascript
var ldif = require('ldif');
    file = ldif.parseFile('./rfc/example1.ldif');

// the whole file
console.log(file.toLDIF());

// or just a single record
console.log(file.shift().toLDIF());
```

**Note:** `toLDIF()` method folds lines by default at 78 characters.
If you want to change this value call `toLDIF(width)` where *width*
is an integer.

## Tests

To run the test suite, use `npm test` (you'll need the dev dependencies
of *mocha* and *chai* installed).

## Rebuild parser

To modify the parser, edit `lib/ldif.pegjs` and run `npm run make`
(this requires the *pegjs* dev dependency to be installed).

### TODO

  * Streaming read interface (coming soon--probably as a seperate package)
  * Construct and alter objects through code (document this)
  * More complete documentation

