let activeAiCard='coffee',aiCarouselOffset=0;
const aiCardTypes=[
 {key:'day',node:'9099-17992',label:'昆明一天8小时可以做什么',source:'9051:24896',x:16},
 {key:'coffee',node:'9099-18027',label:'昆明不允许错过的咖啡店',source:'9051:24889',x:175,title:'昆明不允许错过的咖啡店',description:'昆明的咖啡文化非常浓厚，尤其是翠湖和老街片区，几乎走几步就能遇到一家有格调的咖啡店。我为你整理了不同风格的宝藏咖啡店，方便你根据行程打卡。',items:[['翠湖片区','在公园漫步之间，留一段咖啡时间。'],['昆明老街片区','把街巷漫游与咖啡打卡安排在一起。'],['按行程打卡','选择想去的目的地，再安排游玩顺序。']],preference:'咖啡打卡'},
 {key:'gifts',node:'9099-18041',label:'昆明最有意思的手信礼物',source:'9051:24903',x:334,title:'昆明最有意思的手信',description:'昆明作为云南的省会，汇聚了各地的高原特产和民族手工艺品。为你整理了一份涵盖美食、茶饮和文创的昆明必买清单。',items:[['美食手信','把喜欢的云南风味带回家。'],['茶饮与咖啡','为自己和朋友挑一份春城滋味。'],['民族文创','在街巷探索里寻找喜欢的手作。']],preference:'购物逛街'},
 {key:'food',node:'9099-17999',label:'来昆明不吃会后悔一辈子的美食',title:'昆明美食推荐',description:'昆明的烟火气全藏在街头巷尾的地道小吃和鲜美菌菇里，从清晨的米线到深夜的烧烤，每一口都是春城独有的滋味。为你整理了一份超实用的昆明美食攻略，照着吃准没错！',items:[['清晨的米线','从一份热乎的早餐开启今天的行程。'],['地道小吃与菌菇','为用餐留出时间，慢慢品尝云南风味。'],['深夜的烧烤','把夜间美食安排进你的春城旅程。']],preference:'美食打卡'},
 {key:'mbti',node:'9099-18006',label:'一条最适合INFJ的昆明游玩路线',title:'MBTI 个性路线',description:'根据 MBTI 的属性做个性化线路推荐，如 INFJ 喜欢文艺、安静、有趣的一些打卡点。',items:[['文艺街区','在街巷里寻找书店、咖啡和有趣的小店。'],['安静漫步','给公园散步和独处留一段时间。'],['按喜好安排','选好目的地，把喜欢的体验连成路线。']],preference:'文艺慢游'},
 {key:'weather',node:'9099-18034',label:'看看今天昆明的天气来穿搭',title:'出行天气与穿搭建议',description:'根据出行时间、目的地和游玩安排，准备适合自己的出行穿搭。',items:[['出发前看天气','出发前确认当地实时天气与降雨情况。'],['按行程准备','根据步行、室内或户外活动选择衣物。'],['舒适出行','为游玩准备舒适的鞋履与随身用品。']],preference:'时间合理'},
 {key:'pets',node:'9099-18013',label:'昆明宠物友好餐厅与景点',title:'宠物友好餐厅与景点',description:'昆明对宠物的接纳度非常高，无论是市区的公园还是周边的自然景区，都有很多适合带毛孩子撒欢的地方。为你整理了一份昆明宠物友好餐厅与景点的攻略，快带上你的小狗去打卡吧！',items:[['宠物友好餐厅','提前确认店家的宠物接待规则。'],['公园与自然景区','出发前确认目的地的宠物入园要求。'],['轻松同行','安排好休息和补给，按自己的节奏出发。']],preference:'宠物友好'}
];
function wireAiCarousel(){
 const root=$('#screen > div'),viewport=document.createElement('section'),track=document.createElement('div');
 viewport.className='ai-carousel';viewport.setAttribute('role','region');viewport.setAttribute('aria-label','出行推荐卡片，可左右滑动');track.className='ai-carousel-track';viewport.append(track);
 for(const card of aiCardTypes){const slot=document.createElement('div');slot.className='ai-carousel-card';slot.setAttribute('role','button');slot.setAttribute('aria-roledescription','推荐卡片');slot.setAttribute('aria-label',card.label);slot.tabIndex=0;slot.dataset.cardType=card.key;
  if(card.source){const original=root.querySelector('[data-node-id="'+card.source+'"]'),art=document.createElement('div');art.className='ai-card-original';art.style.left=-card.x+'px';art.style.top='-224.85px';art.append(original);slot.append(art)}else slot.innerHTML=screens[card.node];
  slot.onclick=()=>{if(performance.now()<suppressClickUntil)return;aiCarouselOffset=viewport.scrollLeft;activateAiCard(card.key)};
  slot.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const i=aiCardTypes.indexOf(card),next=e.key==='Home'?0:e.key==='End'?aiCardTypes.length-1:Math.max(0,Math.min(aiCardTypes.length-1,i+(e.key==='ArrowRight'?1:-1)));track.children[next].focus({preventScroll:true});viewport.scrollTo({left:next*159,behavior:reducedMotion()?'auto':'smooth'})}else if(e.key==='Enter'||e.key===' '){e.preventDefault();activateAiCard(card.key)}};
  track.append(slot);
 }
 root.append(viewport);viewport.scrollLeft=aiCarouselOffset;
 let drag=null,suppressClickUntil=0;
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)drag={x:e.clientX,scroll:viewport.scrollLeft,id:e.pointerId,moved:false}});
 viewport.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5&&!drag.moved){drag.moved=true;viewport.classList.add('dragging');viewport.setPointerCapture(e.pointerId)}if(drag.moved){e.preventDefault();const scale=viewport.getBoundingClientRect().width/375;viewport.scrollLeft=drag.scroll-dx/scale}});
 const endDrag=()=>{if(!drag)return;if(drag.moved){suppressClickUntil=performance.now()+300;viewport.classList.remove('dragging');if(viewport.hasPointerCapture(drag.id))viewport.releasePointerCapture(drag.id);viewport.scrollTo({left:Math.round(viewport.scrollLeft/159)*159,behavior:reducedMotion()?'auto':'smooth'})}drag=null};
 viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);viewport.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null});
 viewport.addEventListener('scroll',()=>{aiCarouselOffset=viewport.scrollLeft},{passive:true});
 viewport.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){const canMove=e.deltaY>0?viewport.scrollLeft<viewport.scrollWidth-viewport.clientWidth:viewport.scrollLeft>0;if(canMove){e.preventDefault();viewport.scrollLeft+=e.deltaY}}},{passive:false});
}
function reducedMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches}
function activateAiCard(key){
 if(key==='coffee'){state.kind='coffee';state.request='昆明不允许错过的咖啡店☕️';state.destination=['幸也咖啡','烈烈庆祝','沙丁鱼咖啡'];plan();return}if(key==='day'){state.request='昆明一天8小时可以做什么';state.kind='day';state.destination=['翠湖','昆明老街','滇池'];state.duration='8小时';state.preference='经典必玩';plan();return}
 activeAiCard=key;state.aiCardKey=key;state.conversationId=newConversationId();state.request='';go('recommendation');
}
function renderAiRecommendation(){
 const card=aiCardTypes.find(c=>c.key===(state.aiCardKey||activeAiCard))||aiCardTypes[1];
 const body='<div class="card"><h2>'+escapeHTML(card.title)+'</h2><p class="ai-recommendation-intro">'+escapeHTML(card.description)+'</p></div><div class="card"><h2>按你的节奏出发</h2>'+card.items.map(([title,text],i)=>'<div class="timeline"><span class="badge">'+String(i+1).padStart(2,'0')+'</span><div><strong>'+escapeHTML(title)+'</strong><p>'+escapeHTML(text)+'</p></div></div>').join('')+'</div>';
 $('#screen').innerHTML=shell(card.title,body,'<button class="primary" id="ai-card-plan">✦ 安排我的行程</button>');
 wireNew();mountResultComposer();$('#ai-card-plan').onclick=()=>{state.preference=card.preference;state.request=card.title;if(card.key==='pets')state.party='携宠出游';go('destination')};
}
