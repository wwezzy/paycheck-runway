// Never include provider messages, response bodies, prompts, URLs, or credentials.
const allowed=new Set(['INVALID_ARGUMENT','FAILED_PRECONDITION','OUT_OF_RANGE','UNAUTHENTICATED','PERMISSION_DENIED','NOT_FOUND','ALREADY_EXISTS','RESOURCE_EXHAUSTED','CANCELLED','DATA_LOSS','UNKNOWN','INTERNAL','NOT_IMPLEMENTED','UNAVAILABLE','DEADLINE_EXCEEDED','NETWORK_ERROR']);
export function providerDiagnostic(status,code){
 return {httpStatus:Number.isInteger(status)&&status>=100&&status<=599?status:0,errorCode:allowed.has(code)?code:'UNKNOWN'};
}
