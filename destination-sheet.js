// Figma node 9099:16520 is the visual source for this sheet.
let destinationSectionHeading=null;
function wireDestinationSheet(){
 const root=$('#screen > div'),mask=$('[data-node-id="9099:16644"]');
 const panel=$('[data-node-id="9122:2223"]');
 const base=document.createElement('div');base.className='destination-underlay';for(const child of [...root.children]){if(child!==panel&&child.dataset.name!=='btn')base.append(child)}if(sheetUnderlay)base.innerHTML=sheetUnderlay;base.inert=true;base.setAttribute('aria-hidden','true');root.prepend(base);
 root.classList.add('destination-sheet');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',returnTo==='origin'?'选择出发点':'添加目的地');
 const list=$('[data-node-id="9099:16757"]');
 destinationTemplates=[...list.children].map(row=>({name:row.querySelectorAll('p')[0].textContent.trim(),description:row.querySelectorAll('p')[1].textContent.trim(),node:row.cloneNode(true)}));
 destinationSectionHeading=$('[data-node-id="9110:18060"]');destinationSectionHeading.setAttribute('role','heading');destinationSectionHeading.setAttribute('aria-level','2');
 const searchSlot=$('[data-node-id="9099:16652"]');searchSlot.style.visibility='hidden';
 const search=document.createElement('input');search.className='destination-search';search.id='place-search';search.placeholder='搜索景点、商圈或地址';search.setAttribute('aria-label','搜索景点、商圈或地址');search.autocomplete='off';search.type='search';root.append(search);
 const empty=document.createElement('div');empty.className='destination-empty';empty.hidden=true;empty.setAttribute('role','status');empty.innerHTML='<p>没有找到相关地点</p><small>试试景点名称、商圈或地址</small>';root.append(empty);
 search.addEventListener('input',()=>renderDestinationRows(search.value));search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search.blur()}});
 const close=$('[data-node-id="I9124:6147;288:8942"]');makePickerAction(close,'关闭目的地选择',cancelDestinationSheet);
 mask.setAttribute('aria-hidden','true');mask.onclick=cancelDestinationSheet;

 if(returnTo==='origin')$('[data-node-id="I9124:6147;288:8424"]').textContent='选择出发点';
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancelDestinationSheet()}if(e.key==='Tab'){const nodes=[...root.querySelectorAll('input, [tabindex="0"]')].filter(n=>!n.closest('[inert]'));const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
 renderDestinationRows('');
}
function makePickerAction(node,label,action){node.setAttribute('role','button');node.setAttribute('aria-label',label);node.tabIndex=0;node.style.cursor='pointer';node.onclick=action;node.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action()}}}
function renderDestinationRows(query){
 const list=$('[data-node-id="9099:16757"]'),key=query.trim().toLowerCase(),oldScroll=list.scrollTop;
 const recommended=destinationTemplates.filter(item=>(item.name+item.description).toLowerCase().includes(key));
 const extra=key?places.filter(([name,description])=>!destinationTemplates.some(t=>t.name===name)&&(name+description).toLowerCase().includes(key)):[];
 list.replaceChildren();if(destinationSectionHeading)list.append(destinationSectionHeading);
 for(const item of recommended){const row=item.node.cloneNode(true);wirePickerRow(row,item.name);list.append(row)}
 for(const [name,description]of extra){const row=destinationTemplates[0].node.cloneNode(true);row.querySelectorAll('p')[0].textContent=name;row.querySelectorAll('p')[1].textContent=description;const picture=row.querySelector('[data-name="图片"]');picture.replaceChildren();picture.classList.add('destination-place-fallback');picture.textContent='⌖';wirePickerRow(row,name);list.append(row)}
 $('.destination-empty').hidden=!!(recommended.length+extra.length);list.scrollTop=key?0:oldScroll;

}
function wirePickerRow(row,name){
 row.dataset.place=name;row.classList.add('destination-place-row');const image=row.querySelector('[data-name="图片"] img');if(image)image.alt=name;
 makePickerAction(row,'选择'+name,()=>{sheetDraft=[name];confirmDestinationSheet()});
}
function cancelDestinationSheet(){sheetDraft=[];back()}
function confirmDestinationSheet(){
 if(!sheetDraft.length){toast(returnTo==='origin'?'请选择一个出发点':'至少选择一个目的地');return}
 if(returnTo==='origin')state.origin=sheetDraft[0];else {state.destination=[sheetDraft[0]];state.request=''};persist();
 const next=returnTo==='edit'?'edit':'destination';if(historyStack[historyStack.length-1]===next)historyStack.pop();go(next,false);
}

