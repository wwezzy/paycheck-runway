import test from 'node:test';
import assert from 'node:assert/strict';
import {speechSnapshot} from './public/speech.js';
const result=(text,isFinal=false)=>Object.assign([{transcript:text}],{isFinal});
test('interim revisions replace, rather than append, each other',()=>{
  for(const text of ['Hello','Hello rent','Hello rent is','Hello rent is 100 dollars']){
    const x=speechSnapshot([result(text)]);
    assert.equal(x.preview,text);assert.equal(x.committed,'');
  }
});
test('replayed cumulative finals do not duplicate previous phrases',()=>{
  const a=result('Rent is 100 dollars.',true);
  assert.equal(speechSnapshot([a]).committed,'Rent is 100 dollars.');
  assert.equal(speechSnapshot([a,result('Insurance is 600')]).preview,'Rent is 100 dollars. Insurance is 600');
  const full=[a,result('Insurance is 600 dollars.',true)];
  assert.equal(speechSnapshot(full).committed,'Rent is 100 dollars. Insurance is 600 dollars.');
  assert.deepEqual(speechSnapshot(full),speechSnapshot(full));
});
test('prefix from an earlier recording is retained exactly once',()=>{
  assert.equal(speechSnapshot([result('Salary is 1000 dollars.',true)],'Rent is 100 dollars. ').committed,'Rent is 100 dollars. Salary is 1000 dollars.');
});
test('interim phrases can shrink and are not committed when recording ends',()=>{
  const a=result('Rent is 100 dollars.',true);
  assert.equal(speechSnapshot([a,result('Also my weekly salary')]).committed,'Rent is 100 dollars.');
  assert.equal(speechSnapshot([a]).preview,'Rent is 100 dollars.');
});
test('legitimate identical final utterances are not blindly deduplicated',()=>{
  assert.equal(speechSnapshot([result('100 dollars.',true),result('100 dollars.',true)]).committed,'100 dollars. 100 dollars.');
});
