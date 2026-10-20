import {database} from './storage';
import {defaultSocials,socialsSchema} from './socials';
export async function readSocials(){const row=await database().prepare('SELECT data,revision FROM content WHERE id=?').bind('socials').first<{data:string;revision:number}>();return {socials:row?socialsSchema.parse(JSON.parse(row.data)):defaultSocials,revision:row?.revision??0};}