// Figma 9124:6167 — preference choices use a draft until confirmed.
function wirePreferenceSheet(){
 const root=$('#screen > div'),panel=root.querySelector('[data-name="面板"]');
 const base=document.createElement('div');base.className='destination-underlay';for(const child of [...root.children]){if(child!==panel&&child.dataset.name!=='btn')base.append(child)}base.innerHTML=preferenceUnderlay||screens[ids.destination];base.inert=true;base.setAttribute('aria-hidden','true');root.prepend(base);
 root.classList.add('preference-sheet');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','出行偏好');
 const options={preference:['美食打卡','微醺','City walk','好友聚餐','安静独处','购物逛街'],transport:['公共交通','步行','自驾','骑行'],party:['独自','朋友','情侣','一家人'],duration:['0.5天','1天','3天','自定义']};
 const groups=[...panel.children].filter(n=>n.dataset.name!=='mask'&&n.querySelector('button'));
 groups.forEach((group,i)=>{const key=Object.keys(options)[i];group.querySelectorAll('button').forEach((button,j)=>{let value=options[key][j];if(key==='duration'&&j===3&&preferenceDraft.duration&&!options.duration.includes(preferenceDraft.duration)){value=preferenceDraft.duration;button.querySelector('p').textContent=value;}const selected=key==='party'?({独自出发:'独自',朋友同行:'朋友',情侣出游:'情侣',亲子出游:'一家人'}[preferenceDraft.party]||preferenceDraft.party)===value:preferenceDraft[key]===value;button.classList.add(selected?'choice-on':'choice-off');button.setAttribute('aria-pressed',String(selected));button.onclick=()=>{if(key==='duration'&&j===3&&!selected){returnTo='preferences';go('duration');return}preferenceDraft[key]=selected?'':value;const draft=preferenceDraft;go('preferences',false);preferenceDraft=draft;};});});
 const close=panel.querySelector('[data-name="右侧-图标"]');const cancel=()=>{preferenceDraft=null;back()};makePickerAction(close,'关闭出行偏好',cancel);panel.querySelector('[data-name="mask"]').onclick=cancel;
 const confirm=$('[data-node-id="9124:6543"]');makePickerAction(confirm,'确定出行偏好',()=>{Object.assign(state,{preference:preferenceDraft.preference,transport:preferenceDraft.transport,party:preferenceDraft.party,duration:preferenceDraft.duration});persist();back()});
 root.onkeydown=e=>{if(e.key==='Escape')cancel()};
}

