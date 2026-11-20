// Dedicated route search follows Figma 9134:12993 and 9137:15051.
const lookupSeed=[['巡津街','西山区盘龙路25号院12栋5号楼'],['翠湖','昆明市五华区翠湖南路67号。'],['椿楣粉档','昆明市西山区盘龙新村15号']];
let lookupState={origin:'我的位置',destination:'',mode:'推荐',recents:[]},lookupTemplates=[],lookupSelected=0;
try{lookupState={...lookupState,...JSON.parse(localStorage.getItem('yyd-route-search')||'{}')}}catch{}
function saveLookup(){try{localStorage.setItem('yyd-route-search',JSON.stringify(lookupState))}catch{}}
function openLookupDestination(destination){lookupState.destination=destination;lookupState.mode='推荐';saveLookup();go('pureResults')}
function wireRouteSearch(page){
 const root=$('#screen > div'),isResults=page==='pureResults';root.classList.add('lookup-page');
 const header=root.querySelector('[data-name="输入"]');
 for(const name of ['起点','终点'])header.querySelector('[data-name="'+name+'"] p').style.visibility='hidden';
 header.querySelectorAll('[data-name="Rounded rectangle"]').forEach(n=>n.style.visibility='hidden');
 const origin=document.createElement('input'),destination=document.createElement('input');
 [[origin,'出发地',68,lookupState.origin],[destination,'搜索目的地',100,lookupState.destination]].forEach(([input,label,top,value])=>{input.className='lookup-field';input.style.top=top+'px';input.value=value;input.placeholder=label==='出发地'?'我的位置':'输入终点';input.setAttribute('aria-label',label);input.autocomplete='off';input.enterKeyHint='search';input.addEventListener('input',()=>{lookupState[label==='出发地'?'origin':'destination']=input.value;saveLookup()});root.append(input);input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submitLookup()}};input.onfocus=()=>{lastField=input;};});
 function submitLookup(){if(!destination.value.trim()){toast('请输入终点');destination.focus();return}lookupState.origin=origin.value.trim()||'我的位置';lookupState.destination=destination.value.trim();lookupState.recents=[lookupState.destination,...lookupState.recents.filter(n=>n!==lookupState.destination)].slice(0,10);saveLookup();go('pureResults')}
 hit('返回路线规划',8,54,40,44,()=>go(isResults?'pureSearch':'route'));
 hit('交换起终点',321,78,34,34,()=>{lookupState.origin=destination.value.trim()||'我的位置';lookupState.destination=origin.value.trim();saveLookup();go(page,false)});
 let lastField=destination;
 if(!isResults){
  const panel=root.querySelector('[data-node-id="9135:13821"]'),heading=panel.querySelector('p'),rows=[...panel.children].filter(n=>n.dataset.name==='历史记录');lookupTemplates=rows.map(n=>n.cloneNode(true));
  const render=()=>{rows.forEach(n=>n.remove());panel.querySelectorAll('.lookup-history-row,.lookup-empty').forEach(n=>n.remove());const query=destination.value.trim();heading.textContent=query?'搜索结果':'历史记录';
   const data=query?([...lookupSeed,...places].filter(([name,description])=>(name+description).toLowerCase().includes(query.toLowerCase())||query.replace(/公园$/,'')===name)):lookupState.recents.length?lookupState.recents.map(name=>[name,lookupSeed.find(p=>p[0]===name)?.[1]||places.find(p=>p[0]===name)?.[1]||'昆明市']):lookupSeed;
   const seen=new Set();data.filter(([name])=>{if(seen.has(name))return false;seen.add(name);return true}).forEach(([name,description],i)=>{const row=lookupTemplates[Math.min(i,lookupTemplates.length-1)].cloneNode(true),ps=row.querySelectorAll('p');ps[0].textContent=name;ps[1].textContent=description;row.classList.add('lookup-history-row');makePickerAction(row,'查看'+name+'路线',()=>{origin.blur();destination.blur();lookupState.origin=origin.value.trim()||'我的位置';lookupState.destination=name==='翠湖'?'翠湖公园':name;lookupState.recents=[name,...lookupState.recents.filter(n=>n!==name)].slice(0,10);lookupState.mode='推荐';saveLookup();go('pureResults')});panel.append(row)});
   if(!data.length){const empty=document.createElement('p');empty.className='lookup-empty';empty.textContent='未找到匹配地点，可按回车搜索路线';panel.append(empty)}
  };destination.addEventListener('input',render);render();
  const keyboard=root.querySelector('[data-name="AlphabeticKeyboard"]');if(keyboard){keyboard.setAttribute('aria-label','屏幕键盘');keyboard.querySelectorAll('[data-name="_Key"]').forEach(key=>{const text=key.textContent.trim();if(text.length===1)makePickerAction(key,'输入'+text,()=>{lastField.value+=keyboard.dataset.shift==='true'?text:text.toLowerCase();lastField.dispatchEvent(new Event('input'))})});const backspace=keyboard.querySelectorAll('[data-name="_Key"]');[...backspace].filter(n=>!n.textContent.trim()).forEach(n=>{if(n.querySelector('img')?.getAttribute('src').includes('2b7b4.svg'))makePickerAction(n,'删除字符',()=>{lastField.value=lastField.value.slice(0,-1);lastField.dispatchEvent(new Event('input'))})});const shift=[...backspace].find(n=>n.querySelector('img')?.getAttribute('src').includes('0f642.svg'));if(shift)makePickerAction(shift,'切换大小写',()=>{keyboard.dataset.shift=String(keyboard.dataset.shift!=='true');shift.setAttribute('aria-pressed',keyboard.dataset.shift)});keyboard.querySelectorAll('p').forEach(p=>{if(p.textContent==='return')makePickerAction(p.parentElement,'搜索路线',submitLookup);if(p.textContent==='space')makePickerAction(p.parentElement,'空格',()=>{lastField.value+=' ';lastField.dispatchEvent(new Event('input'))})});}
 }else{
  const list=root.querySelector('[data-node-id="9153:29356"]');list.classList.add('lookup-routes');const cards=[...list.children];const initial=cards.map(n=>n.cloneNode(true));
  const renderMode=()=>{list.replaceChildren();let selected=lookupState.mode==='公共交通'?[0,1,2]:lookupState.mode==='骑行'?[3]:lookupState.mode==='打车'?[]:[0,1,2,3,4];
   selected.forEach(i=>{const card=initial[i].cloneNode(true);card.classList.add('lookup-route-card');const label=['公交路线一','公交路线二','公交地铁换乘路线','骑行路线','步行路线'][i];makePickerAction(card,label,()=>{lookupSelected=i;go('lookupDetail')});list.append(card)});
   if(lookupState.mode==='打车'){const taxi=initial[3].cloneNode(true);taxi.replaceChildren();taxi.classList.add('lookup-taxi-card');taxi.innerHTML='<h2>打车</h2><p>'+escapeHTML(lookupState.origin)+' → '+escapeHTML(lookupState.destination)+'</p><small>查看路线，车费以叫车平台实际报价为准</small>';makePickerAction(taxi,'查看打车路线',()=>{lookupSelected=5;go('lookupDetail')});list.append(taxi)}
  };
  root.querySelectorAll('[data-name="二级导航"]').forEach(tab=>{const label=tab.textContent.trim();makePickerAction(tab,label,()=>{lookupState.mode=label;saveLookup();go('pureResults',false)});const selected=lookupState.mode===label;tab.classList.toggle('lookup-mode-selected',selected);tab.classList.toggle('lookup-mode-unselected',!selected);tab.setAttribute('aria-pressed',String(selected));tab.querySelector('p').style.fontWeight=selected?'600':'400'});renderMode();

 }
}
function renderLookupDetail(){
 const type=['公共交通','公共交通','公交地铁换乘','骑行','步行','打车'][lookupSelected];const body='<div class="card"><h2>'+escapeHTML(type)+'路线</h2><p>'+escapeHTML(lookupState.origin)+' → '+escapeHTML(lookupState.destination)+'</p></div><div class="card"><img class="lookup-detail-map" src="assets/38eb7.png" alt="昆明路线地图"></div><div class="card"><h2>出行安排</h2><div class="timeline"><span class="badge">起</span><strong>'+escapeHTML(lookupState.origin)+'</strong></div><div class="timeline"><span class="badge">终</span><strong>'+escapeHTML(lookupState.destination)+'</strong></div><p class="caption">'+(lookupSelected<3?'乘车前可查看乘车码和站点信息。':lookupSelected===3?'请在运营停车点规范取还车辆。':'按所选出行方式前往目的地。')+'</p></div>';
 $('#screen').innerHTML=shell('路线详情',body,'<button class="primary" id="lookup-next">'+(lookupSelected<3?'查看乘车码':lookupSelected===3?'查看附近电单车':'查看导航')+'</button>');wireNew();$('#lookup-next').onclick=()=>{if(lookupSelected<3)go('home');else if(lookupSelected===3)go('scooter');else{const link=document.createElement('a');link.href='https://uri.amap.com/search?keyword='+encodeURIComponent(lookupState.destination)+'&city=昆明&callnative=1';link.target='_blank';link.rel='noopener noreferrer';link.click()}};
}

