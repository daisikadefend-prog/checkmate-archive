// Checkmate Archive: player discovery, article reader, PGN replay, Stockfish and crypto support.
const $=id=>document.getElementById(id);
async function fetchJSON(url,timeout=7000,options={}){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw Error(`Request failed (${response.status})`);return await response.json()}finally{clearTimeout(timer)}}
let siteLanguage=localStorage.getItem("ca-language")||"en";
const portraitCache=new Map(),portraitPending=new Map();
function wikipediaSummary(name,lang=siteLanguage){const code=["en","es","ru"].includes(lang)?lang:"en";const url=`https://${code}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g,"_"))}`;return fetchJSON(url,6500,{headers:{"accept":"application/json"}})}
async function getPlayerPortrait(name){
 const cacheKey=name.toLowerCase();if(portraitCache.has(cacheKey))return portraitCache.get(cacheKey);
 if(portraitPending.has(cacheKey))return portraitPending.get(cacheKey);
 const task=(async()=>{let src="";const mapped=searchAliases[name.toLowerCase()]||name;
  try{const w=await wikipediaSummary(mapped,"en");src=w?.thumbnail?.source||w?.originalimage?.source||"";}catch{}
  if(!src){try{src=await commonsImage(mapped)}catch{}}
  portraitCache.set(cacheKey,src);try{localStorage.setItem("ca-portrait-"+cacheKey,src)}catch{}return src;
 })();portraitPending.set(cacheKey,task);try{return await task}finally{portraitPending.delete(cacheKey)}
}
function hydratePlayerPortraits(){
 const imgs=[...document.querySelectorAll("img[data-portrait-name]")];
 const load=async img=>{if(img.dataset.loaded||img.dataset.loading)return;img.dataset.loading="1";const name=img.dataset.portraitName;let cached="";try{cached=localStorage.getItem("ca-portrait-"+name.toLowerCase())||""}catch{}const src=cached||await getPlayerPortrait(name);if(src){img.onload=()=>img.classList.add("loaded");img.onerror=async()=>{img.classList.remove("loaded");if(img.dataset.fallbackTried){img.dataset.failed="1";return}img.dataset.fallbackTried="1";try{localStorage.removeItem("ca-portrait-"+name.toLowerCase())}catch{}portraitCache.delete(name.toLowerCase());const fallback=await commonsImage(searchAliases[name.toLowerCase()]||name);if(fallback&&fallback!==src){img.src=fallback}else img.dataset.failed="1"};img.src=src}else img.dataset.failed="1";img.dataset.loaded="1";};
 if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){load(e.target);io.unobserve(e.target)}}),{rootMargin:"180px"});imgs.forEach(i=>io.observe(i));}else imgs.forEach(load);
}
const featuredNames=[
 "Magnus Carlsen","Garry Kasparov","Hikaru Nakamura","Alireza Firouzja","Fabiano Caruana","Ding Liren","Gukesh Dommaraju","Viswanathan Anand","Bobby Fischer","Mikhail Tal",
 "Judit Polgar","Hou Yifan","Ian Nepomniachtchi","Levon Aronian","Wesley So","Anish Giri","Nodirbek Abdusattorov","Arjun Erigaisi","R Praggnanandhaa","Wei Yi",
 "Levy Rozman","Daniel Naroditsky","Anna Cramling","Andrea Botez","Alexandra Botez","Volen Dyulgerov","Rey Enigma","Tanitoluwa Adewumi","Boris Spassky","José Raúl Capablanca",
 "Paul Morphy","Adolf Anderssen","Lionel Kieseritzky","Wilhelm Steinitz","Emanuel Lasker","José Raúl Capablanca","Alexander Alekhine","Mikhail Botvinnik","Tigran Petrosian","Boris Spassky","Vasily Smyslov","Viktor Korchnoi","Anatoly Karpov","Vladimir Kramnik","Veselin Topalov","Vladimir Kramnik","Peter Svidler","Shakhriyar Mamedyarov","Sergey Karjakin","Maxime Vachier-Lagrave","Teimour Radjabov","Richard Rapport","Daniil Dubov","Nihal Sarin","Vidit Gujrathi","Rameshbabu Vaishali","Ju Wenjun","Lei Tingjie","Kateryna Lagno","Alexandra Kosteniuk","Nana Dzagnidze","Pia Cramling","Susan Polgar","Nino Batsiashvili","Bibisara Assaubayeva","Abhimanyu Mishra","Samuel Sevian","Hans Niemann","Christopher Yoo","Jeffery Xiong","David Howell","Peter Heine Nielsen","Tania Sachdev","Anna Muzychuk","Mariya Muzychuk","Alexey Shirov","Richard Reti","Akiba Rubinstein","Siegbert Tarrasch","Frank Marshall","Harry Pillsbury","Savielly Tartakower","Aron Nimzowitsch","Efim Bogoljubov","David Bronstein","Paul Keres","Miguel Najdorf","Bent Larsen","Rashid Nezhmetdinov","Vasily Ivanchuk","Alexander Grischuk","Sergey Movsesian","Evgeny Tomashevsky","Leinier Dominguez","Dommaraju Gukesh"
];
const quickNames=["Hikaru Nakamura","Alireza Firouzja","Magnus Carlsen","Garry Kasparov","Mikhail Tal","Witty Alien","Paul Morphy","Anatoly Karpov","Ju Wenjun","Levy Rozman","Gukesh Dommaraju"];
const nicknames={
 "Magnus Carlsen":"The Mozart of Chess","Garry Kasparov":"The Beast of Baku","Bobby Fischer":"The American Genius","Mikhail Tal":"The Magician from Riga","Viswanathan Anand":"The Tiger of Madras","José Raúl Capablanca":"The Chess Machine","Hikaru Nakamura":"H-Bomb","Judit Polgar":"The Queen of Chess","Levon Aronian":"The David Beckham of Chess","Volen Dyulgerov":"Witty Alien","Rey Enigma":"Rey Enigma"
};
const searchAliases={"witty alien":"Volen Dyulgerov","gothamchess":"Levy Rozman","the magician from riga":"Mikhail Tal","tiger of madras":"Viswanathan Anand","opera game":"Paul Morphy","immortal game":"Adolf Anderssen","kasparov immortal":"Garry Kasparov","the evergreen game":"Adolf Anderssen"};
const featuredInfo={
 "Magnus Carlsen":"Norwegian grandmaster and five-time classical world champion",
 "Garry Kasparov":"Former world champion and one of the most dominant players in history",
 "Hikaru Nakamura":"American grandmaster, streamer and five-time U.S. champion",
 "Alireza Firouzja":"French-Iranian grandmaster and elite attacking player",
 "Mikhail Tal":"Latvian-Soviet world champion famous for imaginative sacrifices",
 "Witty Alien":"Bulgarian Candidate Master and chess creator Volen Dyulgerov",
 "Rey Enigma":"Masked chess content creator and public chess personality",
 "Levy Rozman":"American International Master and creator known as GothamChess",
 "Daniel Naroditsky":"American grandmaster, educator and commentator",
 "Judit Polgar":"Hungarian grandmaster widely regarded as the strongest woman chess player ever",
 "Gukesh Dommaraju":"Indian grandmaster and 2024 world champion",
 "Paul Morphy":"American chess master who dominated international competition in the 1850s",
 "Adolf Anderssen":"German master remembered for the Immortal Game and the Evergreen Game",
 "Lionel Kieseritzky":"Baltic German chess master who played Anderssen in the Immortal Game",
 "Wilhelm Steinitz":"First official World Chess Champion and a founder of modern positional chess",
 "Emanuel Lasker":"German mathematician and second World Chess Champion, holding the title for 27 years",
 "Alexander Alekhine":"Fourth World Chess Champion known for dynamic combinations and deep calculation",
 "Mikhail Botvinnik":"Sixth World Chess Champion and influential Soviet chess teacher",
 "Tigran Petrosian":"Ninth World Chess Champion famous for defensive skill and exchange sacrifices",
 "Boris Spassky":"Tenth World Chess Champion who faced Bobby Fischer in the 1972 match",
 "Vasily Smyslov":"Seventh World Chess Champion known for harmonious positional play",
 "Viktor Korchnoi":"Elite Soviet-born grandmaster who challenged for the world title four times",
 "Anatoly Karpov":"Twelfth World Chess Champion renowned for positional precision",
 "Vladimir Kramnik":"Fourteenth World Chess Champion who defeated Garry Kasparov in 2000",
 "Veselin Topalov":"Bulgarian grandmaster and 2005 FIDE World Champion",
 "Peter Svidler":"Russian grandmaster and eight-time Russian champion",
 "Shakhriyar Mamedyarov":"Azerbaijani grandmaster and elite attacking player",
 "Sergey Karjakin":"Grandmaster who became a world championship challenger in 2016",
 "Maxime Vachier-Lagrave":"French grandmaster known for elite calculation and the Najdorf Sicilian",
 "Teimour Radjabov":"Azerbaijani grandmaster and 2019 World Cup winner",
 "Richard Rapport":"Hungarian grandmaster known for creative and unconventional play",
 "Daniil Dubov":"Russian grandmaster and 2018 World Rapid Champion",
 "Nihal Sarin":"Indian grandmaster known for fast tactical play",
 "Vidit Gujrathi":"Indian grandmaster and 2023 FIDE Grand Swiss winner",
 "Rameshbabu Vaishali":"Indian grandmaster and elite women's chess player",
 "Ju Wenjun":"Chinese grandmaster and multiple-time Women's World Champion",
 "Lei Tingjie":"Chinese grandmaster and 2023 Women's World Championship challenger",
 "Kateryna Lagno":"Grandmaster and multiple-time Women's World Blitz Champion",
 "Alexandra Kosteniuk":"Grandmaster and 12th Women's World Champion",
 "Nana Dzagnidze":"Georgian grandmaster and 2017 Women's World Blitz Champion",
 "Pia Cramling":"Swedish grandmaster and one of the leading women players of her generation",
 "Susan Polgar":"Hungarian-American grandmaster and former Women's World Champion",
 "Abhimanyu Mishra":"American grandmaster who became the youngest GM in history",
 "Samuel Sevian":"American grandmaster who became a grandmaster at age 13",
 "Hans Niemann":"American grandmaster and chess competitor",
 "Jeffery Xiong":"American grandmaster and former World Junior Champion",
 "David Howell":"English grandmaster and chess commentator",
 "Tania Sachdev":"Indian International Master and chess commentator",
 "Anna Muzychuk":"Ukrainian grandmaster and former Women's World Rapid and Blitz Champion",
 "Mariya Muzychuk":"Ukrainian grandmaster and former Women's World Champion",
 "Akiba Rubinstein":"Polish grandmaster regarded as one of the strongest players of the early 20th century",
 "Richard Reti":"Austrian-Czechoslovak grandmaster and influential chess thinker",
 "Siegbert Tarrasch":"German grandmaster and influential chess writer",
 "Frank Marshall":"American chess champion known for the famous Marshall swindle",
 "Harry Pillsbury":"American master who won the Hastings 1895 tournament",
 "Savielly Tartakower":"Polish-French grandmaster and chess writer",
 "Aron Nimzowitsch":"Latvian-Danish grandmaster and author of My System",
 "Paul Keres":"Estonian grandmaster often called the crown prince of chess",
 "Miguel Najdorf":"Polish-Argentine grandmaster and creator of the Najdorf Sicilian variation",
 "Bent Larsen":"Danish grandmaster and one of the strongest Western players of his era",
 "Rashid Nezhmetdinov":"Soviet master celebrated for imaginative attacking chess",
 "Vasily Ivanchuk":"Ukrainian grandmaster known for broad opening knowledge and creative play",
 "Alexander Grischuk":"Russian grandmaster and three-time World Blitz Champion"
};
const featuredPhotos={
 "Magnus Carlsen":"Magnus Carlsen 2023 portrait","Garry Kasparov":"Garry Kasparov portrait","Hikaru Nakamura":"Hikaru Nakamura chess grandmaster portrait","Alireza Firouzja":"Alireza Firouzja chess portrait","Mikhail Tal":"Mikhail Tal chess grandmaster portrait","Witty Alien":"Volen Dyulgerov Witty Alien chess","Rey Enigma":"Rey Enigma chess player","Levy Rozman":"Levy Rozman GothamChess portrait","Daniel Naroditsky":"Daniel Naroditsky chess portrait","Judit Polgar":"Judit Polgar chess portrait","Gukesh Dommaraju":"Gukesh D chess portrait"
};
let directory=[],visiblePlayers=[],searchOffset=0,selectedPlayer=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function makeQuickChips(){ $("quick-chips").innerHTML=quickNames.map(n=>`<button class="chip" data-name="${esc(n)}">${esc(n)}</button>`).join("");$("quick-chips").querySelectorAll("button").forEach(b=>b.onclick=()=>searchPlayers(b.dataset.name));}
function initials(n){return n.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function renderPlayers(items,title,subtitle){visiblePlayers=items;$("directory-title").textContent=title;$("directory-subtitle").textContent=subtitle;$("result-count").textContent=items.length+" profiles shown";$("player-grid").innerHTML=items.length?items.map((p,i)=>`<article class="player-card" data-id="${esc(p.id||"")}" data-name="${esc(p.name)}"><div class="player-photo"><img class="portrait-img" data-portrait-name="${esc(p.name)}" loading="lazy" alt="${esc(p.name)} portrait"><span class="photo-placeholder">${esc(initials(p.name))}</span></div><div class="player-card-body"><small>${esc(p.tag||"CHESS PROFILE")}</small><strong>${esc(p.name)}</strong><span>${esc(p.description||featuredInfo[p.name]||"Chess player · public profile")}</span><span class="card-open">Read full profile ↗</span></div></article>`).join(""):'<div class="loading-card">No matching players found. Try another spelling or search the public directory.</div>';$("player-grid").querySelectorAll(".player-card").forEach(card=>card.onclick=()=>openPlayer(card.dataset.id,card.dataset.name));hydratePlayerPortraits();}
function featuredList(){return featuredNames.filter((n,i)=>featuredNames.indexOf(n)===i).map(n=>({name:n,description:featuredInfo[n]||"Chess grandmaster, master or public chess personality",image:"",tag:"FEATURED"}))}
function wikidataSearch(q,limit=20){const url=`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&uselang=en&type=item&limit=${limit}&format=json&origin=*`;return fetchJSON(url,7000)}
async function searchPlayers(q){
 q=(q||$("player-search").value).trim();if(!q){renderPlayers(featuredList(),"Featured players","Choose a popular player or enter a name above.");return}
 $("player-search").value=q;$("player-grid").innerHTML='<div class="loading-card">Searching public chess records…</div>';$("directory-title").textContent="Search results";$("directory-subtitle").textContent="Searching public Wikidata records.";
 try{
  const lookup=searchAliases[q.toLowerCase()]||q;
  const data=await wikidataSearch(lookup,30);const results=(data.search||[]).filter(x=>/chess|grandmaster|international master|world champion|streamer|content creator|candidate master/i.test((x.description||"")+" "+x.label)||featuredNames.some(n=>n.toLowerCase()===x.label.toLowerCase()));
  const list=results.slice(0,20).map(x=>({id:x.id,name:x.label,description:x.description||"Public chess profile",tag:"WIKIDATA"}));
  const local=featuredList().filter(p=>(p.name+" "+p.description).toLowerCase().includes(lookup.toLowerCase())||p.name.toLowerCase()===lookup.toLowerCase());
  const indexed=directory.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).slice(0,12);
  [...indexed,...local].forEach(p=>{if(!list.some(x=>x.name.toLowerCase()===p.name.toLowerCase()))list.unshift(p)});
  renderPlayers(list,"Search results",`Found ${list.length} matching public profiles. Select a player to load their biography and records.`);
 }catch(e){
  const local=featuredList().filter(p=>(p.name+" "+p.description).toLowerCase().includes(q.toLowerCase()));
  renderPlayers(local,"Featured matches","Live public search could not be reached. Showing local featured matches instead.");
 }
}
$("search-player").onclick=()=>searchPlayers();$("player-search").addEventListener("keydown",e=>{if(e.key==="Enter")searchPlayers()});$("clear-search").onclick=()=>{$("player-search").value="";renderPlayers(featuredList(),"Featured players","Choose a popular player or enter a name above.")};
makeQuickChips();renderPlayers(featuredList(),"Featured players","Start with a popular name or search the public chess directory.");

