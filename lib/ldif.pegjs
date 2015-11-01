{
  var fs = require('fs');

  function base64(value){
    return new Buffer(value,'base64').toString();
  }

  var File = function(value){
    this.type = 'file';
    this.url = value;
  };

var _pluck = function(list,attr){
  return list.map(function(cv){
    return cv[attr];
  });
};

}

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
  = 'version:' FILL ver:version_number SEP
    { return parseInt(ver); }

//-------------------------------------------------------
// LDIF CHANGES -----------------------------------------
// Defines the general schema for changetype records

ldif_changes
  = whitespace* ver:version_spec? entries:ldif_change+
    { return { version: ver, type: 'changes', changes: entries }; }

ldif_change
  = whitespace* dn:dn_spec SEP comment_line*
    ctrl:control_spec? changes:change_record whitespace*
    { return { dn: dn, control: ctrl, changes: changes }; }

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
      attributes: attribs
    };
  }

change_delete
  = "delete" SEP? { return { type: 'delete' }; }

change_modrdn
  = type:("modrdn"/"moddn") SEP "newrdn:" 
    FILL SAFE_STRING SEP "deleteoldrdn:" FILL delold:("0"/"1") SEP
    newsup:change_modrdn_newsuperior?
    {
      return { type: type, deleteoldrdn: delold, newsuperior: newsup || null }
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
    FILL attr:attributeDescription SEP
    values:attr_line* "-" SEP
    {
      values = _pluck(values,'value');
      return { type: type, attribute: attr, values: values };
    }

//-------------------------------------------------------
// LDIF CONTENT SPEC ------------------------------------
// Schema for content records

ldif_content
  = whitespace* ver:(version_spec)? entries:ldif_entry+ {
    return { version: ver, type: 'content', entries: entries };
  }

ldif_entry "entry"
  = dn:dn_spec SEP attribs:attrs_spec whitespace* {
    return { dn: dn, attributes: attribs };
  }

//-------------------------------------------------------
// DN Formats -------------------------------------------
// Distinguished names; these start off each record

dn_spec "DN"
  = comment_line* "dn:" FILL dn:distinguishedName { return dn; }
  / comment_line* "dn::" FILL dn:base64_distinguishedName { return base64(dn); }

distinguishedName "distinguishedName"
  = SAFE_STRING

base64_distinguishedName "base64dn"
  = BASE64_STRING

//-------------------------------------------------------
// ATTRIBUTE FORMATS ------------------------------------
// Parsing attributes and values

attrs_spec "attribute list"
  = attr_line+

attr_line
  = comment_line* attr:attrval_spec { return attr; }

attrval_spec "attribute value line"
  = attr:attributeDescription "::" FILL val:base64_value_spec SEP? {
    return { attribute: attr, value: base64(val) };
  }
  / attr:attributeDescription ":<" FILL val:value_spec SEP? {
    return { attribute: attr, value: new File(val) };
  }
  / attr:attributeDescription ":" FILL val:value_spec SEP? {
    return { attribute: attr, value: val };
  }
  / attr:attributeDescription (":<"/":") FILL SEP {
    return { attribute: attr, value: null };
  }

attributeDescription "attribute description"
  = attr:AttributeType opts:(";" options)? {
    if (!opts) return attr;
    opts.shift();
    opts = opts.shift();
    opts = opts.split(';');
    if (opts.length == 1) opts = opts.shift();
    return { name: attr, options: opts };
  }

AttributeType
  = oid:LDAP_OID { return new OID(oid); }
  / $(ALPHA AttrTypeChars*)

AttrTypeChars "attribute type chars"
  = ALPHA / DIGIT / "-"

LDAP_OID "OID"
  = $ (DIGIT+ ("." DIGIT+)*)

//-------------------------------------------------------
// ATTRIBUTE OPTIONS ------------------------------------
// These are somewhat rare, but in the spec

options
  = $ (option ";" options)
  / $ option

option
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

base64_value_spec
  = left:BASE64_STRING SEP SPACE right:base64_value_spec { return left + right; }
  / $ BASE64_STRING

//-------------------------------------------------------
// AGGREGATES AND HELPERS -------------------------------
// Base types, character classes, and aggregates

whitespace "whitespace"
  = comment_line
  / [\s]* SEP
 
comment_line "comment"
  = "#" (!SEP .)* SEP

FILL "space fill"
  = (SPACE)*

SPACE "single space"
  = [\x20]

DIGIT "digit"
  = $ [0-9]

ALPHA "alpha"
  = $ [a-zA-Z]

BASE64_STRING
  = $ BASE64_CHAR*

BASE64_CHAR
  = $ [\x2B\x2F\x30-\x39\x3D\x41-\x5A\x61-\x7A]

SAFE_STRING "safestring"
  = $(SAFE_INIT_CHAR SAFE_CHAR*)

SAFE_INIT_CHAR
  = $ [\x01-\x09\x0B-\x0C\x0E-\x1F\x21-\x39\x3B\x3D-\x7F]

SAFE_CHAR "SAFE CHAR"
  = $ [\x01-\x09\x0B-\x0C\x0E-\x7F]

SEP "newline"
  = "\r\n"
  / "\n"

