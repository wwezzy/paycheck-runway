import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

test('HTTP serves every browser module including persistence', async () => {
  const child=spawn(process.execPath,['server.mjs'],{cwd:import.meta.dirname,env:{...process.env,PORT:'31947',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
  try {
    await Promise.race([once(child.stdout,'data'),once(child,'error').then(([e])=>Promise.reject(e)),new Promise((_,reject)=>setTimeout(()=>reject(Error('server startup timeout')),5000).unref())]);
    for(const path of ['/','/app.js','/core.js','/storage.js','/speech.js','/style.css']){
      const r=await fetch('http://127.0.0.1:31947'+path);
      assert.equal(r.status,200,path);
      if(path.endsWith('.js'))assert.match(r.headers.get('content-type'),/javascript/);
      assert.ok((await r.text()).length>0);
    }
    assert.equal((await fetch('http://127.0.0.1:31947/not-public')).status,404);
  } finally { child.kill(); await once(child,'exit'); }
});