const wdCache=new Map();
async function entityDetails(id){
 if(wdCache.has(id))return wdCache.get(id);
 const url=`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(id)}&props=labels|descriptions|aliases|claims&languages=${siteLanguage}|en&format=json&origin=*`;
 const data=await fetchJSON(url,7000);const e=data.entities?.[id];if(!e)throw Error("Player record unavailable");
 const claim=(prop)=>e.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
 const claimIds=prop=>(e.claims?.[prop]||[]).map(c=>c.mainsnak?.datavalue?.value?.id).filter(Boolean);
 const date=prop=>{const v=claim(prop);return v?.time?v.time.replace(/^\+/,"").split("T")[0]:"Not publicly recorded"};
 const p19=claim("P19")?.id||"";const p27=claim("P27")?.id||"";
 const image=claim("P18");const aliases=(e.aliases?.[siteLanguage]||e.aliases?.en||[]).map(a=>a.value).slice(0,8);
 const rec={id,name:e.labels?.[siteLanguage]?.value||e.labels?.en?.value||"Unknown",description:e.descriptions?.[siteLanguage]?.value||e.descriptions?.en?.value||"",birth:date("P569"),death:date("P570"),image:image?`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(image)}?width=900`:"",imageFile:image||"",aliases,birthplaceId:p19,nationalityId:p27,genderId:claim("P21")?.id||"",fatherIds:claimIds("P22"),motherIds:claimIds("P25"),childrenIds:claimIds("P40"),spouseIds:claimIds("P26")};
 wdCache.set(id,rec);return rec;
}
async function entityLabel(id){if(!id)return "Not publicly recorded";try{const x=await entityDetails(id);return x.name}catch{return "Not publicly recorded"}}
async function resolveEntityLabels(ids){const list=(ids||[]).filter(Boolean);if(!list.length)return [];try{const unique=[...new Set(list)];const u=`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${unique.join("|")}&props=labels&languages=${siteLanguage}|en&format=json&origin=*`;const d=await fetchJSON(u,7000);const map={};unique.forEach(id=>map[id]=d.entities?.[id]?.labels?.[siteLanguage]?.value||d.entities?.[id]?.labels?.en?.value||"Not publicly recorded");return list.map(id=>map[id]||"Not publicly recorded")}catch{return list.map(()=>"Not publicly recorded")}}
async function wikipediaFullBio(name,lang=siteLanguage){const code=["en","es","ru"].includes(lang)?lang:"en";const fetchBio=async c=>{const u=`https://${c}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=6500&titles=${encodeURIComponent(name)}&format=json&origin=*`;const d=await fetchJSON(u,8500);return Object.values(d.query?.pages||{})[0]?.extract||""};try{const localized=await fetchBio(code);return localized||(code!=="en"?await fetchBio("en"):"")}catch{return ""}}
async function commonsImage(name){try{const u=`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent("filetype:bitmap "+name)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=700&format=json&origin=*`;const d=await fetchJSON(u,7000);const page=Object.values(d.query?.pages||{})[0];return page?.imageinfo?.[0]?.thumburl||page?.imageinfo?.[0]?.url||""}catch{return ""}}

