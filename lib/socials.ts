import {z} from 'zod';
export const socialNames = ['Instagram', 'Facebook', 'Dribbble', 'LinkedIn'] as const;
const profileSchema = z.object({enabled:z.boolean(),url:z.string().trim().max(2000).refine(value=>{if(!value)return true;try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}},'Enter a complete http or https profile URL.')}).refine(p=>!p.enabled||!!p.url,'Add a profile URL before switching this icon on.');
export const socialsSchema=z.object({Instagram:profileSchema,Facebook:profileSchema,Dribbble:profileSchema,LinkedIn:profileSchema});
export type Socials=z.infer<typeof socialsSchema>;
export const defaultSocials:Socials={Instagram:{enabled:false,url:''},Facebook:{enabled:false,url:''},Dribbble:{enabled:false,url:''},LinkedIn:{enabled:false,url:''}};
