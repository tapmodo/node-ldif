# node-ldif
#### Nodejs LDIF (LDAP Data Interchange Format) parser based on [RFC2849](https://github.com/tapmodo/node-ldif/blob/master/docs/rfc2849.md)

Unless you are an LDAP aficionado you may not know about the LDIF format.
I was surprised to learn that no LDIF parsing library existed for node.

So I wrote one, with [peg.js](http://pegjs.org).  
Now I'll never have to use that cursed perl script again!

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

##### Current object output

```json
{
  "version": 1,
  "type": "content",
  "entries": [
    {
      "dn": "cn=Barbara Jensen, ou=Product Development, dc=airius, dc=com",
      "attributes": [
        {
          "attribute": "objectclass",
          "value": "top"
        },
        {
          "attribute": "objectclass",
          "value": "person"
        },
        {
          "attribute": "objectclass",
          "value": "organizationalPerson"
        },
        {
          "attribute": "cn",
          "value": "Barbara Jensen"
        },
        {
          "attribute": "cn",
          "value": "Barbara J Jensen"
        },
        {
          "attribute": "cn",
          "value": "Babs Jensen"
        },
        {
          "attribute": "sn",
          "value": "Jensen"
        },
        {
          "attribute": "uid",
          "value": "bjensen"
        },
        {
          "attribute": "telephonenumber",
          "value": "+1 408 555 1212"
        },
        {
          "attribute": "description",
          "value": "A big sailing fan."
        }
      ]
    },
    {
      "dn": "cn=Bjorn Jensen, ou=Accounting, dc=airius, dc=com",
      "attributes": [
        {
          "attribute": "objectclass",
          "value": "top"
        },
        {
          "attribute": "objectclass",
          "value": "person"
        },
        {
          "attribute": "objectclass",
          "value": "organizationalPerson"
        },
        {
          "attribute": "cn",
          "value": "Bjorn Jensen"
        },
        {
          "attribute": "sn",
          "value": "Jensen"
        },
        {
          "attribute": "telephonenumber",
          "value": "+1 408 555 1212"
        }
      ]
    }
  ]
}
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