async function openPlayer(id,name){
 const requestedName=name;name=searchAliases[name.toLowerCase()]||name;selectedPlayer={id,name};$("player-article").classList.remove("hidden");$("player-grid").classList.add("hidden");$("directory-bar").classList.add("hidden");$("quick-chips").parentElement.classList.add("hidden");$("search-panel").classList.add("hidden");$("player-article").scrollIntoView({behavior:"smooth",block:"start"});
 $("article-name").textContent=name;$("article-bio").innerHTML="<p>Loading published biographical information…</p>";$("article-facts").innerHTML="";$("article-image").src="";$("article-image").alt=name;
 try{
  let rec=id?await entityDetails(id):null;
  let wiki=await wikipediaSummary(name,"en").catch(()=>null);
  if(siteLanguage!=="en"){const translatedWiki=await wikipediaSummary(name,siteLanguage).catch(()=>null);if(translatedWiki?.extract)wiki=translatedWiki}
  if(!rec&&wiki?.wikibase_item)rec=await entityDetails(wiki.wikibase_item);
  const canonical=rec?.name||wiki?.title||name;const known=nicknames[canonical]||nicknames[name]||"No widely documented nickname found";
  const fullExtract=await wikipediaFullBio(canonical,siteLanguage);
  $("article-name").textContent=canonical;
  $("article-description").textContent=wiki?.description||rec?.description||featuredInfo[name]||"Chess player and public chess personality.";
  const image=wiki?.thumbnail?.source||rec?.image||await commonsImage(name);
  if(image){$("article-image").onerror=async()=>{const fallback=await commonsImage(canonical);if(fallback&&$("article-image").src!==fallback)$("article-image").src=fallback;else{$("article-image").style.display="none";$("image-credit").textContent="No accessible public portrait found. See the Wikimedia image search below."}};$("article-image").style.display="block";$("article-image").src=image;$("article-image").alt=canonical;$("image-credit").textContent="Portrait supplied by Wikipedia / Wikimedia Commons. Check the source page for reuse terms.";}else{$("article-image").style.display="none";$("article-image").alt="No public portrait found";$("image-credit").textContent="No verified public portrait found for this profile";}
  const place=rec?.birthplaceId?await entityLabel(rec.birthplaceId):"Not publicly recorded";const country=rec?.nationalityId?await entityLabel(rec.nationalityId):"Not publicly recorded";
  const aliasList=[...(rec?.aliases||[])];if(requestedName.toLowerCase()!==canonical.toLowerCase()&&!aliasList.some(a=>a.toLowerCase()===requestedName.toLowerCase()))aliasList.unshift(requestedName);const aliases=aliasList.length?aliasList.join(", "):"No alternate names recorded";
  const birth=rec?.birth||"Not publicly recorded";const death=rec?.death||"Not publicly recorded";const ageAtRecord=(()=>{if(!birth||birth==="Not publicly recorded")return "Not publicly recorded";const b=new Date(birth+"T00:00:00Z");if(Number.isNaN(b.getTime()))return "Not publicly recorded";const end=death!=="Not publicly recorded"?new Date(death+"T00:00:00Z"):new Date();let a=end.getUTCFullYear()-b.getUTCFullYear();if(end.getUTCMonth()<b.getUTCMonth()||(end.getUTCMonth()===b.getUTCMonth()&&end.getUTCDate()<b.getUTCDate()))a--;return a+ (death!=="Not publicly recorded"?" at death":" years old")})();
  $("article-kicker").textContent=featuredInfo[name]?"FEATURED CHESS PERSONALITY":"PUBLIC PLAYER RECORD";
  $("article-badges").innerHTML=`<span>${esc(rec?.description||"Chess profile")}</span><span>${esc(known)}</span>`;
  const extract=fullExtract||wiki?.extract||"A detailed Wikipedia biography was not available for this exact name. The public record below contains the information currently indexed by Wikidata. Use the source links to review and expand the profile.";
  const paragraphs=extract.split(/\n{2,}|(?<=[.!?])\s+/).filter(Boolean);
  $("article-bio").innerHTML=paragraphs.map(p=>`<p>${esc(p)}</p>`).join("")+`<p><strong>Known as:</strong> ${esc(known)}. The nickname is shown only where a commonly documented public nickname is known; otherwise it is not inferred.</p><p><strong>Also known as:</strong> ${esc(aliases)}.</p>`;
  const gender=rec?.genderId?await resolveEntityLabels([rec.genderId]):[];
  const familyIds=[...(rec?.fatherIds||[]),...(rec?.motherIds||[]),...(rec?.childrenIds||[]),...(rec?.spouseIds||[])];
  const familyLabels=await resolveEntityLabels(familyIds);
  const familyNameMap={};familyIds.forEach((id,i)=>familyNameMap[id]=familyLabels[i]||"");
  const parents=[...(rec?.fatherIds||[]).map(id=>familyNameMap[id]),...(rec?.motherIds||[]).map(id=>familyNameMap[id])].filter(Boolean).join(", ")||"Not publicly recorded";
  const children=(rec?.childrenIds||[]).map(id=>familyNameMap[id]).filter(Boolean).join(", ")||"Not publicly recorded";
  const spouses=(rec?.spouseIds||[]).map(id=>familyNameMap[id]).filter(Boolean).join(", ")||"Not publicly recorded";
  const facts=[["Name on public record",canonical],["Real / full name",canonical==="Rey Enigma"?"Not publicly disclosed in a reliable source.":canonical],["Nickname",known],["Date of birth",birth],["Age",ageAtRecord],["Date of death",death],["Gender",gender[0]||"Not publicly recorded"],["Place of birth",place],["Nationality",country],["Parents",parents],["Children",children],["Spouse / partner",spouses],["Other recorded names",aliases],["Chess profile description",rec?.description||wiki?.description||"Not publicly recorded"]];
  $("article-facts").innerHTML=facts.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
  const qid=rec?.id||wiki?.wikibase_item||"";
  const wikiUrl=`https://${siteLanguage}.wikipedia.org/wiki/${encodeURIComponent(canonical.replace(/ /g,"_"))}`;const mediaUrl=rec?.imageFile?`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(rec.imageFile.replace(/ /g,"_"))}`:`https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(canonical)}`;
  $("article-sources").innerHTML=`Sources: <a href="${esc(wiki?.content_urls?.desktop?.page||wikiUrl)}" target="_blank" rel="noopener">Wikipedia (${siteLanguage.toUpperCase()})</a> · ${qid?`<a href="https://www.wikidata.org/wiki/${esc(qid)}" target="_blank" rel="noopener">Wikidata record</a> · `:""}<a href="${esc(mediaUrl)}" target="_blank" rel="noopener">${rec?.imageFile?"Portrait file and licence":"Wikimedia image search"}</a>`;
 }catch(err){$("article-bio").innerHTML=`<p>Could not load this profile from public knowledge sources right now. Check your internet connection and try again.</p><p>Featured summary: ${esc(featuredInfo[name]||"Public chess player or creator profile.")}</p>`;$("article-facts").innerHTML=`<dt>Name</dt><dd>${esc(name)}</dd><dt>Nickname</dt><dd>${esc(nicknames[name]||"Not verified")}</dd>`}
}
$("close-article").onclick=()=>{$("player-article").classList.add("hidden");$("player-grid").classList.remove("hidden");$("directory-bar").classList.remove("hidden");$("quick-chips").parentElement.classList.remove("hidden");$("search-panel").classList.remove("hidden");$("players").scrollIntoView({behavior:"smooth"})};

