// A peg.js grammar for parsing LDIF based on RFC2849
// @author Kelly Hallman <khallman@tapmodo.com>
// @copyright 2015 Tapmodo Interactive LLC
// @license MIT

//-------------------------------------------------------
// JAVASCRIPT INITIALIZATION ----------------------------
// This scope will be available to the parser

{
  var fs = require('fs');
  var _type = require('./record');
  
  function base64_decode(val){
    return (new Buffer(val,'base64')).toString();
  }

  var _pluck = function(list,attr){
    return list.map(function(cv){
      return cv[attr];
    });
  };
}

//-------------------------------------------------------
// INITIAL PARSING RULE ---------------------------------
// Since it's the first rule, it will start the parsing

start
  = changes:ldif_schema { return changes; }

//-------------------------------------------------------
// LDIF SCHEMA ------------------------------------------
// Check for changetypes first, they're more specific

ldif_schema
  = changes:ldif_changes { return changes; }
  / entry:ldif_content { return entry; }

//-------------------------------------------------------
// VERSION IDENTIFIER -----------------------------------
// Sometimes a version number is included (should be 1)

version_number
  = $ DIGIT+

version_spec "version"
  = 'version:' FILL ver:version_number SEP whitespace*
    { return parseInt(ver); }

//-------------------------------------------------------
// LDIF CONTENT SPEC ------------------------------------
// Schema for content records

ldif_content
  = whitespace* ver:(version_spec)? entries:ldif_entry+ {
    return _type.Container({ version: ver, type: 'content', entries: entries });
  }

ldif_entry "entry"
  = dn:dn_spec SEP attribs:attrs_spec? whitespace* {
    return new _type.Record(dn,attribs);
  }

//-------------------------------------------------------
// LDIF CHANGES -----------------------------------------
// Defines the general schema for changetype records

ldif_changes
  = whitespace* ver:version_spec? entries:ldif_change+ {
    return _type.Container({ version: ver, type: 'changes', entries: entries });
  }

ldif_change
  = whitespace* dn:dn_spec SEP comment_line*
    ctrl:control_spec? changes:change_record whitespace* {
      return _type.Change({
        dn: dn,
        control: ctrl,
        changes: changes.changes
      },changes.type);
    }

//-------------------------------------------------------
// CONTROL INDICATOR ------------------------------------
// The specification allows for a control: line

control_spec "control"
  = "control:" FILL oid:LDAP_OID 
    SPACE* crit:$("true"/"false")? SPACE* val:$SAFE_STRING? SEP
    {
      return {
        controlType: oid,
        criticality: crit || null,
        controlValue: val || null
      };
    }

//-------------------------------------------------------
// CHANGETYPE TYPES -------------------------------------
// Formats for add, delete, modrdn, modify

change_record "changetype"
  = comment_line* "changetype:" FILL 
    change:(change_add/change_delete/change_modrdn/change_modify)
    { return change; }

change_add
  = "add" SEP attribs:attrs_spec {
    return {
      type: 'add',
      changes: attribs
    };
  }

change_delete
  = "delete" SEP? { return { type: 'delete' }; }

change_modrdn
  = type:("modrdn"/"moddn") SEP "newrdn:" 
    FILL newrdn:SAFE_STRING SEP "deleteoldrdn:" FILL delold:("0"/"1") SEP
    newsup:change_modrdn_newsuperior?
    {
      return {
        type: type,
        changes: {
          newrdn: newrdn,
          deleteoldrdn: delold,
          newsuperior: newsup || null
        }
      };
    }

change_modrdn_newsuperior
  = "newsuperior::" FILL dn:base64_distinguishedName SEP? { return dn; }
  / "newsuperior:" FILL dn:distinguishedName SEP? { return dn; }

change_modify
  = "modify" SEP mods:mod_spec* {
    return { type: 'modify', changes: mods };
  }

mod_spec
  = type:("add"/"delete"/"replace") ":"
    FILL attr:AttributeDescription SEP
    values:attr_line* "-" SEP
    {
      values = _pluck(values,'value');
      attr = _type.Attribute(attr);
      return new _type.Modification(type,attr,values);
    }

//-------------------------------------------------------
// DN Formats -------------------------------------------
// Distinguished names; these start off each record

