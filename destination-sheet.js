// Figma node 9099:16520 is the visual source for this sheet.
let destinationSectionHeading=null;
function wireDestinationSheet(){
 const root=$('#screen > div'),mask=$('[data-node-id="9099:16644"]');
 const panel=$('[data-node-id="9122:2223"]');
 const base=document.createElement('div');base.className='destination-underlay';for(const child of [...root.children]){if(child===panel)break;base.append(child)}if(sheetUnderlay)base.innerHTML=sheetUnderlay;base.inert=true;base.setAttribute('aria-hidden','true');root.prepend(base);
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
 const confirm=$('[data-node-id="9099:16855"]');makePickerAction(confirm,'确定选择',confirmDestinationSheet);
 if(returnTo==='origin'){$('[data-node-id="I9124:6147;288:8424"]').textContent='选择出发点';$('[data-node-id="9099:16690"]').textContent='选择一个地点作为出发点'}
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
 const button=$('[data-node-id="9099:16855"]');button.setAttribute('aria-label',sheetDraft.length?'确定选择（'+sheetDraft.length+'个地点）':'确定选择');
}
function wirePickerRow(row,name){
 const selected=sheetDraft.includes(name),icon=row.querySelector('[data-name="选择"] img');icon.src=selected?'assets/28fb3.svg':'assets/a501f.svg';icon.alt='';row.dataset.place=name;row.setAttribute('role','checkbox');row.setAttribute('aria-label',name);row.setAttribute('aria-checked',String(selected));row.tabIndex=0;row.style.cursor='pointer';row.classList.add('destination-place-row');
 const image=row.querySelector('[data-name="图片"] img');if(image)image.alt=name;
 const toggle=()=>{const scroll=$('[data-node-id="9099:16757"]').scrollTop;if(returnTo==='origin')sheetDraft=[name];else sheetDraft=selected?sheetDraft.filter(p=>p!==name):[...sheetDraft,name];renderDestinationRows($('#place-search').value);$('[data-node-id="9099:16757"]').scrollTop=scroll;const replacement=[...document.querySelectorAll('[data-place]')].find(n=>n.dataset.place===name);replacement?.focus({preventScroll:true})};
 row.onclick=toggle;row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
}
function cancelDestinationSheet(){sheetDraft=[];back()}
function confirmDestinationSheet(){
 if(!sheetDraft.length){toast(returnTo==='origin'?'请选择一个出发点':'至少选择一个目的地');return}
 if(returnTo==='origin')state.origin=sheetDraft[0];else state.destination=[...sheetDraft];persist();
 const next=returnTo==='edit'?'edit':'destination';if(historyStack[historyStack.length-1]===next)historyStack.pop();go(next,false);
}

// Figma 9124:6167 — preference choices use a draft until confirmed.
function wirePreferenceSheet(){
 const root=$('#screen > div'),panel=root.querySelector('[data-name="面板"]');
 const base=document.createElement('div');base.className='destination-underlay';for(const child of [...root.children]){if(child===panel)break;base.append(child)}base.innerHTML=preferenceUnderlay||screens[ids.destination];base.inert=true;root.prepend(base);
 root.classList.add('preference-sheet');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','出行偏好');
 const options={preference:['美食打卡','微醺','City walk','好友聚餐','安静独处','购物逛街'],transport:['公共交通','步行','自驾','骑行'],party:['独自','朋友','情侣','一家人'],duration:['0.5天','1天','3天','自定义']};
 const groups=[...panel.children].filter(n=>n.dataset.name!=='mask'&&n.querySelector('button'));
 groups.forEach((group,i)=>{const key=Object.keys(options)[i];group.querySelectorAll('button').forEach((button,j)=>{let value=options[key][j];if(key==='duration'&&j===3&&!options.duration.includes(preferenceDraft.duration)){value=preferenceDraft.duration;button.querySelector('p').textContent=value;}const selected=key==='party'?({独自出发:'独自',朋友同行:'朋友',情侣出游:'情侣',亲子出游:'一家人'}[preferenceDraft.party]||preferenceDraft.party)===value:preferenceDraft[key]===value;button.classList.add(selected?'choice-on':'choice-off');button.setAttribute('aria-pressed',String(selected));button.onclick=()=>{if(key==='duration'&&j===3){returnTo='preferences';go('duration');return}preferenceDraft[key]=value;const draft=preferenceDraft;go('preferences',false);preferenceDraft=draft;};});});
 const close=panel.querySelector('[data-name="右侧-图标"]');const cancel=()=>{preferenceDraft=null;back()};makePickerAction(close,'关闭出行偏好',cancel);panel.querySelector('[data-name="mask"]').onclick=cancel;
 const confirm=$('[data-node-id="9124:6543"]');makePickerAction(confirm,'确定出行偏好',()=>{Object.assign(state,{preference:preferenceDraft.preference,transport:preferenceDraft.transport,party:preferenceDraft.party,duration:preferenceDraft.duration});persist();back()});
 root.onkeydown=e=>{if(e.key==='Escape')cancel()};
}