// Full-height Figma result art stays intact inside a scrollable viewport.
function wireLongResult(page){
 const root=$('#screen > div'),height=['dayResult','coffeeResult'].includes(page)?1800:['pointResult','stationResult','relaxResult'].includes(page)?2401:2400;
 const fixed=[...root.children].filter(n=>/^(Navigation|Titlebar|iOS\/Bars\/Home)/.test(n.dataset.name||''));
 const scroll=document.createElement('div');scroll.className='route-result-scroll';scroll.setAttribute('role','region');scroll.setAttribute('aria-label','路线规划详情，可上下滚动');scroll.tabIndex=0;
 mountResultComposer();root.before(scroll);scroll.append(root);root.style.height=height+'px';root.style.marginTop='-88px';
 fixed.forEach(n=>{n.classList.add('route-result-fixed');n.style.background='#f7f9fc';if((n.dataset.name||'').startsWith('iOS')){n.style.top='778px';n.style.bottom='auto';}$('#screen').append(n)});
 if(!fixed.some(n=>(n.dataset.name||'').startsWith('iOS'))){const bar=document.createElement('div');bar.className='homebar result-homebar';$('#screen').append(bar)}
 const request=[...root.querySelectorAll('p')].find(p=>p.textContent.trim().startsWith('目的地：'))||root.querySelector('[data-name="气泡"] p');if(request)request.textContent=state.request||(state.kind==='day'?'昆明一天8小时可以做什么':planningRequest());
 root.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()==='扫码骑车'||p.textContent.trim()==='地铁二维码'||p.textContent.trim()==='乘车码')makePickerAction(p.parentElement,p.textContent.trim(),()=>go(p.textContent.trim()==='扫码骑车'?'scooter':'home'));if(p.textContent.trim()==='去导航')makePickerAction(p,'去导航',()=>openNavigation(({dayResult:'文林街',coffeeResult:'幸也咖啡',relaxResult:'幸也咖啡',nearbyResult:'盘龙寺',travelResult:'翠湖公园',pointResult:'文林街',stationResult:'昆明火车站'})[page]));});
 if(page==='pointResult'){const title=[...root.querySelectorAll('p')].find(p=>p.textContent.trim()==='终点：文林街');if(title){title.textContent='终点：'+(state.destination[0]||'文林街');if(state.destination[0]&&state.destination[0]!=='文林街')while(title.nextElementSibling)title.nextElementSibling.remove();}}
 wireInlineTransport(root,page);
 if(['pointResult','stationResult','relaxResult'].includes(page)){const detail=root.querySelector('[data-name="行程规划"]');const bg=root.querySelector('[data-name="路线推荐"] > [data-name="bg"]');if(detail&&bg){const end=detail.getBoundingClientRect().bottom-root.getBoundingClientRect().top;const scale=root.getBoundingClientRect().width/375;const top=parseFloat(getComputedStyle(detail).top)-16;bg.style.top=top+'px';bg.style.transform='translateX(-50%)';bg.style.height=(end/scale+16-top)+'px';root.style.height=Math.max(812,end/scale+48)+'px';}}
 const tabs=[...root.querySelectorAll('p')].filter(p=>/^DAY[123]$/.test(p.textContent.trim())).slice(0,3);
 if(tabs.length){const detail=root.querySelector('[data-name="行程规划"]'),dayOne=detail.innerHTML,bg=detail.parentElement.querySelector(':scope > [data-name="bg"]'),bgHeight=bg?.style.height||'';
 tabs.forEach((p,i)=>makePickerAction(p.parentElement,'查看第'+(i+1)+'天行程',()=>{
 tabs.forEach((t,j)=>{t.parentElement.classList.toggle('choice-on',i===j);t.parentElement.classList.toggle('choice-off',i!==j);t.parentElement.setAttribute('aria-pressed',String(i===j))});
 if(i===0){detail.innerHTML=dayOne;if(bg)bg.style.height=bgHeight;root.style.height=height+'px'}else{renderAlternateDay(detail,i,dayOne);const end=parseFloat(getComputedStyle(detail).top)+detail.offsetHeight;if(bg)bg.style.height=end+16-parseFloat(getComputedStyle(bg).top)+'px';root.style.height=end+48+'px'}

 detail.querySelectorAll('p').forEach(t=>{if(t.textContent.trim()==='扫码骑车'||t.textContent.trim()==='地铁二维码'||t.textContent.trim()==='乘车码')makePickerAction(t.parentElement,t.textContent.trim(),()=>go(t.textContent.trim()==='扫码骑车'?'scooter':'home'))});detail.scrollIntoView({block:'start',behavior:reducedMotion()?'auto':'smooth'});
 }));}

}
function showRouteNavigation(page){
 const names={dayResult:['文林街','巡津街','昆明老街'],coffeeResult:['幸也咖啡','烈烈庆祝','沙丁鱼咖啡'],relaxResult:['幸也咖啡','橡榭咖啡','上瘾潘哒熊猫'],nearbyResult:['盘龙寺','古滇文化公园','返程市区'],travelResult:['翠湖','云南陆军讲武堂旧址','云南大学','海埂大坝']};
 const stops=names[page]||state.destination;$('#layer').innerHTML='';$('#screen').innerHTML=shell('路线导航','<div class="card"><img src="assets/38eb7.png" alt="昆明路线地图" style="width:100%;height:200px;object-fit:cover;border-radius:12px"></div><div class="card"><h2>选择目的地导航</h2>'+stops.map((name,i)=>'<a class="navigation-stop" href="https://uri.amap.com/search?keyword='+encodeURIComponent(name)+'&city=昆明&callnative=1" target="_blank" rel="noopener noreferrer"><span>'+String(i+1).padStart(2,'0')+' · '+escapeHTML(name)+'</span><span>去导航 '+navigationArrow(true)+'</span></a>').join('')+'</div>');wireNew();
}

