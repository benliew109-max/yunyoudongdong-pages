// Figma node 9099:16520 is the visual source for this sheet.
let destinationSectionHeading=null;
function wireDestinationSheet(){
 const root=$('#screen > div'),mask=$('[data-node-id="9099:16644"]');
 const base=document.createElement('div');base.className='destination-underlay';for(const child of [...root.children]){if(child===mask)break;base.append(child)}if(sheetUnderlay)base.innerHTML=sheetUnderlay;base.inert=true;base.setAttribute('aria-hidden','true');root.prepend(base);
 root.classList.add('destination-sheet');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',returnTo==='origin'?'选择出发点':'添加目的地');
 const list=$('[data-node-id="9099:16757"]');
 destinationTemplates=[...list.children].map(row=>({name:row.querySelectorAll('p')[0].textContent.trim(),description:row.querySelectorAll('p')[1].textContent.trim(),node:row.cloneNode(true)}));
 destinationSectionHeading=$('[data-node-id="9110:18060"]');destinationSectionHeading.setAttribute('role','heading');destinationSectionHeading.setAttribute('aria-level','2');
 const searchSlot=$('[data-node-id="9099:16652"]');searchSlot.style.visibility='hidden';
 const search=document.createElement('input');search.className='destination-search';search.id='place-search';search.placeholder='搜索景点、商圈或地址';search.setAttribute('aria-label','搜索景点、商圈或地址');search.autocomplete='off';search.type='search';root.append(search);
 const empty=document.createElement('div');empty.className='destination-empty';empty.hidden=true;empty.setAttribute('role','status');empty.innerHTML='<p>没有找到相关地点</p><small>试试景点名称、商圈或地址</small>';root.append(empty);
 search.addEventListener('input',()=>renderDestinationRows(search.value));search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search.blur()}});
 const close=$('[data-node-id="I9099:16657;288:8942"]');makePickerAction(close,'关闭目的地选择',cancelDestinationSheet);
 mask.setAttribute('aria-hidden','true');mask.onclick=cancelDestinationSheet;
 const confirm=$('[data-node-id="9099:16855"]');makePickerAction(confirm,'确定选择',confirmDestinationSheet);
 if(returnTo==='origin'){$('[data-node-id="I9099:16657;288:8424"]').textContent='选择出发点';$('[data-node-id="9099:16690"]').textContent='选择一个地点作为出发点'}
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
