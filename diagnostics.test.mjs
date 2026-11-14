import test from 'node:test';
import assert from 'node:assert/strict';
import {providerDiagnostic} from './diagnostics.mjs';
test('provider diagnostics retain only allowlisted codes and numeric HTTP status',()=>{
 assert.deepEqual(providerDiagnostic(429,'RESOURCE_EXHAUSTED'),{httpStatus:429,errorCode:'RESOURCE_EXHAUSTED'});
 assert.deepEqual(providerDiagnostic(400,'INVALID_ARGUMENT'),{httpStatus:400,errorCode:'INVALID_ARGUMENT'});
});
test('diagnostics discard untrusted messages and nonnumeric status',()=>{
 const secret='fake-secret-or-user-financial-data';
 assert.deepEqual(providerDiagnostic(secret,secret),{httpStatus:0,errorCode:'UNKNOWN'});
 assert.equal(JSON.stringify(providerDiagnostic(403,{message:secret})).includes(secret),false);
 assert.deepEqual(providerDiagnostic(0,'NETWORK_ERROR'),{httpStatus:0,errorCode:'NETWORK_ERROR'});
});