function mountResultComposer(){
 const template=document.createElement('div');template.innerHTML=screens[ids.destination];
 const footer=document.createElement('section');footer.className='result-composer';footer.setAttribute('aria-label','继续对话和快捷功能');
 for(const [id,top]of [['9047:21761',18],['9039:16458',60]]){const node=template.querySelector('[data-node-id="'+id+'"]');node.style.top=top+'px';footer.append(node)}
 $('#screen').append(footer);
 footer.querySelectorAll('[data-name="能力"] > p').forEach(p=>{const text=p.textContent.trim();makePickerAction(p.parentElement,text,()=>{if(text==='坐地铁')go('home');else toast(text==='问天气'?'演示模式：可继续规划行程':text==='今日签运'?'今日宜出发，去发现春城的小美好':'优惠券已放入你的演示卡包')})});
 wireQuickActions(footer);
 const content=$('#screen .new-page .content'),plan=$('#ai-card-plan');if(content){content.classList.add('result-recommendation-content');if(plan){content.append(plan);plan.style.marginTop='16px';$('#screen .new-page .footer')?.remove()}}
 inputOverlay(58,714,251,36);hit('添加目的地',32,720,22,24,()=>{returnTo='destination';go('search')});
}

function wireTransportTabs(page){
 const bike=page==='scooter';
 for(const [label,x,target]of [['公交地铁',12,'home'],['电单车',187,'scooter']]){const button=hit(label,x,96,175,44,()=>{if(current!==target)go(target,false)});button.setAttribute('role','tab');button.setAttribute('aria-selected',String(page===target));}
 hit('扫码骑车',258,48,101,36,()=>go('bikeScan'));
 if(bike){hit('立即用车',24,350,327,44,()=>go('bikeScan'));hit('我的订单',85,402,100,38,()=>go('bikeOrders'));hit('计费说明',202,402,100,38,()=>go('bikePricing'));hit('查看附近电单车',24,154,327,184,()=>go('bikeScan'));}
 else{bindText('刷新',()=>toast('乘车码已刷新'));['站点列表','站点时刻','地铁网图'].forEach(label=>bindText(label,()=>go('route')))}
}
function renderBikeService(page){
 const title=page==='bikeScan'?'扫码用车':page==='bikeOrders'?'我的订单':'计费说明';
 const body=page==='bikeScan'?'<div class="card"><h2>输入车辆编号</h2><input class="searchbox" id="bike-number" aria-label="车辆编号" placeholder="输入车身上的车辆编号" autocomplete="off"><p class="caption">演示用车流程，扫码和开锁需接入实际车辆服务。</p><button class="primary" id="bike-confirm" style="margin-top:20px">确认车辆</button></div>':page==='bikeOrders'?'<div class="empty"><b>暂无骑行订单</b><p>完成骑行后，可在这里查看订单。</p></div>':'<div class="card"><h2>骑行费用</h2><p>骑行前请查看车辆展示的起步价、计费时长与还车规则。</p><p class="caption">实际费用以所选车辆及运营服务页面公示为准。</p></div><div class="card"><h2>规范还车</h2><p>请在地图标记的停车区域内还车，并确认结束骑行。</p></div>';
 $('#screen').innerHTML=shell(title,body);wireNew();const confirm=$('#bike-confirm');if(confirm)confirm.onclick=()=>{const value=$('#bike-number').value.trim();toast(value?'已选择车辆 '+value+'，当前为演示体验':'请输入车辆编号')};
}