// Fetch a broad live directory using multiple Wikidata search facets, then keep searches local.
let directoryLoaded=false;
async function fetchWikipediaCategory(category,cap=500){
 const pages=[];let continuation="";
 while(pages.length<cap){
  const params=new URLSearchParams({action:"query",list:"categorymembers",cmtitle:"Category:"+category,cmlimit:"500",cmtype:"page",format:"json",origin:"*"});
  if(continuation)params.set("cmcontinue",continuation);
  const data=await fetchJSON("https://en.wikipedia.org/w/api.php?"+params.toString(),8000);
  const batch=data.query?.categorymembers||[];pages.push(...batch);continuation=data.continue?.cmcontinue||"";
  if(!continuation||!batch.length)break;
 }
 return pages.slice(0,cap).map(x=>({id:"",name:x.title,description:"Chess player · Wikipedia public category",tag:"WIKIPEDIA"}));
}
$("load-directory").onclick=async()=>{
 if(directoryLoaded){renderPlayers(directory.slice(0,48),"Chess player directory",`${directory.length} public player pages loaded. Search within the index above.`);return}
 $("load-directory").disabled=true;$("load-directory").textContent="Loading 500+ players…";$("player-grid").innerHTML='<div class="loading-card">Loading public chess-player categories from Wikipedia. This can take a little while…</div>';
 try{
  const categories=["Chess_players","Chess_grandmasters","Women_chess_players","Chess_world_champions"];
  const batches=await Promise.all(categories.map(c=>fetchWikipediaCategory(c,500).catch(()=>[])));
  const unique=new Map();batches.flat().forEach(p=>{const key=p.name.toLowerCase();if(!unique.has(key))unique.set(key,p)});
  directory=[...unique.values()];
  if(directory.length<100){
   const terms=["chess grandmaster","chess player","chess world champion","women chess grandmaster","chess international master","chess champion","chess streamer","chess prodigy","chess commentator","chess content creator","chess master","women chess player","chess coach","chess author","chess historian","chess problemist","correspondence chess player","chess olympiad","candidate master chess","FIDE master chess","chess YouTuber","chess influencer"];
   const found=new Map(directory.map(p=>[p.name.toLowerCase(),p]));
   const extra=await Promise.all(terms.map(t=>wikidataSearch(t,50).catch(()=>({search:[]}))));
   extra.flatMap(d=>d.search||[]).forEach(x=>{if(!found.has(x.label.toLowerCase()))found.set(x.label.toLowerCase(),{id:x.id,name:x.label,description:x.description||"Chess player · public Wikidata record",tag:"WIKIDATA"})});
   directory=[...found.values()];
  }
  directoryLoaded=true;$("load-directory").disabled=false;$("load-directory").textContent="Player index loaded ↻";
  renderPlayers(directory.slice(0,48),"Chess player directory",`${directory.length} unique public player records collected from Wikipedia categories and Wikidata. Public coverage varies.`);
  $("more-results").classList.toggle("hidden",directory.length<=48);
 }catch(e){$("player-grid").innerHTML='<div class="loading-card">The public directory could not be loaded. Try searching a player by name instead.</div>';$("load-directory").disabled=false;$("load-directory").textContent="Try loading again"}
};
$("more-results").onclick=()=>{const shown=visiblePlayers.length;renderPlayers(directory.slice(0,shown+48),"Chess player directory",`${directory.length} unique public profiles collected from Wikidata search.`);$("more-results").classList.toggle("hidden",visiblePlayers.length>=directory.length)};

