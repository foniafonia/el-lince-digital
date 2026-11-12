(function(){
  var Q=new URLSearchParams(location.search);
  function cuenta(k){ if(window.linceCuenta) window.linceCuenta(k); }
  /* ---- ajustes (se guardan solo en este aparato) ---- */
  var A={voz:true,volumen:'normal',busca:false,aoido:false,dibujos:'emoji',contraste:''};
  try{ var g=JSON.parse(localStorage.getItem('lince-ajustes')||'{}'); for(var k in g) if(k in A) A[k]=g[k]; }catch(e){}
  if(Q.get('modo')==='audio') A.aoido=true;
  if(Q.get('dibujos')==='picto'||Q.get('dibujos')==='emoji') A.dibujos=Q.get('dibujos');
  window.lxAjustes=function(){return A}; window.lxSelActiva=function(){return !!SEL};
  function guarda(){ try{localStorage.setItem('lince-ajustes',JSON.stringify(A));}catch(e){} aplica(); }
  function aplica(){ document.body.classList.toggle('lx-aoido',!!A.aoido||enPares()); }
  /* ---- voz Ximena (voz/*.mp3) ---- */
  function slug(s){ return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  var au=null, cola=0;
  function di(clave,sinPrefijo){
    if(!A.voz) return;
    try{
      if(au){au.pause();}
      var n=++cola;
      var reproduce=function(c){ var a=new Audio('voz/'+c+'.mp3'); a.volume=A.volumen==='alto'?1:.65; au=a; return a.play(); };
      if(A.busca && !sinPrefijo){
        var p=new Audio('voz/_busca.mp3'); p.volume=A.volumen==='alto'?1:.65; au=p;
        p.onended=function(){ if(n===cola) reproduce(clave).catch(function(){}); };
        p.play().catch(function(){});
      } else reproduce(clave).catch(function(){});
    }catch(e){}
  }
  var cartaNombre=function(){ var n=document.getElementById('targetName'); return n?n.textContent:''; };
  function diObjetivo(){ var t=cartaNombre(); if(t){ if(PM==='pareja'&&enPares()){ var g=parejaEnTablero(t); if(g) t=g; } di(slug(t)); } }

  /* ---- pictos propios y «Crea tu Lince» ---- */
  var P=window.LX_PICTO||{}; var SEL=null;
  (function(){ var s=Q.get('sel'); if(s){ SEL=s.split('.').map(function(x){return parseInt(x,36)}).filter(function(n){return n>=0}); if(!SEL.length) SEL=null; } })();
  function DB(){ return (typeof itemDatabase!=='undefined')?itemDatabase:[]; }
  /* ---- modo 👂 Pares mínimos: parejas que suenan casi igual; siempre con pictos ---- */
  /* cada pareja lleva el tipo de contraste: son = sonoridad en oclusivas, rl = R/L, modo = modo de articulación, voc = vocal; '' = solo en «Todos» */
  var PARES=[['rana','lana','rl'],['rata','lata','rl'],['rey','ley','rl'],['pata','bata','son'],['bollo','pollo','son'],['pito','pato','voc'],['peso','beso','son'],['gasa','casa','son'],['gol','col','son'],['garra','jarra','modo'],['duna','luna','modo'],['tos','dos','son'],['fuente','puente','modo'],['mano','mono','voc'],['pelo','palo','voc'],['bota','bata','voc'],['sapo','sopa','']];
  var TIPOS=[
    {k:'son',n:'Sonoridad en oclusivas',d:'p/b, t/d, k/g: peso-beso, tos-dos, gol-col…'},
    {k:'rl',n:'R / L',d:'rana-lana, rata-lata, rey-ley (R fuerte al principio)'},
    {k:'modo',n:'Modo de articulación',d:'f/p fuente-puente, g/j garra-jarra, d/l duna-luna'},
    {k:'punto',n:'Punto de articulación',d:'p/t, t/k, b/d…'},
    {k:'voc',n:'Vocales',d:'pito-pato, mano-mono, pelo-palo, bota-bata'}
  ];
  function cuantas(k){ return PARES.filter(function(p){return p[2]===k}).length; }
  var CON=(Q.get('contraste')||A.contraste||'').split('.').filter(function(k){ return TIPOS.some(function(t){return t.k===k}) && cuantas(k)>0; });
  function paresActivos(){ return CON.length ? PARES.filter(function(p){return CON.indexOf(p[2])>-1}) : PARES; }
  function enPares(){ try{ return state.currentFilter==='pares'; }catch(e){ return false; } }
  function tableroPares(db){
    var ps=paresActivos().slice().sort(function(){return Math.random()-.5}).slice(0,8), vistos={}, r=[];
    ps.forEach(function(p){ p.slice(0,2).forEach(function(n){ if(vistos[n]) return; var it=db.find(function(x){return x.name===n}); if(it){ vistos[n]=1; r.push(it); } }); });
    return r;
  }
  function modoPicto(){ return A.dibujos==='picto' || enPares(); }
  var PM='igual';
  function parejaEnTablero(n){ var en={}, c=[]; try{ state.items.forEach(function(i){ en[i.name]=1; }); }catch(e){} paresActivos().forEach(function(p){ if(p[0]===n&&en[p[1]]) c.push(p[1]); if(p[1]===n&&en[p[0]]) c.push(p[0]); }); return c[0]||null; }
  var pm=document.createElement('div'); pm.className='lx-ajp'; pm.hidden=true;
  pm.innerHTML='<div class="lx-caja" role="dialog" aria-label="Pares mínimos"><h2>👂 Pares mínimos</h2>'+
   '<p class="lx-peque">Palabras que suenan casi igual: peso y beso, rana y lana… El tablero se llena de parejas. No se ve la palabra, solo se oye.</p>'+
   '<fieldset class="lx-con"><legend>1. ¿Qué contraste se trabaja?</legend>'+
   '<p class="lx-peque">Marca uno o varios. Si no marcas ninguno, salen todas las parejas (entrenamiento general).</p>'+
   TIPOS.map(function(t){ var c=cuantas(t.k), poco=c<3;
     return '<label class="lx-con-op'+(c?'':' lx-con-no')+'"><input type="checkbox" value="'+t.k+'"'+(c?'':' disabled')+(CON.indexOf(t.k)>-1?' checked':'')+'> <b>'+t.n+'</b> <span class="lx-con-n">'+c+(c===1?' pareja':' parejas')+'</span><br><small>'+(c?t.d:'Todavía no hay parejas de este tipo.')+(c&&poco?' Solo '+c+': el tablero sale corto.':'')+'</small></label>'; }).join('')+
   '<p class="lx-peque" id="lxConRes"></p></fieldset>'+
   '<p class="lx-peque" style="font-weight:800;margin-top:12px">2. Elige cómo jugar:</p>'+
   '<button type="button" class="lx-prim lx-modo" data-m="igual"><b>Busca la que oyes</b><br><small>Se oye «peso» y tocas peso. Su gemela, beso, está en el tablero para despistar.</small></button>'+
   '<button type="button" class="lx-prim lx-modo" data-m="pareja"><b>Busca su pareja</b><br><small>Se oye «peso» y tocas beso. Como una rima.</small></button>'+
   '<div class="lx-botones"><button type="button" id="lxPmNo">Cancelar</button></div></div>';
  function leeCon(){ CON=[].slice.call(pm.querySelectorAll('.lx-con input:checked')).map(function(i){return i.value}); A.contraste=CON.join('.'); guarda(); var r=document.getElementById('lxConRes'); if(r){ var n=paresActivos().length; r.textContent=CON.length?('Saldrán '+n+' parejas.'):('Saldrán las '+PARES.length+' parejas (todas).'); } }
  function juegaPares(m){
    leeCon(); PM=m; pm.hidden=true; SEL=null;
    var pill=document.querySelector('.category-pill[data-filter="pares"]'); if(!pill) return;
    window.__lxPasar=true; pill.click(); window.__lxPasar=false;
    velo.hidden=true; cuenta('pares_'+m); cuenta('pares_con_'+(CON.join('_')||'todos')); aplica(); pintaTodo();
  }
  var f0=window.filterItems;
  if(typeof f0==='function'){
    window.filterItems=function(){
      var db=DB(), r;
      if(enPares()){ return tableroPares(db); }
      if(SEL){ r=db.filter(function(it,i){return SEL.indexOf(i)>-1}); } else r=f0().filter(function(it){return !it.soloPar});
      if(modoPicto()) r=r.filter(function(it){return !!P[it.name]});
      return r;
    };
  }
  function pinta(span){
    if(!span) return;
    var e=span.textContent.trim();
    if(!modoPicto()){ span.classList.remove('lx-pic'); span.style.backgroundImage=''; return; }
    var it=DB().find(function(x){return x.emoji===e && P[x.name]});
    if(it){ span.classList.add('lx-pic'); span.style.backgroundImage='url(picto/'+P[it.name]+'.webp)'; }
  }
  function pintaTodo(){ document.querySelectorAll('.cell-emoji').forEach(pinta); pinta(document.getElementById('targetEmoji')); }
  function dibujoHTML(it,modo){ return (modo==='picto' && P[it.name]) ? '<span class="lx-d lx-pic" style="background-image:url(picto/'+P[it.name]+'.webp)"></span>' : '<span class="lx-d">'+it.emoji+'</span>'; }
  var S=new Set(SEL||[]);
  function sonidos(){ var s={}; DB().forEach(function(it){ (it.phonemes||[]).forEach(function(p){s[p]=1}); }); return Object.keys(s).sort(); }
  var crea=document.createElement('div'); crea.className='lx-ajp'; crea.hidden=true;
  function montaCrea(){
    crea.innerHTML='<div class="lx-caja lx-ancha" role="dialog" aria-label="Crea tu Lince"><h2>✏️ Crea tu propio Lince</h2>'+
     '<p class="lx-peque">Elige las palabras que quieres que salgan en el tablero. Puedes jugar tú o mandar el enlace.</p>'+
     '<div class="lx-filtros"><label>Dibujos <select id="lxCDib"><option value="emoji">Emojis</option><option value="picto">Pictos de Fönia</option></select></label>'+
     '<label>Sonido <select id="lxCSon"><option value="">Todos</option>'+sonidos().map(function(s){return '<option value="'+s+'">/'+s.toUpperCase()+'/</option>'}).join('')+'</select></label>'+
     '<label>Tipo <select id="lxCCat"><option value="">Todos</option><option value="animales">Animales</option><option value="objetos">Objetos</option><option value="comida">Comida</option><option value="transportes">Transportes</option><option value="naturaleza">Naturaleza</option></select></label></div>'+
     '<input id="lxBus" type="search" placeholder="Buscar una palabra…" autocomplete="off">'+
     '<div class="lx-cuenta"><b id="lxN">0</b> elegidas <button type="button" id="lxTodas">Marcar las que se ven</button><button type="button" id="lxNinguna">Quitar todas</button></div>'+
     '<div class="lx-rejilla" id="lxRej"></div>'+
     '<p class="lx-peque" id="lxAviso"></p>'+
     '<div class="lx-botones"><button type="button" class="lx-prim" id="lxJugarSel">▶ Jugar con mi Lince</button><button type="button" id="lxCopiar">🔗 Copiar enlace</button><button type="button" id="lxImpC">🖨️ Imprimir</button><button type="button" id="lxPideC">💬 ¿Qué picto te falta?</button><button type="button" id="lxCerrarC">Cerrar</button></div></div>';
    var $=function(i){return crea.querySelector('#'+i)};
    $('lxCDib').value=A.dibujos;
    function avisos(){
      var modo=$('lxCDib').value, av=[];
      if(modo==='picto') av.push('Pictos de Fönia: hechos con IA, pendientes de revisión de una logopeda (CC0). Hay dibujo para '+Object.keys(P).length+' palabras.');
      if(S.size>37) av.push('El tablero tiene 37 casillas: saldrán 37 de tus palabras, al azar, en cada partida.');
      if(S.size>0 && S.size<4) av.push('Elige al menos 4 palabras.');
      $('lxN').textContent=S.size; $('lxAviso').textContent=av.join(' ');
    }
    function lista(){
      var q=$('lxBus').value.trim().toLowerCase(), so=$('lxCSon').value, ca=$('lxCCat').value, modo=$('lxCDib').value, h='';
      var db=DB(); var vis=0;
      db.forEach(function(it,i){
        if(modo==='picto' && !P[it.name]) return;
        if(it.soloPar && modo!=='picto') return;
        if(q && it.name.toLowerCase().indexOf(q)<0) return;
        if(so && !(it.phonemes&&it.phonemes.indexOf(so)>-1)) return;
        if(ca && it.cat!==ca) return;
        vis++;
        h+='<label class="lx-it'+(S.has(i)?' on':'')+'"><input type="checkbox" data-i="'+i+'"'+(S.has(i)?' checked':'')+'>'+dibujoHTML(it,modo)+'<b>'+it.name+'</b></label>';
      });
      $('lxRej').innerHTML=h||'<p class="lx-peque">No hay palabras con ese filtro.</p>';
      $('lxN').textContent=S.size;
      avisos();
    }
    crea.lista=lista;
    crea.addEventListener('change',function(e){ var c=e.target; if(c.matches&&c.matches('input[type=checkbox][data-i]')){ var i=+c.getAttribute('data-i'); if(c.checked) S.add(i); else S.delete(i); c.parentNode.classList.toggle('on',c.checked); avisos(); } });
    ['lxBus','lxCSon','lxCCat'].forEach(function(id){ $(id).addEventListener(id==='lxBus'?'input':'change',lista); });
    $('lxCDib').addEventListener('change',function(){ lista(); });
    $('lxTodas').onclick=function(){ crea.querySelectorAll('#lxRej input[data-i]').forEach(function(c){ S.add(+c.getAttribute('data-i')); }); lista(); };
    $('lxNinguna').onclick=function(){ S.clear(); lista(); };
    $('lxCerrarC').onclick=function(){ crea.hidden=true; };
    $('lxPideC').onclick=abrePide;
    $('lxImpC').onclick=function(){ if(S.size<4){ $('lxAviso').textContent='Elige al menos 4 palabras para imprimir.'; return; } preImprime(function(){return tableroDe(itemsCrea())},$('lxCDib').value); };
    crea.onclick=function(e){ if(e.target===crea) crea.hidden=true; };
    function url(){ var u=location.origin+location.pathname+'?sel='+Array.from(S).sort(function(a,b){return a-b}).map(function(n){return n.toString(36)}).join('.')+'&dibujos='+$('lxCDib').value; var c=Q.get('c'); if(c) u+='&c='+encodeURIComponent(c); return u; }
    $('lxCopiar').onclick=function(){
      if(S.size<4){ $('lxAviso').textContent='Elige al menos 4 palabras para crear el enlace.'; return; }
      var u=url(); cuenta('crea_enlace');
      var ok=function(){ $('lxAviso').textContent='Enlace copiado. Ya lo puedes pegar en WhatsApp.'; };
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok,function(){ window.prompt('Copia este enlace:',u); }); else window.prompt('Copia este enlace:',u);
    };
    $('lxJugarSel').onclick=function(){
      if(S.size<4){ $('lxAviso').textContent='Elige al menos 4 palabras.'; return; }
      SEL=Array.from(S); A.dibujos=$('lxCDib').value; guarda(); cuenta('crea_jugar'); crea.hidden=true; empieza();
    };
    lista();
  }
  function abreCrea(){ if(!crea.firstChild) montaCrea(); else { crea.querySelector('#lxCDib').value=A.dibujos; crea.lista(); } crea.hidden=false; cuenta('crea_abrir'); }
  function empieza(){ velo.hidden=true; try{ if(typeof resetGame==='function') resetGame(); }catch(e){} pintaTodo(); }

  /* ---- buzón: «¿Qué picto te falta?» (contador anónimo, sin nombres) ---- */
  var pide=document.createElement('div'); pide.className='lx-ajp'; pide.hidden=true;
  var enviados={}; try{ enviados=JSON.parse(localStorage.getItem('lince-pedidos')||'{}'); }catch(e){}
  function guardaPed(){ try{localStorage.setItem('lince-pedidos',JSON.stringify(enviados));}catch(e){} }
  function sinPicto(){ var v={},r=[]; DB().forEach(function(it){ if(!P[it.name] && !v[it.name]){ v[it.name]=1; r.push(it);} }); return r; }
  function montaPide(){
    var chips=sinPicto().map(function(it){ var s=slug(it.name); return '<button type="button" class="lx-chip'+(enviados[s]?' ya':'')+'" data-s="'+s+'">'+it.emoji+' '+it.name+(enviados[s]?' ✓':'')+'</button>'; }).join('');
    pide.innerHTML='<div class="lx-caja lx-ancha" role="dialog" aria-label="Qué picto te falta"><h2>💬 ¿Qué picto te falta?</h2>'+
     '<p class="lx-peque">Toca las palabras que quieres ver con picto propio. Las que más pidan, las dibujamos antes. No hace falta ningún dato tuyo.</p>'+
     '<div class="lx-chips" id="lxChips">'+chips+'</div>'+
     '<p class="lx-peque" style="margin-top:12px"><b>¿Otra palabra?</b> Escríbela aquí (solo la palabra, sin nombres de personas):</p>'+
     '<div class="lx-otra"><input id="lxOtra" type="text" maxlength="24" placeholder="por ejemplo: abrigo" autocomplete="off"><button type="button" id="lxOtraB">Pedir</button></div>'+
     '<p class="lx-peque" id="lxPideMsg"></p>'+
     '<p class="lx-peque">Si quieres contarnos algo más, <a href="https://www.skool.com/logopedia-7339/about" target="_blank" rel="noopener">escríbenos en la comunidad</a>. Cada petición se suma a un contador anónimo.</p>'+
     '<div class="lx-botones"><button type="button" id="lxPideCerrar">Cerrar</button></div></div>';
    var msg=function(t){ pide.querySelector('#lxPideMsg').textContent=t; };
    pide.querySelector('#lxChips').onclick=function(e){ var b=e.target.closest&&e.target.closest('.lx-chip'); if(!b) return; var s=b.getAttribute('data-s'); if(enviados[s]){ msg('Esa ya la has pedido. Gracias.'); return; } enviados[s]=1; guardaPed(); cuenta('pide_'+s); cuenta('pide_total'); b.classList.add('ya'); b.textContent=b.textContent+' ✓'; msg('¡Apuntado! Gracias por ayudarnos a decidir qué dibujar primero.'); };
    pide.querySelector('#lxOtraB').onclick=function(){ var i=pide.querySelector('#lxOtra'); var s=slug(i.value||'').replace(/-/g,'').slice(0,24); if(s.length<3 || /[0-9]/.test(s)){ msg('Escribe una palabra de al menos 3 letras, sin números.'); return; } if(enviados['o_'+s]){ msg('Esa ya la has pedido. Gracias.'); return; } enviados['o_'+s]=1; guardaPed(); cuenta('otra_'+s); cuenta('pide_total'); i.value=''; msg('¡Apuntado: «'+s+'»! Gracias.'); };
    pide.querySelector('#lxPideCerrar').onclick=function(){ pide.hidden=true; };
    pide.onclick=function(e){ if(e.target===pide) pide.hidden=true; };
  }
  function abrePide(){ if(!pide.firstChild) montaPide(); pide.hidden=false; cuenta('pide_abrir'); }

  /* ---- imprimir: hojas a juego con la pantalla (tablero, tablero vacío, fichas y cartas) ---- */
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
  function imgDe(it,modo,cls){ return (modo==='picto' && P[it.name]) ? '<img class="'+cls+'" src="picto/'+P[it.name]+'.webp" alt="">' : '<span class="'+cls+' e">'+it.emoji+'</span>'; }
  function posAnillos(n){
    var cfg=[{c:1,r:0},{c:6,r:.24},{c:12,r:.48},{c:18,r:.72}], pos=[], ri=0;
    cfg.forEach(function(g){
      if(g.c===1){ pos.push({x:50,y:50}); }
      else{ var paso=2*Math.PI/g.c, off=(ri%2===1)?paso/2:0, st=-Math.PI/2+off; for(var i=0;i<g.c;i++){ var an=st+i*paso; pos.push({x:50+g.r*50*Math.cos(an),y:50+g.r*50*Math.sin(an)}); } }
      ri++;
    });
    return pos.slice(0,n);
  }
  function mezcla(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function tableroDe(items){ var it=mezcla(items).slice(0,37), pos=posAnillos(it.length); return it.map(function(x,i){ return {x:pos[i].x,y:pos[i].y,it:x}; }); }
  function tableroActual(){
    var r=[]; try{ var db=state.items; document.querySelectorAll('.board .cell').forEach(function(c){ var e=c.querySelector('.cell-emoji'); if(!e) return; var em=e.textContent.trim(); var it=db.find(function(i){return i.emoji===em}); if(it) r.push({x:parseFloat(c.style.left),y:parseFloat(c.style.top),it:it}); }); }catch(x){}
    return r;
  }
  var OPC={lleno:true,vacio:true,fichas:true,cartas:true,tinta:false};
  try{ var og=JSON.parse(localStorage.getItem('lince-imprimir')||'{}'); for(var ko in og) if(ko in OPC) OPC[ko]=og[ko]; }catch(e){}
  function cab(sub){ return '<header class="lxp-cab"><img class="lxp-lg" src="portada/lince-logo.webp" alt=""><div class="lxp-tt"><b>EL LINCE DIGITAL</b><span>'+sub+'</span></div><img class="lxp-cm" src="portada/colmenia-logo.webp" alt=""></header>'; }
  function pie(modo){ return '<footer class="lxp-pie">Gabinete Fönia · ColmenIA · Más juegos y materiales en la comunidad: skool.com/logopedia-7339 · foniafonia.github.io/el-lince-digital'+(modo==='picto'?' · Pictos propios de Fönia (CC0), hechos con IA':'')+' · Material de apoyo: no sustituye a la logopeda.</footer>'; }
  function disco(celdas){ return '<div class="lxp-aro1"><div class="lxp-aro2"><div class="lxp-disco">'+celdas+'</div></div></div>'; }
  function paginas(tab,modo,o){
    var P1=[], n=tab.length;
    if(o.lleno) P1.push('<section class="lxp-pg">'+cab('Tablero con los dibujos')+'<p class="lxp-ins">Saca una carta, di la palabra en voz alta y busca su dibujo en el tablero.</p>'+disco(tab.map(function(t){ return '<div class="lxp-cel" style="left:'+t.x.toFixed(2)+'%;top:'+t.y.toFixed(2)+'%">'+imgDe(t.it,modo,'lxp-d')+'</div>'; }).join(''))+pie(modo)+'</section>');
    if(o.vacio) P1.push('<section class="lxp-pg">'+cab('Tablero vacío')+'<p class="lxp-ins">Coloca encima las fichas (o dibuja tú) y juega con tus propias palabras.</p>'+disco(tab.map(function(t){ return '<div class="lxp-cel vac" style="left:'+t.x.toFixed(2)+'%;top:'+t.y.toFixed(2)+'%"></div>'; }).join(''))+pie(modo)+'</section>');
    if(o.fichas){ for(var i=0;i<n;i+=48){ P1.push('<section class="lxp-pg">'+cab('Fichas para recortar')+'<p class="lxp-ins">Recórtalas y colócalas sobre el tablero vacío. Tienen el tamaño de las casillas.</p><div class="lxp-fichas">'+tab.slice(i,i+48).map(function(t){ return '<div class="lxp-f">'+imgDe(t.it,modo,'lxp-fd')+'</div>'; }).join('')+'</div>'+pie(modo)+'</section>'); } }
    if(o.cartas){ for(var j=0;j<n;j+=12){ P1.push('<section class="lxp-pg">'+cab('Cartas para recortar')+'<p class="lxp-ins">Recorta por la línea de puntos, mézclalas y ve sacando una.</p><div class="lxp-cartas">'+tab.slice(j,j+12).map(function(t){ return '<div class="lxp-k">'+imgDe(t.it,modo,'lxp-kd')+'<b>'+esc(t.it.name)+'</b></div>'; }).join('')+'</div>'+pie(modo)+'</section>'); } }
    return P1.join('');
  }
  function esperaImg(d,cb){ var imgs=[].slice.call(d.querySelectorAll('img')), pend=imgs.filter(function(i){return !i.complete}).length; if(!pend){ cb(); return; } var t=setTimeout(cb,4000); imgs.forEach(function(i){ if(!i.complete){ var f=function(){ if(--pend<=0){ clearTimeout(t); cb(); } }; i.addEventListener('load',f); i.addEventListener('error',f); } }); }
  function imprime(tab,modo,vista,opc){
    var o=opc||OPC;
    if(modo==='picto'){ tab=tab.filter(function(t){return !!P[t.it.name]}); }
    if(tab.length<4){ alert('Para imprimir hacen falta al menos 4 palabras'+(modo==='picto'?' con picto':'')+'.'); return; }
    if(modo==='picto' && tab.length<37){ var pos=posAnillos(tab.length); tab=tab.map(function(t,i){ return {x:pos[i].x,y:pos[i].y,it:t.it}; }); }
    if(!(o.lleno||o.vacio||o.fichas||o.cartas)){ alert('Elige qué quieres imprimir.'); return; }
    var old=document.getElementById('lxImpr'); if(old) old.remove();
    var d=document.createElement('div'); d.id='lxImpr'; if(o.tinta) d.classList.add('lxp-eco'); if(vista) d.classList.add('lxp-vista');
    d.innerHTML=paginas(tab,modo,o);
    document.body.appendChild(d); cuenta('imprimir'); if(modo==='picto') cuenta('imprimir_picto'); if(o.vacio) cuenta('imprimir_vacio');
    if(!vista){ var fin=function(){ d.remove(); window.removeEventListener('afterprint',fin); }; window.addEventListener('afterprint',fin); esperaImg(d,function(){ setTimeout(function(){ window.print(); },150); }); }
    return d;
  }
  /* ventana «¿Qué imprimir?» */
  var qi=document.createElement('div'); qi.className='lx-ajp'; qi.hidden=true;
  function preImprime(fuente,modo){
    qi.innerHTML='<div class="lx-caja" role="dialog" aria-label="Qué imprimir"><h2>🖨️ ¿Qué quieres imprimir?</h2>'+
      '<div class="lx-fila"><label for="lxqL">Tablero con los dibujos</label><input type="checkbox" id="lxqL"'+(OPC.lleno?' checked':'')+'></div>'+
      '<div class="lx-fila"><label for="lxqV">Tablero vacío<small>Para colocar fichas encima.</small></label><input type="checkbox" id="lxqV"'+(OPC.vacio?' checked':'')+'></div>'+
      '<div class="lx-fila"><label for="lxqF">Fichas pequeñas<small>Del tamaño de las casillas.</small></label><input type="checkbox" id="lxqF"'+(OPC.fichas?' checked':'')+'></div>'+
      '<div class="lx-fila"><label for="lxqC">Cartas con la palabra<small>Redondas, para recortar.</small></label><input type="checkbox" id="lxqC"'+(OPC.cartas?' checked':'')+'></div>'+
      '<div class="lx-fila"><label for="lxqT">Ahorrar tinta<small>Fondo blanco y menos color.</small></label><input type="checkbox" id="lxqT"'+(OPC.tinta?' checked':'')+'></div>'+
      '<p class="lx-peque">En la ventana de impresión de tu navegador, elige tamaño A4 y marca «Gráficos de fondo» para que salga con todos los colores.</p>'+
      '<div class="lx-botones"><button type="button" class="lx-prim" id="lxqOk">🖨️ Imprimir</button><button type="button" id="lxqNo">Cancelar</button></div></div>';
    var q=function(i){return qi.querySelector('#'+i)};
    q('lxqNo').onclick=function(){ qi.hidden=true; };
    qi.onclick=function(e){ if(e.target===qi) qi.hidden=true; };
    q('lxqOk').onclick=function(){ OPC.lleno=q('lxqL').checked; OPC.vacio=q('lxqV').checked; OPC.fichas=q('lxqF').checked; OPC.cartas=q('lxqC').checked; OPC.tinta=q('lxqT').checked; try{localStorage.setItem('lince-imprimir',JSON.stringify(OPC));}catch(e){} qi.hidden=true; imprime(fuente(),modo); };
    if(!qi.parentNode) document.body.appendChild(qi);
    qi.hidden=false;
  }
  window.lxImprime=imprime; window.lxTablero={actual:tableroActual,de:tableroDe};
  function itemsCrea(){ var db=DB(); return db.filter(function(it,i){return S.has(i)}); }

  /* ---- carátula ---- */
  var velo=document.createElement('div'); velo.className='lx-velo'; velo.id='lxPortada';
  velo.innerHTML=
   '<div class="lx-tarjeta">'+
   '<picture><source media="(max-width:700px) and (orientation:portrait)" srcset="portada/portada-movil.jpg">'+
   '<img class="lx-heroe" src="portada/portada-ancha.jpg" width="1600" height="900" alt="Un lince con una lupa mira un ratón en un tablero de dibujos" onerror="this.style.minHeight=\'30vh\'"></picture>'+
   '<div class="lx-cuerpo"><h1>🐱 El Lince Digital</h1>'+
   '<p>El lince pide un dibujo y hay que encontrarlo en el tablero. Cada dibujo trabaja un sonido. Se oye cómo se dice.</p>'+
   '<button class="lx-jugar" id="lxJugar" type="button" aria-label="Jugar ya"><img src="portada/boton-jugar.webp" width="720" height="240" alt="" onerror="this.parentNode.classList.add(\'lx-sinimg\')"><span class="lx-txt">▶ Jugar</span></button>'+
   '<button class="lx-crea lx-pares" id="lxParB" type="button">👂 Pares mínimos: palabras que suenan casi igual</button>'+
   '<button class="lx-crea" id="lxCreaB" type="button">✏️ Crea tu propio Lince (con emojis o pictos)</button>'+
   '<button class="lx-pidebtn" id="lxImpP" type="button">🖨️ Imprimir tablero y cartas</button>'+
   '<button class="lx-pidebtn" id="lxPideP" type="button">💬 ¿Qué picto te falta?</button>'+
   '<div class="lx-puente"><b>🐝 ColmenIA, la comunidad de logopedas</b><p>Aquí creamos juegos y materiales como este, con lo que nos pedís. Las versiones nuevas (más pictos, más funciones) llegan por niveles a quien está dentro.</p><a class="lx-cta" data-sk="portada" href="https://www.skool.com/logopedia-7339/about" target="_blank" rel="noopener">Entrar en la comunidad</a><a class="lx-idea" data-sk="idea_portada" href="https://www.skool.com/logopedia-7339/about" target="_blank" rel="noopener">💡 ¿Echas algo en falta? Cuéntanoslo</a></div>'+
   '<p class="lx-nota">Móvil, tableta u ordenador · sin registro · los resultados no salen del aparato.<br>Voz: Ximena (Microsoft). Material de apoyo: no sustituye a la logopeda. <a href="privacidad.html">Privacidad</a></p>'+
   '</div></div>';
  /* ---- ajustes ---- */
  var ab=document.createElement('button'); ab.className='lx-ajb'; ab.type='button'; ab.title='Ajustes'; ab.setAttribute('aria-label','Ajustes de la logopeda'); ab.textContent='⚙️';
  var ap=document.createElement('div'); ap.className='lx-ajp'; ap.hidden=true;
  ap.innerHTML='<div class="lx-caja" role="dialog" aria-label="Ajustes"><h2>⚙️ Ajustes (logopeda)</h2>'+
   '<div class="lx-fila"><label for="lxVoz">Voz<small>Dice cada palabra en voz alta.</small></label><input type="checkbox" id="lxVoz"></div>'+
   '<div class="lx-fila"><label for="lxDib">Dibujos<small>Emojis o pictos propios de Fönia.</small></label><select id="lxDib"><option value="emoji">Emojis</option><option value="picto">Pictos</option></select></div>'+
   '<div class="lx-fila"><label for="lxVol">Volumen</label><select id="lxVol"><option value="normal">Normal</option><option value="alto">Alto</option></select></div>'+
   '<div class="lx-fila"><label for="lxBusca">Decir «El lince busca…»<small>Antes de cada palabra.</small></label><input type="checkbox" id="lxBusca"></div>'+
   '<div class="lx-fila"><label for="lxOido">A oído<small>Esconde la palabra escrita: solo se oye.</small></label><input type="checkbox" id="lxOido"></div>'+
   '<p style="font-size:13px;color:#4d6457;margin:10px 0 0">Para elegir sonido o tipo de dibujo, usa los botones de la parte de arriba del juego. Estos ajustes se guardan solo en este aparato.</p>'+
   '<button class="lx-cerrar" type="button" id="lxImpA" style="background:#fff;color:#2b5a3a;border:2px solid #2FA866;margin-top:10px">🖨️ Imprimir este tablero y sus cartas</button>'+
   '<button class="lx-cerrar" type="button" id="lxPideA" style="background:#fff;color:#2b5a3a;border:2px solid #2FA866;margin-top:10px">💬 ¿Qué picto te falta?</button>'+
   '<button class="lx-cerrar" type="button" id="lxCerrar">Listo</button></div>';
  var ob=document.createElement('button'); ob.className='lx-oir'; ob.type='button'; ob.title='Repetir la palabra'; ob.setAttribute('aria-label','Repetir la palabra'); ob.textContent='🔊';
  function monta(){
    document.body.appendChild(ab); document.body.appendChild(ob); document.body.appendChild(ap); document.body.appendChild(velo);
    var $=function(i){return document.getElementById(i)};
    $('lxVoz').checked=A.voz; $('lxVol').value=A.volumen; $('lxBusca').checked=A.busca; $('lxOido').checked=A.aoido; $('lxDib').value=A.dibujos; aplica();
    ab.onclick=function(){ap.hidden=false};
    $('lxCerrar').onclick=function(){ap.hidden=true};
    $('lxPideA').onclick=function(){ ap.hidden=true; abrePide(); };
    $('lxImpA').onclick=function(){ ap.hidden=true; preImprime(tableroActual,A.dibujos); };
    document.body.appendChild(pide);
    ap.onclick=function(e){ if(e.target===ap) ap.hidden=true };
    $('lxVoz').onchange=function(){A.voz=this.checked;guarda()};
    $('lxVol').onchange=function(){A.volumen=this.value;guarda()};
    $('lxBusca').onchange=function(){A.busca=this.checked;guarda()};
    $('lxOido').onchange=function(){A.aoido=this.checked;guarda()};
    $('lxDib').onchange=function(){A.dibujos=this.value;guarda(); if(velo.hidden){ try{resetGame()}catch(e){} } pintaTodo(); };
    document.body.appendChild(crea);
    $('lxCreaB').onclick=abreCrea;
    document.body.appendChild(pm);
    $('lxParB').onclick=function(){ pm.hidden=false; leeCon(); };
    pm.addEventListener('change',function(e){ if(e.target.closest&&e.target.closest('.lx-con')) leeCon(); });
    $('lxPmNo').onclick=function(){ pm.hidden=true; };
    pm.onclick=function(e){ if(e.target===pm) pm.hidden=true; var b=e.target.closest&&e.target.closest('.lx-modo'); if(b) juegaPares(b.getAttribute('data-m')); };
    var pp=document.querySelector('.category-pill[data-filter="pares"]');
    if(pp){ pp.textContent='👂 Pares'; pp.addEventListener('click',function(e){ if(!window.__lxPasar){ e.stopImmediatePropagation(); e.preventDefault(); pm.hidden=false; leeCon(); } },true); }
    $('lxPideP').onclick=abrePide;
    $('lxImpP').onclick=function(){ preImprime(tableroActual,A.dibujos); };
    var fin0=$('endScreen'); if(fin0){ var ec=fin0.querySelector('.end-content'); if(ec){ var pb=document.createElement('button'); pb.type='button'; pb.className='lx-pidebtn'; pb.textContent='💬 ¿Qué picto te falta?'; pb.onclick=abrePide; ec.appendChild(pb); } }
    ob.onclick=function(){ diObjetivo(); };
    var tc=$('targetCard'); if(tc) tc.addEventListener('click',diObjetivo);
    velo.querySelectorAll('a[data-sk]').forEach(function(a){ a.addEventListener('click',function(){cuenta('skool_'+a.getAttribute('data-sk'))}); });

    /* ---- volver al inicio (carátula) ---- */
    function inicio(){ try{ if(au) au.pause(); }catch(e){} var f=$('endScreen'); if(f) f.classList.remove('show'); var a2=document.querySelectorAll('.lx-ajp'); a2.forEach(function(x){x.hidden=true}); velo.hidden=false; velo.scrollTop=0; cuenta('inicio'); }
    var nb=$('newCardBtn');
    if(nb && nb.parentNode){ var hb=document.createElement('button'); hb.type='button'; hb.id='lxInicio'; hb.className='btn-premium btn-secondary'; hb.setAttribute('aria-label','Volver al inicio'); hb.innerHTML='<span class="btn-icon">🏠</span><span class="btn-text">Inicio</span>'; hb.onclick=inicio; nb.parentNode.insertBefore(hb,nb); }
    var ec2=document.querySelector('#endScreen .end-content'); if(ec2){ var hb2=document.createElement('button'); hb2.type='button'; hb2.className='lx-inicio-grande'; hb2.innerHTML='🏠 Volver al inicio'; hb2.onclick=inicio; var pa=$('playAgainBtn'); if(pa && pa.parentNode) pa.parentNode.insertBefore(hb2,pa.nextSibling); else ec2.appendChild(hb2); }
    document.querySelectorAll('.category-pill,.phoneme-pill').forEach(function(p){ p.addEventListener('click',function(){ SEL=null; },true); });
    $('lxJugar').onclick=function(){
      cuenta('jugar'); if(modoPicto()) cuenta('jugar_picto'); if(SEL) cuenta('jugar_sel');
      empieza();
    };
    /* di la palabra cada vez que cambia el objetivo (y la sigue diciendo si se pulsa la carta) */
    var n=$('targetName'), tmr=null;
    if(n && window.MutationObserver){
      new MutationObserver(function(){ if(!velo.hidden) return; clearTimeout(tmr); tmr=setTimeout(diObjetivo,220); }).observe(n,{childList:true,characterData:true,subtree:true});
    }
    var bd=document.querySelector('.board'); if(bd&&window.MutationObserver) new MutationObserver(function(){ aplica(); if(modoPicto()) document.querySelectorAll('.cell-emoji').forEach(pinta); }).observe(bd,{childList:true,subtree:true});
    var te=$('targetEmoji'); if(te&&window.MutationObserver) new MutationObserver(function(){ pinta(te); }).observe(te,{childList:true,characterData:true,subtree:true});
    if(SEL){ var np=velo.querySelector('.lx-nota'); if(np) np.insertAdjacentHTML('beforebegin','<p style="font-weight:800;color:#9a4b0b">Partida preparada: '+SEL.length+' palabras.</p>'); }
    var fin=$('endScreen');
    if(fin && window.MutationObserver){
      new MutationObserver(function(){ if(fin.classList.contains('show')) di('_completo',true); }).observe(fin,{attributes:true,attributeFilter:['class']});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',monta); else monta();
})();
