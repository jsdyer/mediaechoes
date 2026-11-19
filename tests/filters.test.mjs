import assert from 'node:assert/strict';
import test from 'node:test';
import {queryFor,searchUrls} from '../web/model.mjs';

test('scopes title phrases, dates, creator, collection and exclusions on the server',()=>{
  const f={query:'A "B"',field:'title',phrase:'phrase',from:'1995',to:'1995',era:'2010s',
    creator:'Studio',collection:'cdromsoftware',exclude:'demo "work in progress"'};
  const q=queryFor(f);
  assert.ok(q.includes('title:"A \\"B\\""'));
  assert.ok(q.includes('date:[1995-01-01T00:00:00Z TO 1995-12-31T23:59:59Z]'));
  assert.match(q,/creator:"Studio" AND collection:"cdromsoftware" AND NOT "demo" AND NOT "work in progress"/);
  assert.equal(searchUrls(f,2).official.searchParams.get('query'),q);
});
test('supports earlier shared searches and rejects invalid year order',()=>{
  assert.ok(queryFor({query:'"CD ROM" disc'}).endsWith('"CD ROM" AND "disc"'));
  assert.throws(()=>queryFor({from:'1995',to:'1990'}));
});