// Full-height Figma result art stays intact inside a scrollable viewport.
function wireLongResult(page){
 const root=$('#screen > div'),height=['dayResult','coffeeResult'].includes(page)?1716:2400;
 const fixed=[...root.children].filter(n=>/^(Navigation|Titlebar|iOS\/Bars\/Home)/.test(n.dataset.name||''));
 const scroll=document.createElement('div');scroll.className='route-result-scroll';scroll.setAttribute('role','region');scroll.setAttribute('aria-label','路线规划详情，可上下滚动');scroll.tabIndex=0;
 mountResultComposer();root.before(scroll);scroll.append(root);root.style.height=height+'px';root.style.marginTop='-88px';
 fixed.forEach(n=>{n.classList.add('route-result-fixed');n.style.background='#f7f9fc';if((n.dataset.name||'').startsWith('iOS')){n.style.top='778px';n.style.bottom='auto';}$('#screen').append(n)});
 const request=[...root.querySelectorAll('p')].find(p=>p.textContent.trim().startsWith('目的地：'))||root.querySelector('[data-name="气泡"] p');if(request)request.textContent=state.request||(state.kind==='day'?'昆明一天8小时可以做什么':'目的地：'+state.destination.join('、')+'；游玩时长：'+state.duration+'；出行偏好：'+state.preference+'；开始智能规划');
 root.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()==='扫码骑车'||p.textContent.trim()==='地铁二维码')makePickerAction(p.parentElement,p.textContent.trim(),()=>go(p.textContent.trim()==='扫码骑车'?'scooter':'home'));if(p.textContent.trim()==='去导航')makePickerAction(p,'去导航',()=>showRouteNavigation(page));});
 const tabs=[...root.querySelectorAll('p')].filter(p=>/^DAY[123]$/.test(p.textContent.trim())).slice(0,3);
 if(tabs.length){const detail=root.querySelector('[data-node-id="9126:7839"]'),dayOne=detail.innerHTML;
 tabs.forEach((p,i)=>makePickerAction(p.parentElement,'查看第'+(i+1)+'天行程',()=>{
 tabs.forEach((t,j)=>{t.parentElement.classList.toggle('choice-on',i===j);t.parentElement.classList.toggle('choice-off',i!==j);t.parentElement.setAttribute('aria-pressed',String(i===j))});
 if(i===0)detail.innerHTML=dayOne;else{const template=document.createElement('div');template.innerHTML=screens[i===1?'9126-7944':'9126-8532'];const content=template.querySelector(i===1?'[data-node-id="9126:8000"]':'[data-node-id="9126:8654"]');detail.innerHTML=dayOne;const title=detail.querySelector('p').cloneNode(false);title.textContent=i===1?'DAY2 · 近郊探索':'DAY3 · 市区人文';if(content)detail.replaceChildren(title,...content.children);}
 detail.querySelectorAll('p').forEach(t=>{if(t.textContent.trim()==='扫码骑车'||t.textContent.trim()==='地铁二维码')makePickerAction(t.parentElement,t.textContent.trim(),()=>go(t.textContent.trim()==='扫码骑车'?'scooter':'home'))});detail.scrollIntoView({block:'start',behavior:reducedMotion()?'auto':'smooth'});
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