function renderAlternateDay(detail,day,dayOne){
 const original=document.createElement('div');original.innerHTML=dayOne;const firstCard=original.querySelector('[data-name="地点卡片"]'),heading=original.querySelector('p').cloneNode(false);heading.textContent=day===1?'DAY2 · 近郊探索':'DAY3 · 市区人文';detail.replaceChildren(heading);
 const makeCard=(title,description)=>{const card=firstCard.cloneNode(false),group=document.createElement('div');group.className=firstCard.querySelector('[data-name="标题+介绍"]').className;const sample=firstCard.querySelectorAll('[data-name="标题+介绍"] p'),a=sample[0].cloneNode(false),b=sample[1].cloneNode(false);a.textContent=title;b.textContent=description;b.style.lineHeight='22px';group.append(a,b);card.append(group);return card};
 if(day===1){detail.append(makeCard('上午：南墙步行街','沿南墙步行街轻松漫步，按自己的节奏安排休息。'),makeCard('下午：西山森林公园','前往西山森林公园，预留游览与返程时间。'))}else{const tmp=document.createElement('div');tmp.innerHTML=screens['9137-17209'];const cards=[...tmp.querySelectorAll('[data-name="行程规划"] > [data-name="地点卡片"]')];detail.append(...cards.slice(0,2),makeCard('下午：黄公东街','沿黄公东街漫步，为市区人文行程收尾。'))}
 const action=document.createElement('button');action.className='primary';action.textContent='查看当天路线';action.onclick=()=>openLookupDestination(day===1?'西山森林公园':'黄公东街');detail.append(action);
}

