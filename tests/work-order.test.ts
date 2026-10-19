import assert from 'node:assert/strict';
import {orderedProjects,newestProjects,moveProject,type Project} from '../lib/content';
const make=(id:string,status:Project['status'],publishedAt:string):Project=>({id,name:id,status,publishedAt,service:'',description:'',alt:'',image:''});
const rows=[make('older','completed','2026-01-01'),make('latest','unlabelled','2026-10-01'),make('draft','draft','2026-12-01'),make('progress','in-progress','2026-08-01')];
assert.deepEqual(newestProjects(rows).map(x=>x.id),['latest','progress','older']);
const moved=moveProject(rows,'older',0);assert.equal(moved[0].id,'older');assert.equal(rows[0].sortOrder,undefined);
const saved=JSON.parse(JSON.stringify(moved));assert.equal(orderedProjects(saved)[0].id,'older');assert.deepEqual(newestProjects(saved).filter(p=>p.status!=='in-progress').slice(0,2).map(p=>p.id),['older','latest']);assert.ok(!newestProjects(saved).some(p=>p.id==='draft'));assert.equal(moveProject(saved,'missing',0).length,4);assert.equal(moveProject(saved,'older',-1)[0].id,'older');console.log('PASS: legacy date order, saved custom order, homepage selection, hidden drafts, and movement boundaries.');
