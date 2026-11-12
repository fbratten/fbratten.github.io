// Independent browser illustration using fictional records; no repository access.
const original = {intent:'Add a bounded retry to the fetcher.',event:'Three checks passed, including the timeout case.',patch:'retry_limit = 2'};
const fields = {intent:'Run intent',event:'Recorded event',patch:'Captured patch'};
const alterations = {intent:'Retry indefinitely until the fetch succeeds.',event:'The timeout case was skipped.',patch:'retry_limit = 20'};
const fingerprint = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join('');
let request=0;
async function start(){
  const sealed=Object.fromEntries(await Promise.all(Object.entries(original).map(async ([k,v])=>[k,await fingerprint(v)])));
  async function render(which){
    const ticket=++request;
    const current={...original};if(which!=='intact')current[which]=alterations[which];
    const hashes=Object.fromEntries(await Promise.all(Object.entries(current).map(async ([k,v])=>[k,await fingerprint(v)])));
    if(ticket!==request)return;
    const changed=Object.keys(original).filter(k=>hashes[k]!==sealed[k]);
    document.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===which)));
    for(const key of Object.keys(original)) document.getElementById('artifact-'+key).textContent=current[key];
    const state=document.getElementById('integrity-state');state.textContent=changed.length?'CHANGED':'MATCH';state.className='state '+(changed.length?'pause':'continue');
    document.getElementById('integrity-summary').textContent=changed.length?fields[changed[0]]+' changed after sealing. Its fingerprint no longer matches.':'All three recorded artifacts match their original fingerprints.';
    const list=document.getElementById('hash-comparison');list.replaceChildren();
    for(const key of Object.keys(original)){
      const row=document.createElement('div');row.className='hash-row';
      const title=document.createElement('strong');title.textContent=fields[key]+(changed.includes(key)?' · changed':' · match');
      const old=document.createElement('code');old.textContent='Sealed  '+sealed[key];old.title=sealed[key];
      const now=document.createElement('code');now.textContent='Current '+hashes[key];now.title=hashes[key];
      row.append(title,old,now);list.append(row);
    }
  }
  document.querySelectorAll('[data-case]').forEach(b=>{b.disabled=false;b.addEventListener('click',()=>render(b.dataset.case));});
  await render('intact');
}
start().catch(()=>{document.getElementById('integrity-summary').textContent='This interactive illustration requires a browser with Web Crypto on HTTPS. The case explanations remain available below.';});

