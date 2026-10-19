import 'server-only';
import { adminClient } from './admin';
// Compatibility boundary for the existing revision-checked storage calls.
// Only the explicitly supported application queries are accepted.
export function database() {
  return { prepare(sql: string) {
    const query = sql.replace(/\s+/g,' ').trim().toLowerCase();
    let args: unknown[] = [];
    return {
      bind(...values: unknown[]) { args = values; return this; },
      async first<T>(): Promise<T | null> {
        if (!/^select data,\s*revision from content where id\s*=\s*\?$/.test(query)) throw Error('Unsupported storage query');
        const {data,error} = await adminClient().from('studio_content').select('data,revision').eq('id',args[0]).maybeSingle();
        if(error) throw error;
        return data ? {data:JSON.stringify(data.data),revision:data.revision} as T : null;
      },
      async all() {
        if(query !== 'select * from enquiries order by created_at desc limit 200') throw Error('Unsupported storage query');
        const {data,error} = await adminClient().from('studio_enquiries').select('*').order('created_at',{ascending:false}).limit(200);
        if(error) throw error; return {results:data};
      },
      async run() {
        if(query.startsWith('insert into enquiries ')) {
          const [id,name,email,message,created_at]=args;
          const {error}=await adminClient().from('studio_enquiries').insert({id,name,email,message,created_at});
          if(error) throw error; return {meta:{changes:1}};
        }
        const insert = query.startsWith('insert or ignore into content');
        if(!insert && !query.startsWith('update content set data')) throw Error('Unsupported storage query');
        const [id,json,revision] = insert ? [args[0],args[1],0] : [args[1],args[0],args[2]];
        const {error}=await adminClient().rpc('save_studio_content',{record_id:id,record_data:JSON.parse(String(json)),expected_revision:revision});
        if(error?.code==='40001') return {meta:{changes:0}};
        if(error) throw error; return {meta:{changes:1}};
      }
    };
  } };
}
export function bucket() {
  const storage=()=>adminClient().storage.from(process.env.SUPABASE_STORAGE_BUCKET || 'studio-images');
  return {
    async put(key: string, bytes: Uint8Array, options: {httpMetadata:{contentType:string}}) {
      const {error}=await storage().upload(key,bytes,{contentType:options.httpMetadata.contentType,upsert:false});
      if(error) throw error;
    },
    async get(key: string) {
      const {data,error}=await storage().download(key);
      if(error) { if(String(error.statusCode)==='404' || error.message==='Object not found') return null; throw error; }
      return {body:data,httpMetadata:{contentType:data.type}};
    }
  };
}