function wireHistoryModal(){
 const root=$('#screen > div');const mask=root.querySelector('[data-node-id="9137:17594"]');
 const originals=[...root.children];const cutoff=originals.indexOf(mask);
 const underlay=document.createElement('div');underlay.className='history-underlay';underlay.inert=true;underlay.setAttribute('aria-hidden','true');underlay.innerHTML=historyUnderlay||screens[ids.ai];
 originals.slice(0,cutoff).forEach(n=>n.remove());root.prepend(underlay);
 const avatar=root.querySelector('[data-node-id="9137:17746"]');const avatarHTML=avatar?.outerHTML||'';
 ['9137:17695','9137:17746','9137:17700','9137:17702'].forEach(id=>root.querySelector('[data-node-id="'+id+'"]')?.remove());
 const list=document.createElement('div');list.className='history-modal-list';
 if(!conversationHistory.length)list.innerHTML='<div class="empty"><b>还没有历史对话</b><p>生成行程或提问后，可在这里继续查看。</p></div>';
 conversationHistory.forEach(entry=>{const button=document.createElement('button');button.className='history-modal-row';const date=new Date(entry.createdAt);const stamp=date.getFullYear()+'.'+String(date.getMonth()+1).padStart(2,'0')+'.'+String(date.getDate()).padStart(2,'0')+' '+date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});button.innerHTML='<span class="history-avatar">'+avatarHTML+'</span><span><strong>'+escapeHTML(entry.title)+'</strong><small>'+stamp+'</small></span>';button.onclick=()=>{Object.assign(state,entry.snapshot);go(entry.page)};list.append(button)});
 root.append(list);mask.onclick=back;makePickerAction(root.querySelector('[data-node-id="I9137:17598;288:8942"]'),'关闭历史对话',back);
 makePickerAction(root.querySelector('[data-node-id="9137:17672"]'),'新对话',()=>{state.request='';state.destination=[];state.conversationId=newConversationId();go('destination')});
}
function wireInlineTransport(root,page){
 if(!['pointResult','stationResult','relaxResult'].includes(page))return;
 root.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()==='起点：从 昆明市西山区万达南塔 出发'){p.textContent='起点：从 '+state.origin+' 出发';p.style.lineHeight='24px';p.style.fontSize='16px';}});
 const tabs=[...root.querySelectorAll('p')].filter(p=>['推荐','最省时','费用低'].includes(p.textContent.trim()));
 const card=tabs[0]?.closest('[data-name="·"]');if(!card)return;
 card.classList.add('inline-route-card');const paintTabs=selected=>tabs.forEach((tab,i)=>{tab.parentElement.classList.add('inline-route-tab');tab.parentElement.setAttribute('aria-pressed',String(i===selected));});paintTabs(0);
 const original=[...card.children].slice(1).map(n=>n.outerHTML).join('');
 const restoreActions=()=>{[...card.querySelectorAll('p')].forEach(p=>{if(['其他方式','路线规划'].includes(p.textContent.trim()))makePickerAction(p.parentElement,p.textContent.trim(),()=>{lookupState.origin=state.origin;openLookupDestination(state.destination[0]||'巡津街')});if(p.textContent.trim()==='去导航'){p.onclick=null;p.removeAttribute('role');p.removeAttribute('aria-label');makePickerAction(p.parentElement,'导航到'+(state.destination[0]||'巡津街'),()=>{lookupState.origin=state.origin;lookupState.destination=state.destination[0]||'巡津街';saveLookup();lookupSelected=0;go('lookupDetail')})}})};
 tabs.forEach((tab,i)=>makePickerAction(tab.parentElement,'路线方案：'+tab.textContent.trim(),()=>{
 paintTabs(i);
 [...card.children].slice(1).forEach(n=>n.remove());card.insertAdjacentHTML('beforeend',original);
 if(i){const holder=document.createElement('div');holder.innerHTML=screens[ids.pureResults];const cards=holder.querySelector('[data-node-id="9153:29356"]');const candidate=cards?.children[i];if(candidate){const buttons=card.lastElementChild;[...card.children].slice(1,-1).forEach(n=>n.remove());const choice=candidate.cloneNode(true);choice.style.cssText='position:relative;width:100%;height:auto';choice.classList.add('inline-route-option');choice.querySelectorAll('[data-node-id="9153:29367"],[data-node-id="9153:29403"],[data-node-id="9153:29438"]').forEach(row=>row.classList.add('inline-route-badges'));choice.lastElementChild.classList.add('inline-route-status');card.insertBefore(choice,buttons);}}
 restoreActions();const detail=root.querySelector('[data-name="行程规划"]'),bg=root.querySelector('[data-name="路线推荐"] > [data-name="bg"]');if(detail&&bg){const scale=root.getBoundingClientRect().width/375;const end=(detail.getBoundingClientRect().bottom-root.getBoundingClientRect().top)/scale;bg.style.height=(end+16-parseFloat(getComputedStyle(bg).top))+'px';root.style.height=Math.max(812,end+48)+'px';}}));restoreActions();
}

function wireQuickActions(scope){
 const actions={'问天气':()=>toast('演示模式：可继续规划行程'),'坐地铁':()=>go('home'),'行程规划':startPlanningPrompt,'今日签运':()=>toast('今日宜出发，去发现春城的小美好'),'领取优惠券':()=>toast('优惠券已放入你的演示卡包')};
 scope.querySelectorAll('[data-node-id="9047:21761"]').forEach(row=>{row.classList.add('quick-actions-scroll');row.querySelectorAll('p').forEach(p=>{const action=actions[p.textContent.trim()];if(action)makePickerAction(p.parentElement,p.textContent.trim(),action)})});
}
