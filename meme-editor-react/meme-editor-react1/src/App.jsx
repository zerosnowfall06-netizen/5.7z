import React, { useCallback, useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ImagePlus, Type, Smile, SlidersHorizontal, Layers3, Upload, Download, Undo2, Redo2, Trash2, Copy, ArrowUp, ArrowDown, Plus, RotateCcw, Check, Sparkles, Image, FileText, Menu, X, Move, Info } from 'lucide-react';

const W = 900, H = 600;
const initial = () => ({ bg: 'sunset', image: null, elements: [
  { id: 'intro-1', type: 'text', text: 'WHEN THE CODE WORKS', x: 450, y: 74, size: 53, font: 'Impact', color: '#ffffff', opacity: 1, rotation: 0, stroke: true, align: 'center' },
  { id: 'intro-2', type: 'text', text: 'ON THE FIRST TRY 😎', x: 450, y: 523, size: 54, font: 'Impact', color: '#ffffff', opacity: 1, rotation: 0, stroke: true, align: 'center' }
], filter: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 } });
const BG = [ { id: 'sunset', label: 'Sunset', colors: ['#f7b16b','#e66f96','#6e5baf'] }, { id: 'ocean', label: 'Ocean', colors: ['#32c8df','#0d7cb3','#162f68'] }, { id: 'night', label: 'Night', colors: ['#252c55','#18172b','#080914'] }, { id: 'mint', label: 'Mint', colors: ['#c9fff1','#79cabe','#277c98'] }, { id: 'plain', label: 'White', colors: ['#ffffff','#e9eef7','#cdd8e7'] } ];
const EMOJIS = ['😂','🤣','😭','😎','🔥','💀','✨','❤️','🤯','👀','👍','💯','🎉','🐱','❄️','🚀','🎮','☕','🫠','⭐'];
const uid = () => (globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random()}`);
const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
const loadImage = src => new Promise((resolve,reject) => { const img = new window.Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=src; });
function renderScene(canvas, doc, images = {}) {
  if (!canvas) return;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const preset=BG.find(x=>x.id===doc.bg)||BG[0];
  const g=ctx.createLinearGradient(0,0,W,H); preset.colors.forEach((c,i)=>g.addColorStop(i/(preset.colors.length-1),c));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.globalAlpha=.2;
  ctx.fillStyle='#ffffff';
  ctx.beginPath(); ctx.arc(720,195,140,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(120,530,195,0,Math.PI*2); ctx.fill();
  ctx.restore();
  if (doc.image && images[doc.image]) {
    const im=images[doc.image];
    const ratio=Math.max(W/im.naturalWidth,H/im.naturalHeight); const iw=im.naturalWidth*ratio,ih=im.naturalHeight*ratio;
    ctx.save(); ctx.filter=`brightness(${doc.filter.brightness}%) contrast(${doc.filter.contrast}%) saturate(${doc.filter.saturate}%) grayscale(${doc.filter.grayscale}%) sepia(${doc.filter.sepia}%)`;
    ctx.drawImage(im,(W-iw)/2,(H-ih)/2,iw,ih);ctx.restore();
  }
  for(const el of doc.elements) {
    ctx.save();ctx.globalAlpha=el.opacity;ctx.translate(el.x,el.y);ctx.rotate(el.rotation*Math.PI/180);
    if(el.type==='text') {
      const lines=(el.text||' ').split('\n');
      ctx.font=`${el.size}px ${el.font==='Impact'?'Impact, Anton, sans-serif':el.font==='Serif'?'Georgia, serif':el.font==='Mono'?'monospace':'Arial, sans-serif'}`;
      ctx.textAlign=el.align||'center';ctx.textBaseline='middle';ctx.lineJoin='round';
      const lineH=el.size*1.12;
      lines.forEach((line,i)=>{ const yy=(i-(lines.length-1)/2)*lineH; if(el.stroke){ctx.strokeStyle='#101323';ctx.lineWidth=Math.max(3,el.size*.12);ctx.strokeText(line,0,yy,840);}ctx.fillStyle=el.color;ctx.fillText(line,0,yy,840); });
    } else if(el.type==='emoji') {ctx.font=`${el.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(el.text,0,0);}
    ctx.restore();
  }
}
function bounds(el,ctx) {
 if(el.type==='emoji')return {w:el.size*1.2,h:el.size*1.25};
 ctx.font=`${el.size}px ${el.font==='Impact'?'Impact':el.font==='Serif'?'Georgia':el.font==='Mono'?'monospace':'Arial'}`;
 const lines=(el.text||' ').split('\n'); return {w:Math.min(850,Math.max(60,...lines.map(t=>ctx.measureText(t).width))+16),h:lines.length*el.size*1.12+10};
}
function App(){
 const [doc,setDoc]=useState(initial);const [selected,setSelected]=useState('intro-1');
 const [tab,setTab]=useState('text'); const [history,setHistory]=useState([]);const [future,setFuture]=useState([]);
 const canvasRef=useRef(null);const imageCache=useRef({});const drag=useRef(null); const fileRef=useRef(null); const [mobileNav,setMobileNav]=useState(false); const [notice,setNotice]=useState('');
 const item=doc.elements.find(e=>e.id===selected);
 const commit=useCallback(mutator=>{setDoc(prev=>{const next=typeof mutator==='function'?mutator(prev):mutator;setHistory(h=>[...h.slice(-49),prev]);setFuture([]);return next;});},[]);
 const update=patch=>{if(!item)return;commit(d=>({...d,elements:d.elements.map(e=>e.id===selected?{...e,...patch}:e)}));};
 const undo=()=>{if(history.length===0)return;const old=history.at(-1);setHistory(h=>h.slice(0,-1));setFuture(f=>[...f,doc]);setDoc(old);};
 const redo=()=>{if(future.length===0)return;const next=future.at(-1);setFuture(f=>f.slice(0,-1));setHistory(h=>[...h,doc]);setDoc(next);};
 useEffect(()=>{let cancelled=false;if(!doc.image){renderScene(canvasRef.current,doc,imageCache.current);return;}
 if(imageCache.current[doc.image]){renderScene(canvasRef.current,doc,imageCache.current);return;}
 loadImage(doc.image).then(im=>{if(!cancelled){imageCache.current[doc.image]=im;renderScene(canvasRef.current,doc,imageCache.current);}}).catch(()=>setNotice('โหลดภาพไม่สำเร็จ'));
 return()=>{cancelled=true};},[doc]);
 useEffect(()=>{function keys(e){const mod=e.ctrlKey||e.metaKey;const tag=e.target?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();}else if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}else if(e.key==='Delete'&&selected){e.preventDefault();remove();}}window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);});
 const addText=()=>{const id=uid();commit(d=>({...d,elements:[...d.elements,{id,type:'text',text:'YOUR MEME TEXT',x:W/2,y:H/2,size:55,font:'Impact',color:'#ffffff',opacity:1,rotation:0,stroke:true,align:'center'}]}));setSelected(id);setTab('text');};
 const addEmoji=text=>{const id=uid();commit(d=>({...d,elements:[...d.elements,{id,type:'emoji',text,x:W/2,y:H/2,size:100,opacity:1,rotation:0}]}));setSelected(id);};
 const remove=()=>{if(!selected)return;commit(d=>({...d,elements:d.elements.filter(e=>e.id!==selected)}));setSelected(null);};
 const duplicate=()=>{if(!item)return;const id=uid();commit(d=>({...d,elements:[...d.elements,{...item,id,x:clamp(item.x+30,0,W),y:clamp(item.y+30,0,H)}]}));setSelected(id);};
 const moveLayer=(delta)=>{if(!item)return;commit(d=>{const arr=[...d.elements],i=arr.findIndex(e=>e.id===selected),j=clamp(i+delta,0,arr.length-1);[arr[i],arr[j]]=[arr[j],arr[i]];return {...d,elements:arr};});};
 const fileChange=async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){setNotice('กรุณาเลือกไฟล์ภาพ');return;}if(file.size>12*1024*1024){setNotice('รองรับภาพไม่เกิน 12 MB');return;}const reader=new FileReader();reader.onload=()=>{commit(d=>({...d,image:String(reader.result)}));setTab('filters');setNotice('อัปโหลดรูปสำเร็จ');};reader.onerror=()=>setNotice('ไม่สามารถอ่านไฟล์ได้');reader.readAsDataURL(file);e.target.value='';};
 const exportFile=async format=>{try{let canvas=canvasRef.current; if(doc.image&&!imageCache.current[doc.image]){imageCache.current[doc.image]=await loadImage(doc.image);}const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;renderScene(tmp,doc,imageCache.current);const data=tmp.toDataURL('image/png');if(format==='png'){const a=document.createElement('a');a.href=data;a.download='my-meme.png';a.click();}else {const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:[150,100]});pdf.addImage(data,'PNG',0,0,150,100);pdf.save('my-meme.pdf');}setNotice(`ดาวน์โหลด ${format.toUpperCase()} แล้ว`);}catch(err){setNotice(`ส่งออกไม่สำเร็จ: ${err.message}`);}};
 const handleDown=e=>{const canvas=canvasRef.current;const rect=canvas.getBoundingClientRect();const x=(e.clientX-rect.left)*W/rect.width,y=(e.clientY-rect.top)*H/rect.height;const ctx=canvas.getContext('2d');const hit=[...doc.elements].reverse().find(el=>{const b=bounds(el,ctx);const dx=x-el.x,dy=y-el.y,a=-el.rotation*Math.PI/180;const rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);return Math.abs(rx)<b.w/2+12&&Math.abs(ry)<b.h/2+12;});setSelected(hit?.id||null);if(hit){drag.current={id:hit.id,startX:x,startY:y,originX:hit.x,originY:hit.y,before:doc,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}};
 const handleMove=e=>{if(!drag.current)return;const rect=canvasRef.current.getBoundingClientRect();const x=(e.clientX-rect.left)*W/rect.width,y=(e.clientY-rect.top)*H/rect.height;const v=drag.current;const nx=clamp(v.originX+x-v.startX,0,W),ny=clamp(v.originY+y-v.startY,0,H);if(Math.abs(nx-v.originX)+Math.abs(ny-v.originY)>1)v.moved=true;setDoc(d=>({...d,elements:d.elements.map(el=>el.id===v.id?{...el,x:nx,y:ny}:el)}));};
 const handleUp=()=>{if(drag.current?.moved){setHistory(h=>[...h.slice(-49),drag.current.before]);setFuture([]);}drag.current=null;};
 const selectedBounds=item&&canvasRef.current?bounds(item,canvasRef.current.getContext('2d')):null;
 const selectTab=t=>{setTab(t);setMobileNav(false);};
 return <div className="app">
 <header className="header"><div className="brand"><div className="brand-icon"><Sparkles size={20}/></div><span>Meme<span className="brand-accent">Lab</span></span><span className="brand-chip">STUDIO</span></div><div className="header-center"><span className="live-dot"/> React Meme Editor <span className="muted">/ Untitled Project</span></div><div className="head-actions"><button className="secondary top-only" onClick={()=>{if(window.confirm('เริ่มโปรเจกต์ใหม่และล้างงานปัจจุบัน?')){commit(initial());setSelected('intro-1');}}}><RotateCcw size={16}/> New</button><button className="primary" onClick={()=>exportFile('png')}><Download size={16}/> Export PNG</button><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X/>:<Menu/>}</button></div></header>
 <div className="layout"><nav className={`rail ${mobileNav?'open':''}`}>{[[ImagePlus,'image','Images'],[Type,'text','Text'],[Smile,'stickers','Stickers'],[SlidersHorizontal,'filters','Filters'],[Layers3,'layers','Layers']].map(([Icon,key,label])=><button key={key} className={`rail-btn ${tab===key?'on':''}`} onClick={()=>selectTab(key)}><Icon size={21}/><span>{label}</span></button>)}</nav>
 <aside className={`panel ${mobileNav?'open':''}`}>
 {tab==='image'&&<><div className="panel-title"><h2>Images</h2><p>Choose a background or upload your own</p></div><button className="upload" onClick={()=>fileRef.current?.click()}><Upload size={22}/><strong>Upload image</strong><span>JPG, PNG, GIF, WebP up to 12 MB</span></button><div className="subhead">Background templates</div><div className="backgrounds">{BG.map(bg=><button key={bg.id} className={`bg-option ${doc.bg===bg.id?'chosen':''}`} onClick={()=>commit(d=>({...d,bg:bg.id,image:null}))}><span className="bg-art" style={{background:`linear-gradient(135deg,${bg.colors.join(',')})`}}/>{bg.label}{doc.bg===bg.id&&<Check size={14}/>}</button>)}</div>{doc.image&&<button className="outline full" onClick={()=>commit(d=>({...d,image:null}))}>Remove uploaded image</button>}</>}
 {tab==='text'&&<><div className="panel-title"><h2>Text editor</h2><p>Make your punchline stand out</p></div><button className="add-btn" onClick={addText}><Plus size={17}/> Add new text</button>{item?.type==='text'?<><div className="subhead">Text content</div><textarea className="text-area" rows={3} value={item.text} onChange={e=>update({text:e.target.value})}/><div className="subhead">Font family</div><select value={item.font} onChange={e=>update({font:e.target.value})}>{['Impact','Arial','Serif','Mono'].map(font=><option key={font}>{font}</option>)}</select><div className="field-row"><label>Font size</label><span>{item.size}px</span></div><input type="range" min="16" max="130" value={item.size} onChange={e=>update({size:Number(e.target.value)})}/><div className="field-row"><label>Text color</label><input className="color-input" type="color" value={item.color} onChange={e=>update({color:e.target.value})}/></div><label className="checkbox"><input type="checkbox" checked={item.stroke} onChange={e=>update({stroke:e.target.checked})}/> Dark outline</label><div className="field-row"><label>Text alignment</label><select className="small-select" value={item.align||'center'} onChange={e=>update({align:e.target.value})}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div></>:<div className="hint">Select a text layer on the canvas to edit it.</div>}</>}
 {tab==='stickers'&&<><div className="panel-title"><h2>Stickers</h2><p>Click an emoji to add it to your design</p></div><div className="subhead">Popular emoji</div><div className="emoji-grid">{EMOJIS.map((emoji,i)=><button key={i} title={`Add ${emoji}`} onClick={()=>addEmoji(emoji)}>{emoji}</button>)}</div><div className="hint">Click a sticker on the canvas to change its size, rotation and opacity.</div></>}
 {tab==='filters'&&<><div className="panel-title"><h2>Photo filters</h2><p>Tune the mood of your image</p></div>{[['brightness','Brightness',0,200],['contrast','Contrast',0,200],['saturate','Saturation',0,200],['grayscale','Grayscale',0,100],['sepia','Sepia',0,100]].map(([key,name,min,max])=><div className="filter-line" key={key}><div className="field-row"><label>{name}</label><span>{doc.filter[key]}%</span></div><input type="range" min={min} max={max} value={doc.filter[key]} onChange={e=>commit(d=>({...d,filter:{...d.filter,[key]:Number(e.target.value)}}))}/></div>)}<button className="outline full" onClick={()=>commit(d=>({...d,filter:initial().filter}))}><RotateCcw size={15}/> Reset filters</button><div className="hint">Filters affect uploaded images. Template gradients remain unchanged.</div></>}
 {tab==='layers'&&<><div className="panel-title"><h2>Layers</h2><p>Manage stacking and visibility</p></div><div className="layer-list">{[...doc.elements].reverse().map((el,i)=><button key={el.id} className={`layer ${selected===el.id?'active':''}`} onClick={()=>setSelected(el.id)}><span className="layer-icon">{el.type==='text'?<Type size={18}/>:<span>{el.text}</span>}</span><span className="layer-name">{el.type==='text'?el.text.replace(/\n/g,' ').slice(0,22):`Emoji ${el.text}`}</span><span className="layer-num">{doc.elements.length-i}</span></button>)}</div><div className="row-gap"><button className="outline" disabled={!item} onClick={()=>moveLayer(1)}><ArrowUp size={15}/> Forward</button><button className="outline" disabled={!item} onClick={()=>moveLayer(-1)}><ArrowDown size={15}/> Backward</button></div><div className="row-gap"><button className="outline" disabled={!item} onClick={duplicate}><Copy size={15}/> Duplicate</button><button className="outline danger" disabled={!item} onClick={remove}><Trash2 size={15}/> Delete</button></div></>}
 <div className="panel-bottom"><div className="mini-tip"><Info size={17}/><span>Tip: Drag text and stickers directly on the canvas.</span></div></div>
 </aside>
 <main className="work"><div className="work-top"><div><span className="breadcrumb">WORKSPACE <span>/</span> CANVAS</span><h1>Your masterpiece <span>✦</span></h1></div><div className="history-actions"><button className="icon-btn" title="Undo (Ctrl+Z)" disabled={!history.length} onClick={undo}><Undo2 size={19}/></button><button className="icon-btn" title="Redo (Ctrl+Y)" disabled={!future.length} onClick={redo}><Redo2 size={19}/></button><div className="zoom-chip">900 × 600</div></div></div><div className="canvas-region"><div className="canvas-shell"><div className="canvas-inner"><canvas ref={canvasRef} width={W} height={H} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp} aria-label="Meme editing canvas"/>{item&&selectedBounds&&<div className="selection" style={{left:`${item.x/W*100}%`,top:`${item.y/H*100}%`,width:`${selectedBounds.w/W*100}%`,height:`${selectedBounds.h/H*100}%`,transform:`translate(-50%,-50%) rotate(${item.rotation}deg)`}}><i className="corner c1"/><i className="corner c2"/><i className="corner c3"/><i className="corner c4"/></div>}</div></div><div className="canvas-help"><Move size={16}/> Click to select · Drag to move · Use side panel to customize</div></div>
 {item&&<div className="bottom-toolbar"><div className="element-label">{item.type==='text'?<Type size={16}/>:<Smile size={16}/>} {item.type==='text'?'Text layer':'Sticker layer'} selected</div><div className="toolbar-controls"><label>Size <input className="compact-range" type="range" min="18" max="170" value={item.size} onChange={e=>update({size:Number(e.target.value)})}/><span>{item.size}px</span></label><label>Opacity <input className="compact-range" type="range" min="10" max="100" value={Math.round(item.opacity*100)} onChange={e=>update({opacity:Number(e.target.value)/100})}/><span>{Math.round(item.opacity*100)}%</span></label><label>Rotate <input className="compact-range" type="range" min="-180" max="180" value={item.rotation} onChange={e=>update({rotation:Number(e.target.value)})}/><span>{item.rotation}°</span></label><button className="icon-btn delete" title="Delete selection" onClick={remove}><Trash2 size={17}/></button></div></div>}
 <div className="footerline"><span><span className="live-dot"/> All changes are local to this tab</span><span>Made with React + Canvas</span></div></main>
 <aside className="rightbar"><div className="right-title"><Layers3 size={18}/> Design overview</div><div className="stat-box"><span>Canvas size</span><strong>900 × 600 px</strong></div><div className="stat-box"><span>Objects</span><strong>{doc.elements.length} layers</strong></div><div className="section-rule"/><div className="right-title">Export your meme</div><p className="aside-copy">Save your creation in high quality and share it anywhere.</p><button className="export-option" onClick={()=>exportFile('png')}><div className="export-icon"><Image size={20}/></div><div><b>PNG image</b><span>High-quality image</span></div><Download size={17}/></button><button className="export-option" onClick={()=>exportFile('pdf')}><div className="export-icon violet"><FileText size={20}/></div><div><b>PDF document</b><span>Print-ready download</span></div><Download size={17}/></button><div className="quick-guide"><Sparkles size={18}/><b>Quick start</b><p>1. Pick a template or upload image<br/>2. Add text and emoji stickers<br/>3. Customize colors and effects<br/>4. Export PNG or PDF</p></div></aside></div>
 <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={fileChange}/>
 {notice&&<div className="toast" role="status" onClick={()=>setNotice('')}><Check size={17}/>{notice}<X size={14}/></div>}
 </div>;
}
export default App;
