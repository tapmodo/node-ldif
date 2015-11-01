# node-ldif
#### Nodejs LDIF (LDAP Data Interchange Format) parser based on [RFC2849](https://github.com/tapmodo/node-ldif/docs/rfc2849.md)

## Installation

Install with *npm*:

    npm install ldif

## Usage

##### Parse an LDIF file
```javascript
var LDIF = require('ldif');
var fs = require('fs');
var input = fs.readFileSync('./test/data/example1.ldif','utf8');

console.log(LDIF.parse(input));
```

## Implementation Notes

  * An attempt has been made to closely model RFC2849  
    (If you find any problems, file an issue!)
  * Supports both "content" and "change" file schemas
  * Able to parse all LDIF examples from RFC spec
  * Currently only returns plain object structure  
    This will change! (see first "TODO")

### TODO

  * Cast parsed values as defined objects
  * Ability to output LDIF format e.g. toString()
  * Streaming read interface (coming soon)
  * More complete documentation
  * Test suite