function openNavigation(destination){lookupState.origin=state.origin;lookupState.destination=destination||state.destination[0]||'翠湖';lookupSelected=0;saveLookup();go('lookupDetail')}
function wireNavigationDetail(){
 if(lookupSelected>=3){renderLookupDetail();return;}
 const root=$('#screen > div');root.classList.add('navigation-page');
 const panel=root.querySelector('[data-node-id="9153:28688"]');panel.classList.add('navigation-steps');panel.setAttribute('role','region');panel.setAttribute('aria-label','导航路线详情，可上下滚动');panel.tabIndex=0;
 root.querySelector('[data-node-id="9153:28696"]').textContent=lookupState.origin||'我的位置';root.querySelector('[data-node-id="9153:28766"]').textContent=lookupState.destination||'翠湖公园';
 makePickerAction(root.querySelector('[data-node-id="9153:28661"]'),'返回路线规划',()=>historyStack.length?back():go('pureResults',false));
 makePickerAction(root.querySelector('[data-node-id="9153:28728"]').parentElement,'查看乘车码',()=>go('home'));
 makePickerAction(root.querySelector('[data-node-id="9153:28841"]'),'定位到我的位置',()=>toast('已定位到当前演示位置'));
 const stop=root.querySelector('[data-node-id="9153:28748"]').parentElement;makePickerAction(stop,'查看途经站点',()=>toast('途经站点：昆时 → 环城南路 → 宋家庄'));
 const summary=root.querySelector('[data-node-id="9153:28780"]');summary.setAttribute('aria-label','交通方案，可左右滑动');summary.tabIndex=0;
 const dots=root.querySelector('[data-node-id="9153:28811"]');
 const choose=index=>{lookupSelected=(index+3)%3;root.querySelector('[data-node-id="9153:28787"]').textContent=lookupSelected===0?'54':lookupSelected===1?'51':'54';summary.setAttribute('aria-label','交通方案'+(lookupSelected+1)+'，可左右滑动');if(dots)[...dots.children].forEach((dot,i)=>{dot.style.backgroundImage='none';dot.style.backgroundColor=i===lookupSelected?'#00d2d2':'#e9ecf0';dot.style.width=i===lookupSelected?'10px':'6px';});};
 let startX=0;summary.addEventListener('pointerdown',e=>startX=e.clientX);summary.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-startX)>25)choose(lookupSelected+(e.clientX<startX?1:-1))});summary.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();choose(lookupSelected+(e.key==='ArrowRight'?1:-1))}};
 choose(Math.min(lookupSelected,2));
}