// Famous games and replayable PGNs.
const games=[
 {id:"tal",title:"The Magician's Knight Sacrifice",white:"Mikhail Botvinnik",black:"Mikhail Tal",event:"World Championship Match · Moscow · 26 March 1960",result:"0–1",opening:"King's Indian Defence",tag:"CHESS HISTORY",storyTitle:"21…Nf4!! — Tal's famous sacrifice",story:"In game six of the 1960 world championship match, Tal offered a knight with 21...Nf4. The move created complications and helped turn the match in his favour. Tal went on to win the match and become world champion. Replay the full recorded score below.",source:"ChessBase / Lichess study record",url:"https://lichess.org/study/KJ5Vxrwu/Vzdn8jU5",pgn:`[Event "World Championship Match"]
[Site "Moscow, USSR"]
[Date "1960.03.26"]
[Round "6"]
[White "Mikhail Botvinnik"]
[Black "Mikhail Tal"]
[Result "0-1"]
[Opening "King's Indian Defence"]

1. c4 Nf6 2. Nf3 g6 3. g3 Bg7 4. Bg2 O-O 5. d4 d6 6. Nc3 Nbd7
7. O-O e5 8. e4 c6 9. h3 Qb6 10. d5 cxd5 11. cxd5 Nc5 12. Ne1 Bd7
13. Nd3 Nxd3 14. Qxd3 Rfc8 15. Rb1 Nh5 16. Be3 Qb4 17. Qe2 Rc4
18. Rfc1 Rac8 19. Kh2 f5 20. exf5 Bxf5 21. Ra1 Nf4 22. gxf4 exf4
23. Bd2 Qxb2 24. Rab1 f3 25. Rxb2 fxe2 26. Rb3 Rd4 27. Be1 Be5+
28. Kg1 Bf4 29. Nxe2 Rxc1 30. Nxd4 Rxe1+ 31. Bf1 Be4 32. Ne2 Be5
33. f4 Bf6 34. Rxb7 Bxd5 35. Rc7 Bxa2 36. Rxa7 Bc4 37. Ra8+ Kf7
38. Ra7+ Ke6 39. Ra3 d5 40. Kf2 Bh4+ 41. Kg2 Kd6 42. Ng3 Bxg3
43. Bxc4 dxc4 44. Kxg3 Kd5 45. Ra7 c3 46. Rc7 Kd4 0-1`},
 {id:"witty",title:"Witty Alien beats Magnus Carlsen",white:"Magnus Carlsen",black:"Volen Dyulgerov (Witty Alien)",event:"Chess Club Showdown · Chess.com · 30 September 2026",result:"0–1",opening:"Center Game",tag:"2026 BLITZ UPSET",storyTitle:"20.Rde1?? — the decisive mistake",story:"Carlsen was an exchange up and winning, but 20.Rde1?? moved the rook away from the d-file and left d5 undefended. Dyulgerov found the forcing sequence 20...Rb1+ 21.Kd2 Qd5+, after which Carlsen resigned. The full 21-move score is now included, so the replay shows the actual game rather than a hypothetical continuation.",source:"Chess Trap Guide · Full score and engine-checked notes",url:"https://chesstrapguide.com/learn/witty-alien-beats-magnus-carlsen-2026/",pgn:`[Event "Chess Club Showdown"]
[Site "Chess.com"]
[Date "2026.09.30"]
[White "Magnus Carlsen"]
[Black "Volen Dyulgerov (Witty Alien)"]
[Result "0-1"]
[WhiteElo "3396"]
[BlackElo "2612"]
[Opening "Center Game"]
[TimeControl "300"]

1. e4 e5 2. Nc3 Nf6 3. d4 exd4 4. Qxd4 Nc6 5. Qe3 Bb4 6. Bd2 O-O 7. O-O-O Re8 8. Qf4 Bxc3 9. Bxc3 Nxe4 10. Bc4 Nxc3 11. Bxf7+ Kh8 12. Bxe8 Qxe8 13. bxc3 Ne5 14. Nf3 Nxf3 15. Qxf3 d6 16. Rhe1 Qg8 17. Re7 Be6 18. Qxb7 Rb8 19. Qxc7 Bxa2 20. Rde1 Rb1+ 21. Kd2 Qd5+ 0-1`},
 {id:"fischer",title:"The Game of the Century",white:"Donald Byrne",black:"Bobby Fischer",event:"Rosenwald Memorial · New York · 17 October 1956",result:"0–1",opening:"Grünfeld Defence",tag:"THE GAME OF THE CENTURY",storyTitle:"A 13-year-old Fischer's masterpiece",story:"Bobby Fischer's celebrated win features a remarkable queen sacrifice, coordinated minor pieces and a mating attack. The complete score is embedded for move-by-move replay.",source:"Chessgames.com · annotated game reference",url:"https://www.chessgames.com/perl/nph-pgn?gid=1008361",pgn:`[Event "Rosenwald Memorial"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[Result "0-1"]
[Opening "Grunfeld Defense"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1` },
 {id:"immortal",title:"The Immortal Game",white:"Adolf Anderssen",black:"Lionel Kieseritzky",event:"Casual game · London · 1851",result:"1–0",opening:"King's Gambit",tag:"ROMANTIC ERA CLASSIC",storyTitle:"A queen sacrifice and a minor-piece checkmate",story:"Adolf Anderssen's celebrated 1851 game is remembered for extraordinary material sacrifices. White gives up both rooks, a bishop and the queen, yet finishes with a checkmate delivered by the remaining minor pieces. It remains one of the best-known examples of the attacking style of the Romantic era.",source:"Wikibooks · Chess/Famous Games",url:"https://en.wikibooks.org/wiki/Chess/Famous_Games",pgn:`[Event "Casual game"]
[Site "London"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`},
 {id:"opera",title:"The Opera Game",white:"Paul Morphy",black:"Duke of Brunswick & Count Isouard",event:"Paris Opera · Paris · 1858",result:"1–0",opening:"Philidor Defence",tag:"A MODEL OF DEVELOPMENT",storyTitle:"Morphy's rapid development wins the day",story:"Paul Morphy played this famous consultation game at the Paris Opera against the Duke of Brunswick and Count Isouard. Morphy developed quickly, opened lines and used a queen sacrifice to finish with a rook checkmate on move 17. The game is a classic lesson in development and coordination.",source:"Wikibooks · Chess/Famous Games",url:"https://en.wikibooks.org/wiki/Chess/Famous_Games",pgn:`[Event "Casual game"]
[Site "Paris Opera"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke of Brunswick and Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`},
 {id:"kasparov-topalov",title:"Kasparov's Immortal",white:"Garry Kasparov",black:"Veselin Topalov",event:"Hoogovens Tournament · Wijk aan Zee · 20 January 1999",result:"1–0",opening:"Pirc Defence",tag:"MODERN MASTERPIECE",storyTitle:"A rook sacrifice launches a king hunt",story:"Garry Kasparov's victory over Veselin Topalov is widely known as Kasparov's Immortal. A rook sacrifice on move 24 sets off a remarkable king hunt across the board. The game is admired for its calculation, attacking coordination and the way the initiative is maintained through a long tactical sequence.",source:"The Chess Journalist · published PGN score",url:"https://www.chessjournalism.org/wp-content/uploads/2023/04/151-TCJ-XLIX.pdf",pgn:`[Event "Hoogovens Group A"]
[Site "Wijk aan Zee"]
[Date "1999.01.20"]
[Round "4"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0`}
];
function renderGameCards(){$("game-cards").innerHTML=games.map(g=>`<article class="game-card"><p class="eyebrow">${esc(g.tag)}</p><h3>${esc(g.title)}</h3><p>${esc(g.story)}</p><div class="game-meta">${esc(g.event)} · ${esc(g.result)}</div><button class="button button-gold" data-game="${g.id}">${g.fragment?"View game story & moves":"Display the game"} →</button></article>`).join("");$("game-cards").querySelectorAll("button").forEach(b=>b.onclick=()=>openGame(b.dataset.game))}
renderGameCards();
let replayGame=null,replayChess=null,replayPly=0,replayMoves=[];
function openGame(id){replayGame=games.find(g=>g.id===id);$("game-viewer").classList.remove("hidden");$("viewer-title").textContent=replayGame.title;$("viewer-meta").textContent=replayGame.event+" · "+replayGame.result;$("replay-white").textContent=replayGame.white;$("replay-black").textContent=replayGame.black;$("game-story-title").textContent=replayGame.storyTitle;$("game-story").textContent=replayGame.story;$("game-source").innerHTML=`Source: <a href="${esc(replayGame.url)}" target="_blank" rel="noopener">${esc(replayGame.source)}</a>`;
 replayChess=new Chess();replayPly=0;replayMoves=[];
 if(replayGame.pgn){try{replayChess.load_pgn(replayGame.pgn);replayMoves=replayChess.history({verbose:true});replayChess.reset()}catch(e){replayMoves=[]}}
 if(replayGame.fragment){$("replay-board").innerHTML='<div class="fragment-note">The published source only provides the tactical sequence, not the complete PGN or the exact position before move 20. The moves are displayed below as a documented score fragment. A full board replay is not fabricated.</div>';replayMoves=[];$("replay-moves").innerHTML=replayGame.moves.map((m,i)=>`<span class="move-token">${esc(m)}</span>`).join("");$("replay-index").textContent="Published fragment";["replay-start","replay-prev","replay-next","replay-end"].forEach(id=>$(id).disabled=true)}
 else {["replay-start","replay-prev","replay-next","replay-end"].forEach(id=>$(id).disabled=false);$("replay-moves").innerHTML="";renderReplay()}
 $("game-viewer").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderReplay(){if(!replayGame||replayGame.fragment)return;const temp=new Chess();for(let i=0;i<replayPly;i++)temp.move(replayMoves[i]);const board=temp.board();$("replay-board").innerHTML="";const glyph={wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};for(let r=0;r<8;r++)for(let c=0;c<8;c++){const sq=files[c]+(8-r),p=board[r][c],el=document.createElement("div");el.className="replay-square "+((r+c)%2===0?"light":"dark");el.textContent=p?glyph[p.color+p.type]:"";$("replay-board").appendChild(el)}
 $("replay-index").textContent=replayPly===0?"Starting position":`Ply ${replayPly} / ${replayMoves.length}`;$("replay-moves").innerHTML=replayMoves.map((m,i)=>`<button class="move-token ${i===replayPly-1?"active":""}" data-ply="${i+1}">${Math.floor(i/2)+1}${i%2?"…":"."} ${esc(m.san)}</button>`).join("");$("replay-moves").querySelectorAll("button").forEach(b=>b.onclick=()=>{replayPly=Number(b.dataset.ply);renderReplay()})}
$("replay-start").onclick=()=>{replayPly=0;renderReplay()};$("replay-prev").onclick=()=>{replayPly=Math.max(0,replayPly-1);renderReplay()};$("replay-next").onclick=()=>{replayPly=Math.min(replayMoves.length,replayPly+1);renderReplay()};$("replay-end").onclick=()=>{replayPly=replayMoves.length;renderReplay()};$("close-game").onclick=()=>{$("game-viewer").classList.add("hidden");$("games").scrollIntoView({behavior:"smooth"})};

// Stockfish worker UCI interface.
let engine=null,engineReady=false,engineBusy=false,engineQueue=[],engineMode="lite",pendingFen=null,engineInitPromise=null,maxStrength=false;
let gameMode="engine";
const stockfishBase="https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/";
const stockfishUrls={lite:stockfishBase+"stockfish-19-lite-single.js"};
let engineWorkerUrl=null;
function makeEngineWorker(mode){
 const scriptUrl=stockfishUrls[mode];
 const source=`const base=${JSON.stringify(stockfishBase)};self.Module=self.Module||{};self.Module.locateFile=(path)=>new URL(path,base).href;importScripts(${JSON.stringify(scriptUrl)});`;
 const blob=new Blob([source],{type:"text/javascript"});const url=URL.createObjectURL(blob);engineWorkerUrl=url;return new Worker(url);
}
function engineMessage(line){
 if(line==="uciok"){engine.postMessage("setoption name Threads value 1");engine.postMessage("setoption name Hash value 32");engine.postMessage("isready")}
 if(line==="readyok"){engineReady=true;$("engine-state").textContent="Lite engine ready";$("game-status").textContent="Stockfish ready. Your move.";if(pendingFen){const fen=pendingFen;pendingFen=null;requestEngineMove(fen)}}
 if(line.startsWith("bestmove")){engineBusy=false;const uci=line.split(/\s+/)[1];if(uci&&uci!=="(none)"&&gameMode==="engine"&&game.turn()==="b"&&!game.game_over()){const move=game.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||"q"});if(move){lastMove={from:move.from,to:move.to};const ply=game.history().length;if(ply%2===0&&moveLog.length)moveLog[moveLog.length-1].black=move.san;selected=null;legalTargets=[];renderBoard()}}}
}
function initEngine(mode=engineMode){
 if(engine&&engineReady&&engineMode===mode)return Promise.resolve(true);
 if(engineInitPromise&&engineMode===mode)return engineInitPromise;
 if(engine){try{engine.terminate()}catch{}engine=null;engineReady=false}
 if(engineWorkerUrl){try{URL.revokeObjectURL(engineWorkerUrl)}catch{}engineWorkerUrl=null}
 engineMode=mode;engineReady=false;
 $("engine-state").textContent="Starting lightweight Stockfish…";
 $("game-status").textContent="Starting chess engine…";
 engineInitPromise=new Promise((resolve,reject)=>{
  let settled=false;let timeoutId;
  const finish=(ok,error)=>{if(settled)return;settled=true;clearTimeout(timeoutId);engineInitPromise=null;if(ok)resolve(true);else reject(error||Error("Engine could not start"))};
  try{
   engine=makeEngineWorker(mode);
   engine.onmessage=e=>{const line=String(e.data);engineMessage(line);if(line==="readyok")finish(true)};
   engine.onerror=e=>{engineReady=false;finish(false,Error("Stockfish could not start. Check the connection, then press New game to retry."))};
   engine.postMessage("uci");
   timeoutId=setTimeout(()=>finish(false,Error("Stockfish took too long to start. Check your connection, then press New game to retry.")),16000);
  }catch(e){finish(false,e)}
 });
 engineInitPromise.catch(e=>{$("engine-state").textContent="Engine unavailable · retry from New game";$("game-status").textContent=e.message;engineInitPromise=null});
 return engineInitPromise;
}
function setStrength(){if(!engine||!engineReady)return;const elo=Number($("engine-elo").value);if(maxStrength){engine.postMessage("setoption name UCI_LimitStrength value false");engine.postMessage("setoption name Skill Level value 20");$("elo-output").textContent="MAX";$("engine-help").textContent="No strength limit. Stockfish will search at its strongest available setting."}else{engine.postMessage("setoption name UCI_LimitStrength value true");engine.postMessage(`setoption name UCI_Elo value ${elo}`);$("elo-output").textContent=elo;$("engine-help").textContent=`Stockfish will aim for approximately ${elo} Elo. This is an approximate target, not a guaranteed rating.`}}
function requestEngineMove(fen){if(!engineReady){pendingFen=fen;initEngine(engineMode).then(()=>{if(pendingFen){const f=pendingFen;pendingFen=null;requestEngineMove(f)}}).catch(()=>{});return}if(engineBusy)return;engineBusy=true;setStrength();engine.postMessage("position fen "+fen);const elo=Number($("engine-elo").value);const movetime=elo===0?1100:Math.min(850,180+Math.round((elo-1320)*0.35));engine.postMessage(`go movetime ${movetime}`);$("game-status").textContent="Stockfish is calculating…"}
$("engine-elo").oninput=()=>{maxStrength=false;$("elo-output").textContent=$("engine-elo").value;setStrength()};
document.querySelectorAll(".elo-presets button").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.elo);if(n===0){maxStrength=true;$("engine-elo").value=3190;$("elo-output").textContent="MAX";$("engine-help").textContent="No strength limit. Stockfish will search at its strongest available setting."}else{maxStrength=false;$("engine-elo").value=n;$("elo-output").textContent=n;$("engine-help").textContent=`Stockfish will aim for approximately ${n} Elo.`}setStrength()});
const game=new Chess(),boardEl=$("chess-board");let selected=null,legalTargets=[],lastMove=null,flipped=false,moveLog=[];
const files="abcdefgh",glyph={wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};
function boardCoords(){$("rank-labels").innerHTML=[...Array(8).keys()].map(i=>`<span>${flipped?i+1:8-i}</span>`).join("");$("file-labels").innerHTML=(flipped?[...files].reverse():[...files]).map(f=>`<span>${f}</span>`).join("")}
function renderBoard(){boardEl.innerHTML="";boardCoords();const rows=flipped?[...Array(8).keys()].reverse():[...Array(8).keys()];rows.forEach(r=>{const cols=flipped?[...Array(8).keys()].reverse():[...Array(8).keys()];cols.forEach(c=>{const sq=files[c]+(8-r),p=game.get(sq),btn=document.createElement("button");btn.className="square "+((r+c)%2===0?"light":"dark");btn.setAttribute("aria-label",sq+(p?` ${p.color==="w"?"white":"black"} ${p.type}`:" empty"));if(selected===sq)btn.classList.add("selected");if(lastMove&&(lastMove.from===sq||lastMove.to===sq))btn.classList.add("last-move");const target=legalTargets.find(m=>m.to===sq);if(target){btn.classList.add("legal");if(p)btn.classList.add("capture")}if(p)btn.innerHTML=`<span class="piece-${p.color==="w"?"white":"black"}">${glyph[p.color+p.type]}</span>`;btn.onclick=()=>onSquare(sq);boardEl.appendChild(btn)})});updateGameStatus();renderMoveHistory()}
function updateGameStatus(){let text;if(game.in_checkmate())text="Checkmate. "+(game.turn()==="w"?"Black":"White")+" wins.";else if(game.in_draw())text="Game drawn.";else if(game.in_check())text=(game.turn()==="w"?"White":"Black")+" is in check.";else text=game.turn()==="w"?"Your move. Choose a piece.":"Stockfish to move.";if(gameMode==="self"&&!game.game_over())text=(game.turn()==="w"?"White":"Black")+" to move. Choose a piece.";else if(!engineReady&&gameMode==="engine"&&!game.game_over())text="Stockfish is loading. If startup fails, press New game to retry.";$("game-status").textContent=text;$("turn-label").textContent=game.turn()==="w"?"WHITE TO MOVE":"BLACK TO MOVE"}
function renderMoveHistory(){const hist=game.history();moveLog=[];for(let i=0;i<hist.length;i+=2)moveLog.push({white:hist[i]||"",black:hist[i+1]||""});$("move-count").textContent=hist.length+" PLY";$("move-history").innerHTML=moveLog.length?moveLog.map((m,i)=>`<div class="move-row"><span class="move-no">${i+1}.</span><span>${m.white}</span><span>${m.black}</span></div>`).join(""):'<p class="empty-history">Your moves will appear here.</p>'}
function onSquare(sq){if(game.game_over()||(gameMode==="engine"&&(game.turn()!=="w"||engineBusy)))return;const p=game.get(sq);if(selected&&legalTargets.some(m=>m.to===sq)){playHuman(selected,sq);return}if(p&&p.color===game.turn()){selected=sq;legalTargets=game.moves({square:sq,verbose:true});renderBoard();return}selected=null;legalTargets=[];renderBoard()}
function playHuman(from,to){const move=game.move({from,to,promotion:"q"});if(!move)return;lastMove={from,to};selected=null;legalTargets=[];renderBoard();if(!game.game_over()&&gameMode==="engine")requestEngineMove(game.fen())}
$("new-game").onclick=()=>{game.reset();selected=null;legalTargets=[];lastMove=null;engineBusy=false;pendingFen=null;if(engine)engine.postMessage("stop");renderBoard();if(gameMode==="engine"&&!engineReady)initEngine("lite").then(setStrength).catch(()=>{})};
$("undo-move").onclick=()=>{if(engineBusy&&engine){engine.postMessage("stop");engineBusy=false}if(game.history().length){game.undo();if(gameMode==="engine"&&game.turn()==="b")game.undo();const h=game.history({verbose:true});lastMove=h.length?{from:h[h.length-1].from,to:h[h.length-1].to}:null;selected=null;legalTargets=[];renderBoard()}};
$("flip-board").onclick=()=>{flipped=!flipped;renderBoard()};
renderBoard();initEngine("lite").then(()=>setStrength()).catch(()=>{});
$("game-mode").onchange=()=>{gameMode=$("game-mode").value;const isSelf=gameMode==="self";if(engine&&engineBusy){engine.postMessage("stop");engineBusy=false}pendingFen=null;game.reset();lastMove=null;selected=null;legalTargets=[];$("opponent-title").textContent=isSelf?"Two players":"Stockfish";$("engine-state").textContent=isSelf?"Play both sides on this device":(engineReady?"Lite engine ready":"Loading optimized engine…");$("engine-elo").disabled=isSelf;document.querySelectorAll(".elo-presets button").forEach(b=>b.disabled=isSelf);renderBoard();if(!isSelf&&!engineReady)initEngine("lite").then(setStrength).catch(()=>{})};