dn_spec "DN"
  = comment_line* "dn:" FILL dn:distinguishedName
    { return dn; }
  / comment_line* "dn::" FILL dn:base64_distinguishedName
    { return base64_decode(dn); }

distinguishedName "distinguishedName"
  = value_spec

base64_distinguishedName "base64dn"
  = base64_value_spec

//-------------------------------------------------------
// ATTRIBUTE FORMATS ------------------------------------
// Parsing attributes and values

attrs_spec "attribute list"
  = attr_line+

attr_line
  = comment_line* attr:attrval_spec { return attr; }

attrval_spec "attribute value line"
  = attr:AttributeDescription "::" FILL val:base64_value_spec SEP? {
    return {
      attribute: _type.Attribute(attr),
      value: _type.Value({ type: 'value', value: base64_decode(val) })
    };
  }
  / attr:AttributeDescription ":<" FILL val:value_spec SEP? {
    return {
      attribute: _type.Attribute(attr),
      value: _type.Value({ type: 'file', value: val })
    };
  }
  / attr:AttributeDescription ":" FILL val:value_spec SEP? {
    return {
      attribute: _type.Attribute(attr),
      value: _type.Value({ type: 'value', value: val })
    };
  }
  / attr:AttributeDescription (":<"/":") FILL SEP {
    return { attribute: _type.Attribute(attr), value: null };
  }

AttributeDescription "attribute description"
  = attr:AttributeType opts:(";" options)? {
    if (opts) {
      opts.shift();
      opts = opts.shift();
      opts = opts.split(';');
    }
    attr.options = opts || [];
    return attr;
  }

AttributeType "attribute Type"
  = oid:LDAP_OID {
    return {
      type: 'oid',
      attribute: oid
    };
  }
  / name:$(ALPHA AttrTypeChars*) {
    return {
      type: 'attribute',
      attribute: name
    };
  }

AttrTypeChars "attribute type chars"
  = ALPHA / DIGIT / "-"

LDAP_OID "OID"
  = $ (DIGIT+ ("." DIGIT+)*)

//-------------------------------------------------------
// ATTRIBUTE OPTIONS ------------------------------------
// These are somewhat rare, but in the spec

options "attribute options"
  = $ (option ";" options)
  / $ option

option "attribute option"
  = (AttrTypeChars+)

//-------------------------------------------------------
// VALUE SPECIFICATIONS ---------------------------------
// Specifying values and continuation lines

value_spec "attribute value"
  = left:SAFE_STRING SEP SPACE right:value_recurse { return left + right; }
  / $ SAFE_STRING

value_recurse "continuation"
  = left:$SAFE_CHAR+ SEP SPACE right:value_recurse { return left + right; }
  / $ SAFE_CHAR+

base64_value_spec "base64-encoded value"
  = left:BASE64_STRING SEP SPACE right:base64_value_spec { return left + right; }
  / $ BASE64_STRING

//-------------------------------------------------------
// AGGREGATES AND HELPERS -------------------------------
// Base types, character classes, and aggregates

whitespace "WHITESPACE"
  = comment_line
  / [\s]* SEP
 
comment_line "COMMENT"
  = "#" (!SEP .)* SEP

FILL "FILL"
  = (SPACE)*

SPACE "SPACE"
  = [\x20]

DIGIT "DIGIT"
  = $ [0-9]

ALPHA "ALPHA"
  = $ [a-zA-Z]

BASE64_STRING "BASE64 STRING"
  = $ BASE64_CHAR*

BASE64_CHAR "BASE64 CHAR"
  = $ [\x2B\x2F\x30-\x39\x3D\x41-\x5A\x61-\x7A]

SAFE_STRING "SAFE STRING"
  = $(SAFE_INIT_CHAR SAFE_CHAR*)

SAFE_INIT_CHAR "SAFE INITIALIZER"
  = $ [\x01-\x09\x0B-\x0C\x0E-\x1F\x21-\x39\x3B\x3D-\x7F]

SAFE_CHAR "SAFE CHAR"
  = $ [\x01-\x09\x0B-\x0C\x0E-\x7F]

SEP "NEWLINE"
  = "\r\n"
  / "\n"

