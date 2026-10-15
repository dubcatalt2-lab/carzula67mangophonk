import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectSymbols,replaceSymbols,encodeStrings} from '../scripts/dom-symbols.mjs';
import vm from 'node:vm';
test('DOM references remain consistent across labels, CSS and script selectors',()=>{
 const map=collectSymbols('<label for="homeSearch">Find</label><input id="homeSearch">');
 const name=map.get('homeSearch');assert.ok(name);
 assert.equal(replaceSymbols('for="homeSearch" #homeSearch getElementById("homeSearch")',map),`for="${name}" #${name} getElementById("${name}")`);
 assert.equal(replaceSymbols('homeSearchSuffix',map),'homeSearchSuffix');
});
test('encoded strings preserve Unicode, escaping, directives and values',()=>{
 const source='"use strict"; globalThis.result = ["hello", "\\n", "moon \u{1f319}", "quote\\\""];';
 const original={},encoded={};vm.runInNewContext(source,original);vm.runInNewContext(encodeStrings(source),encoded);
 assert.equal(JSON.stringify(original.result),JSON.stringify(encoded.result));
 assert.ok(!encodeStrings(source).includes('hello'));
});