// Saved appearance, language and original background music.
const localeText={
 en:{players:"Players",games:"Great games",learn:"Learn & Play",hubTitle:"Learn & play chess.",hubIntro:"A separate chess room for beginners and improving players. Study the rules, understand checkmate and tactics, then practise against Stockfish or play both sides on one board.",lessonsTitle:"Build your foundation.",lessonsIntro:"Every lesson includes a clear explanation and a small board illustration. Work through the topics in order, then test the ideas in a game.",play:"Play Chess",learnChess:"Learn Chess",goal:"How to play chess",movement:"How each piece moves",mate:"How to find checkmate",tactics:"Spot the common patterns",opening:"Play a stronger opening"},
 es:{players:"Jugadores",games:"Grandes partidas",learn:"Aprender y jugar",hubTitle:"Aprende y juega ajedrez.",hubIntro:"Una sala de ajedrez para principiantes y jugadores que quieren mejorar. Estudia las reglas, comprende el jaque mate y las tácticas, y practica contra Stockfish o juega con ambos bandos en el mismo tablero.",lessonsTitle:"Construye tus fundamentos.",lessonsIntro:"Cada lección incluye una explicación clara y un pequeño diagrama. Estudia los temas en orden y luego practica las ideas en una partida.",play:"Jugar ajedrez",learnChess:"Aprender ajedrez",goal:"Cómo jugar ajedrez",movement:"Cómo se mueve cada pieza",mate:"Cómo encontrar jaque mate",tactics:"Reconoce los patrones tácticos",opening:"Juega una mejor apertura"},
 ru:{players:"Игроки",games:"Знаменитые партии",learn:"Учиться и играть",hubTitle:"Учись и играй в шахматы.",hubIntro:"Шахматный раздел для начинающих и тех, кто хочет улучшить игру. Изучи правила, мат и тактику, затем играй против Stockfish или за обе стороны на одной доске.",lessonsTitle:"Освой основы.",lessonsIntro:"Каждый урок содержит понятное объяснение и небольшую схему. Изучай темы по порядку, а затем применяй идеи в партии.",play:"Играть в шахматы",learnChess:"Учиться шахматам",goal:"Как играть в шахматы",movement:"Как ходят фигуры",mate:"Как найти мат",tactics:"Изучи тактические мотивы",opening:"Играй дебют сильнее"}
};
function applyLanguage(lang){
 siteLanguage=["en","es","ru"].includes(lang)?lang:"en";localStorage.setItem("ca-language",siteLanguage);document.documentElement.lang=siteLanguage;
 const t=localeText[siteLanguage];
 document.querySelector('nav a[href="#players"]').textContent=t.players;
 document.querySelector('nav a[href="#games"]').textContent=t.games;
 document.querySelector('nav a[href="#learn-play"]').textContent=t.learn;
 $("learn-hub-title").textContent=t.hubTitle;$("learn-hub-intro").textContent=t.hubIntro;
 $("lessons-title").textContent=t.lessonsTitle;$("lessons-intro").textContent=t.lessonsIntro;
 const titleEls=document.querySelectorAll(".lesson-card h3");[t.goal,t.movement,t.mate,t.tactics,t.opening].forEach((v,i)=>{if(titleEls[i])titleEls[i].textContent=v});
 $("game-mode").options[0].textContent=siteLanguage==="es"?"Jugar contra Stockfish":siteLanguage==="ru"?"Игра против Stockfish":"Play vs Stockfish";
 $("game-mode").options[1].textContent=siteLanguage==="es"?"Dos jugadores · mismo dispositivo":siteLanguage==="ru"?"Два игрока · одно устройство":"Two players · same device";
}
const soundtracks={"quiet-piano":"Quiet Piano","moonlit-study":"Moonlit Study","forest-focus":"Forest Focus","velvet-endgame":"Velvet Endgame","royal-ambient":"Royal Ambient"};
const backgroundMusic=new Audio();backgroundMusic.loop=true;backgroundMusic.preload="none";backgroundMusic.volume=.28;
function storeSetting(key,value){try{localStorage.setItem("ca-"+key,value)}catch{}}
function applyTheme(value){document.body.classList.remove("theme-midnight","theme-parchment");if(value!=="dark")document.body.classList.add("theme-"+value);storeSetting("theme",value)}
function applyBoardStyle(value){document.body.classList.remove("board-blue","board-wood","board-slate");if(value!=="classic")document.body.classList.add("board-"+value);storeSetting("board-style",value)}
function applyPieceStyle(value){document.body.classList.toggle("pieces-outlined",value==="outlined");storeSetting("piece-style",value)}
function chooseMusic(value){const track=soundtracks[value]?value:"quiet-piano";backgroundMusic.src=`assets/audio/${track}.ogg`;storeSetting("music-track",track);if(!backgroundMusic.paused)backgroundMusic.play().catch(()=>{})}
function openSettings(){$("settings-modal").classList.remove("hidden")}
function closeSettings(){$("settings-modal").classList.add("hidden")}
$("open-settings").onclick=openSettings;$("close-settings").onclick=closeSettings;
$("settings-modal").onclick=e=>{if(e.target===$("settings-modal"))closeSettings()};
$("site-language").value=siteLanguage;applyLanguage(siteLanguage);
$("site-language").onchange=()=>{wdCache.clear();applyLanguage($("site-language").value);if(selectedPlayer)openPlayer(selectedPlayer.id,selectedPlayer.name)};
const savedTheme=localStorage.getItem("ca-theme")||"dark",savedBoard=localStorage.getItem("ca-board-style")||"classic",savedPieces=localStorage.getItem("ca-piece-style")||"classic",savedTrack=localStorage.getItem("ca-music-track")||"quiet-piano";
$("site-theme").value=savedTheme;$("board-style").value=savedBoard;$("piece-style").value=savedPieces;$("music-track").value=soundtracks[savedTrack]?savedTrack:"quiet-piano";
applyTheme(savedTheme);applyBoardStyle(savedBoard);applyPieceStyle(savedPieces);chooseMusic(savedTrack);
$("site-theme").onchange=()=>applyTheme($("site-theme").value);
$("board-style").onchange=()=>applyBoardStyle($("board-style").value);
$("piece-style").onchange=()=>applyPieceStyle($("piece-style").value);
$("music-track").onchange=()=>chooseMusic($("music-track").value);
$("music-volume").oninput=()=>{backgroundMusic.volume=Number($("music-volume").value)/100;storeSetting("music-volume",$("music-volume").value)};
$("music-volume").value=localStorage.getItem("ca-music-volume")||"28";backgroundMusic.volume=Number($("music-volume").value)/100;
$("music-toggle").onclick=async()=>{if(backgroundMusic.paused){try{await backgroundMusic.play();$("music-toggle").textContent="Pause music"}catch{$("music-toggle").textContent="Tap to try again"}}else{backgroundMusic.pause();$("music-toggle").textContent="Play music"}};
backgroundMusic.onplay=()=>$("music-toggle").textContent="Pause music";backgroundMusic.onpause=()=>$("music-toggle").textContent="Play music";

// Donation dialog with locally generated QR codes. USDC chain remains intentionally unspecified.
const walletData=[
 {coin:"Bitcoin",network:"Bitcoin network",address:"bc1q447e4m3kfldu9rpzm4clcpy2l5vqh9wxgp7knt",qr:"assets/qr-bitcoin.png"},
 {coin:"Solana",network:"Solana network",address:"FgXz6WC7kD2DNJas27Yrs6Ues8RYzwMCPPk84pi75kmg",qr:"assets/qr-solana.png"},
 {coin:"TRON",network:"TRON network",address:"TNeyphbhFqCPLBNS3MgWGNAYdvgcFpCH7e",qr:"assets/qr-tron.png"},
 {coin:"USDC",network:"Network not specified",address:"0x884c3027704c98d694b44563d64adad3f63943eb",qr:"assets/qr-usdc.png",warning:"Confirm which network this USDC address uses before sending. The QR contains only the address."},
 {coin:"Ethereum",network:"Ethereum network",address:"0x884c3027704c98D694b44563D64ADAD3f63943eb",qr:"assets/qr-ethereum.png"}
];
let activeWallet=0;
function showWallet(i){activeWallet=i;const w=walletData[i];$("wallet-coin").textContent=w.coin;$("wallet-network").textContent=w.network;$("wallet-address").textContent=w.address;$("wallet-qr").src=w.qr;$("network-warning").textContent=w.warning||"";document.querySelectorAll(".coin-tab").forEach((b,n)=>b.classList.toggle("active",n===i))}
$("coin-tabs").innerHTML=walletData.map((w,i)=>`<button class="coin-tab" data-index="${i}">${w.coin}</button>`).join("");document.querySelectorAll(".coin-tab").forEach(b=>b.onclick=()=>showWallet(Number(b.dataset.index)));
function openDonate(){$("donate-modal").classList.remove("hidden");showWallet(activeWallet)}function closeDonate(){$("donate-modal").classList.add("hidden")}
$("open-donate").onclick=openDonate;$("footer-donate").onclick=openDonate;$("close-donate").onclick=closeDonate;$("donate-modal").onclick=e=>{if(e.target===$("donate-modal"))closeDonate()};document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDonate();closeSettings()}});
$("copy-address").onclick=async()=>{const b=$("copy-address");try{await navigator.clipboard.writeText(walletData[activeWallet].address);b.textContent="Copied!";setTimeout(()=>b.textContent="Copy address",1500)}catch{b.textContent="Select address to copy"}};
