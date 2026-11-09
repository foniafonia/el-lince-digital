/* El Lince Digital · datos de la partida e informe de caso anonimizado.
   Todo se guarda SOLO en este aparato (localStorage). Nada sale a internet. Sin nombres: solo un código de caso. */
(function(){
  'use strict';
  var KEY='lince-casos-v1', MAXS=80;
  function $(i){return document.getElementById(i)}
  function cuenta(k){ if(window.linceCuenta) window.linceCuenta(k); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
  function cargar(){ try{ var d=JSON.parse(localStorage.getItem(KEY)||'null'); if(d&&d.casos) return d; }catch(e){} return {on:false,caso:'',casos:{}}; }
  var D=cargar();
  function guardar(){ try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){} }
  function activo(){ return (D.on && D.caso && D.casos[D.caso]) ? D.casos[D.caso] : null; }
  function DB(){ return (typeof itemDatabase!=='undefined')?itemDatabase:[]; }
  function ajustes(){ return window.lxAjustes?window.lxAjustes():{}; }

  /* ================= registro de la partida ================= */
  var S=null, R=null;
  function sesionNueva(){
    var a=ajustes(), f='todos';
    try{ f=state.currentFilter||'todos'; }catch(e){}
    if(window.lxSelActiva && window.lxSelActiva()) f='mi lince';
    return {t0:new Date().toISOString(),ini:performance.now(),dib:a.dibujos||'emoji',oido:!!a.aoido,voz:a.voz!==false,f:f,n:0,c:0,r:[]};
  }
  function cierraSesion(){
    if(!S) return;
    var c=activo();
    if(c && S.r.length>=5){
      S.d=Math.round(performance.now()-S.ini);
      try{ S.n=state.items.length; }catch(e){}
      S.r.forEach(function(r){ delete r.t0; delete r.at; delete r.fin; delete r.s0; });
      c.sesiones.push(S); while(c.sesiones.length>MAXS) c.sesiones.shift();
      guardar();
    }
    S=null; R=null;
  }
  function empiezaSesion(){ cierraSesion(); if(activo()) S=sesionNueva(); }
  function cierraRondaSaltada(){ if(S&&R&&!R.fin){ R.s=1; R.t=null; S.r.push(R); } R=null; }
  function rondaNueva(){
    if(!S) return;
    cierraRondaSaltada();
    var t=null; try{ t=state.currentTarget; }catch(e){}
    if(!t) return;
    R={w:t.name,c:t.cat,p:(t.phonemes||[]).slice(),t0:performance.now(),at:performance.now(),e:[],fin:false};
  }
  function instala(){
    var rg=window.resetGame;
    if(typeof rg==='function'){ window.resetGame=function(){ empiezaSesion(); return rg.apply(this,arguments); }; }
    var n=$('targetName');
    if(n&&window.MutationObserver){
      new MutationObserver(function(){ var v=$('lxPortada'); if(v&&!v.hidden) return; rondaNueva(); }).observe(n,{childList:true,characterData:true,subtree:true});
    }
    document.addEventListener('click',function(e){
      var c=e.target.closest&&e.target.closest('.cell'); if(!c||!S||!R||R.fin) return;
      if(c.classList.contains('found')) return;
      var em=c.querySelector('.cell-emoji'), emoji=em?em.textContent.trim():'';
      var it=null, tg=null; try{ it=state.items.find(function(i){return i.emoji===emoji}); tg=state.currentTarget; }catch(x){}
      if(!tg) return;
      var now=performance.now(), ok=(emoji===tg.emoji);
      if(ok){ R.t=Math.round(now-R.t0); R.fin=true; S.r.push(R); }
      else { R.e.push([it?it.name:'?',Math.round(now-R.at)]); R.at=now; }
    },true);
    var fin=$('endScreen');
    if(fin&&window.MutationObserver){
      new MutationObserver(function(){ if(fin.classList.contains('show')&&S){ S.c=1; cierraSesion(); } }).observe(fin,{attributes:true,attributeFilter:['class']});
    }
    window.addEventListener('pagehide',function(){ cierraSesion(); });
    document.addEventListener('visibilitychange',function(){ if(document.hidden) { /* no cierra: sigue la partida */ } });
    window.lxCierraSesion=cierraSesion;
  }

  /* ================= análisis ================= */
  function med(a){ if(!a.length) return null; var s=a.slice().sort(function(x,y){return x-y}), m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; }
  function media(a){ return a.length?a.reduce(function(x,y){return x+y},0)/a.length:null; }
  function dt(a){ if(a.length<2) return null; var m=media(a); return Math.sqrt(a.reduce(function(s,x){return s+(x-m)*(x-m)},0)/(a.length-1)); }
  function pct(n,d){ return d?Math.round(n/d*100):null; }
  function sonL(s){ s=String(s); return s.charAt(0)==='('?'sin sonido':'/'+s.toUpperCase()+'/'; }
  function seg(ms){ return ms==null?'—':(ms/1000).toFixed(1).replace('.',',')+' s'; }
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
  function lev(a,b){ a=norm(a); b=norm(b); var m=[],i,j; for(i=0;i<=a.length;i++){m[i]=[i];} for(j=1;j<=b.length;j++) m[0][j]=j;
    for(i=1;i<=a.length;i++) for(j=1;j<=b.length;j++) m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return m[a.length][b.length]; }
  function catDe(n){ var x=DB().find(function(i){return i.name===n}); return x?x.cat:null; }
  function tipoError(obj,elegido){
    var a=norm(obj), b=norm(elegido);
    if(lev(a,b)<=2 || a.slice(0,2)===b.slice(0,2) || (a.length>2&&b.length>2&&a.slice(-3)===b.slice(-3))) return 'parecida';
    var c1=catDe(obj), c2=catDe(elegido); if(c1&&c1===c2) return 'categoria';
    return 'otra';
  }
  function analiza(ses){
    var rondas=[]; ses.forEach(function(s,si){ s.r.forEach(function(r,ri){ rondas.push({r:r,si:si,ri:ri,s:s}); }); });
    var hechas=rondas.filter(function(x){return !x.r.s && x.r.t!=null});
    var tiempos=hechas.map(function(x){return x.r.t});
    var primer=hechas.filter(function(x){return x.r.e.length===0}).length;
    var errores=0, tipos={parecida:0,categoria:0,otra:0}, rapidos=0, persev=0, conf={}, porSon={}, porModo={};
    hechas.forEach(function(x){
      var r=x.r, vistos={}; errores+=r.e.length;
      r.e.forEach(function(e){
        var tp=tipoError(r.w,e[0]); tipos[tp]++;
        if(e[1]<700) rapidos++;
        if(vistos[e[0]]) persev++; vistos[e[0]]=1;
        var k=r.w+' → '+e[0]; conf[k]=(conf[k]||0)+1;
      });
      var sons=r.p.length?r.p:['(sin sonido marcado)'];
      sons.forEach(function(p){ var o=porSon[p]||(porSon[p]={n:0,ok1:0,t:[],err:0}); o.n++; if(!r.e.length) o.ok1++; o.t.push(r.t); o.err+=r.e.length; });
      var m=(x.s.oido?'a oído':'con palabra')+' · '+(x.s.dib==='picto'?'pictos':'emojis');
      var o2=porModo[m]||(porModo[m]={n:0,ok1:0,t:[]}); o2.n++; if(!r.e.length) o2.ok1++; o2.t.push(r.t);
    });
    var saltadas=rondas.filter(function(x){return x.r.s}).length;
    /* atención: variabilidad y deriva dentro de cada sesión */
    var cvs=[], deriv=[];
    ses.forEach(function(s){ var t=s.r.filter(function(r){return !r.s&&r.t!=null}).map(function(r){return r.t}); if(t.length>=8){ var m=media(t); cvs.push(dt(t)/m); var h=Math.floor(t.length/2); var a=med(t.slice(0,h)), b=med(t.slice(h)); if(a) deriv.push((b-a)/a*100); } });
    /* por sesión */
    var porSes=ses.map(function(s,i){ var h=s.r.filter(function(r){return !r.s&&r.t!=null}); return {i:i,f:s.t0,n:h.length,med:med(h.map(function(r){return r.t})),ok1:pct(h.filter(function(r){return !r.e.length}).length,h.length),c:s.c,oido:s.oido,dib:s.dib,filtro:s.f,dur:s.d}; });
    var confL=Object.keys(conf).map(function(k){return [k,conf[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,8);
    var sonL=Object.keys(porSon).map(function(k){var o=porSon[k]; return {s:k,n:o.n,ok1:pct(o.ok1,o.n),med:med(o.t),err:o.err}}).filter(function(x){return x.n>=3}).sort(function(a,b){return (a.ok1-b.ok1)||(b.err-a.err)});
    return {sesiones:ses.length,rondas:rondas.length,hechas:hechas.length,saltadas:saltadas,tiempos:tiempos,med:med(tiempos),media:media(tiempos),ok1:pct(primer,hechas.length),errores:errores,tipos:tipos,rapidos:rapidos,persev:persev,conf:confL,sons:sonL,modos:porModo,cv:media(cvs),deriva:media(deriv),porSes:porSes,min:Math.round(ses.reduce(function(s,x){return s+(x.d||0)},0)/60000)};
  }

  /* ================= gráficas SVG ================= */
  var VERDE='#2FA866', ORO='#E0A022', ROJO='#D8604C', GRIS='#9aa8a0';
  function lineas(vals,opt){
    opt=opt||{}; var W=opt.W||620,H=opt.H||190,pl=46,pr=12,pt=14,pb=28; var v=vals.filter(function(x){return x!=null});
    if(v.length<2) return '<p class="lxi-vacio">Hacen falta más datos para esta gráfica.</p>';
    var mx=Math.max.apply(null,v)*1.1||1, mn=0, n=vals.length;
    function X(i){return pl+(W-pl-pr)*(n===1?0:i/(n-1))} function Y(x){return pt+(H-pt-pb)*(1-(x-mn)/(mx-mn))}
    var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.t||'')+'">';
    for(var g=0;g<=4;g++){ var gv=mn+(mx-mn)*g/4, gy=Y(gv); s+='<line x1="'+pl+'" y1="'+gy+'" x2="'+(W-pr)+'" y2="'+gy+'" stroke="#e5ece6"/><text x="'+(pl-6)+'" y="'+(gy+4)+'" font-size="11" text-anchor="end" fill="#4d6457">'+(opt.pct?Math.round(gv)+'%':(gv/1000).toFixed(1).replace('.',',')+'s')+'</text>'; }
    var pts=[],xs=[],ys=[]; vals.forEach(function(x,i){ if(x!=null){ pts.push(X(i).toFixed(1)+','+Y(x).toFixed(1)); xs.push(i); ys.push(x); } });
    s+='<polyline fill="none" stroke="'+(opt.color||VERDE)+'" stroke-width="2.5" points="'+pts.join(' ')+'"/>';
    xs.forEach(function(i,k){ s+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(ys[k]).toFixed(1)+'" r="3.2" fill="'+(opt.color||VERDE)+'"/>'; });
    if(xs.length>=4){ var mx2=media(xs),my2=media(ys),num=0,den=0; xs.forEach(function(x,k){num+=(x-mx2)*(ys[k]-my2);den+=(x-mx2)*(x-mx2)}); var b=den?num/den:0, a=my2-b*mx2; s+='<line x1="'+X(0).toFixed(1)+'" y1="'+Y(Math.max(mn,a)).toFixed(1)+'" x2="'+X(n-1).toFixed(1)+'" y2="'+Y(Math.max(mn,a+b*(n-1))).toFixed(1)+'" stroke="'+ORO+'" stroke-width="2" stroke-dasharray="6 5"/>'; }
    var paso=Math.ceil(n/10); for(var i=0;i<n;i+=paso) s+='<text x="'+X(i).toFixed(1)+'" y="'+(H-8)+'" font-size="11" text-anchor="middle" fill="#4d6457">'+(opt.etq?opt.etq[i]:i+1)+'</text>';
    return s+'</svg>';
  }
  function barras(items,opt){
    opt=opt||{}; if(!items.length) return '<p class="lxi-vacio">Todavía no hay datos suficientes.</p>';
    var W=opt.W||620,fila=26,H=items.length*fila+8,pl=opt.pl||190,pr=opt.pr||60,mx=opt.max||Math.max.apply(null,items.map(function(i){return i.v}))||1;
    var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.t||'')+'">';
    items.forEach(function(it,k){ var y=4+k*fila, w=(W-pl-pr)*it.v/mx;
      s+='<text x="'+(pl-8)+'" y="'+(y+16)+'" font-size="13" text-anchor="end" fill="#10231A">'+esc(it.l)+'</text><rect x="'+pl+'" y="'+(y+3)+'" width="'+Math.max(2,w).toFixed(1)+'" height="17" rx="4" fill="'+(it.c||VERDE)+'"/><text x="'+(pl+Math.max(2,w)+6).toFixed(1)+'" y="'+(y+16)+'" font-size="12" fill="#4d6457">'+esc(it.t)+'</text>'; });
    return s+'</svg>';
  }

  /* ================= informe ================= */
  function textoResumen(a,caso){
    if(!a.hechas) return [];
    var L=[];
    L.push('En '+a.sesiones+(a.sesiones>1?' sesiones':' sesión')+' ('+a.hechas+' palabras buscadas, unos '+(a.min||1)+' min de juego) acierta a la primera el '+a.ok1+' % de las veces y tarda de mediana '+seg(a.med)+' en encontrar cada dibujo.');
    if(a.errores){ var t=a.tipos, tot=a.errores; var mayor=Object.keys(t).sort(function(x,y){return t[y]-t[x]})[0]; var nom={parecida:'dibujos cuya palabra suena parecido',categoria:'dibujos del mismo tipo (por ejemplo, otro animal)',otra:'dibujos sin relación'}[mayor];
      L.push('Se han registrado '+tot+' toques equivocados. Lo más frecuente es elegir '+nom+' ('+pct(t[mayor],tot)+' % de los errores).'); }
    if(a.sons.length){ var peor=a.sons.slice(0,3).filter(function(x){return x.ok1<100}); if(peor.length) L.push('Los sonidos con menos aciertos a la primera son: '+peor.map(function(x){return sonL(x.s)+' ('+x.ok1+' %)'}).join(', ')+'.'); }
    if(a.cv!=null) L.push('La variabilidad del tiempo de respuesta dentro de una sesión es '+(a.cv<0.4?'baja':a.cv<0.7?'media':'alta')+' (coeficiente '+a.cv.toFixed(2).replace('.',',')+').');
    if(a.deriva!=null) L.push(a.deriva>15?'En la segunda mitad de la sesión tarda un '+Math.round(a.deriva)+' % más que en la primera (posible cansancio o bajada de atención).':a.deriva<-15?'En la segunda mitad de la sesión es un '+Math.round(-a.deriva)+' % más rápido (se va ajustando a la tarea).':'El ritmo se mantiene parecido de principio a fin de la sesión.');
    if(a.rapidos) L.push(a.rapidos===1?'1 toque equivocado vino en menos de 0,7 s tras el anterior (respuesta muy rápida, posible impulsividad).':a.rapidos+' de los toques equivocados vinieron en menos de 0,7 s tras el anterior (respuestas muy rápidas, posible impulsividad).');
    if(a.persev) L.push('Hubo '+a.persev+' veces en que repitió el mismo error en la misma palabra.');
    var ps=a.porSes; if(ps.length>=2){ var p=ps[0],u=ps[ps.length-1]; if(p.med&&u.med) L.push('Entre la primera y la última sesión, el tiempo mediano pasa de '+seg(p.med)+' a '+seg(u.med)+' y los aciertos a la primera de '+p.ok1+' % a '+u.ok1+' %.'); }
    return L;
  }
  var NEUROPSI=[
    ['Velocidad de procesamiento','Tiempo mediano de búsqueda','med'],
    ['Atención sostenida','Variabilidad del tiempo (coeficiente) y cambio entre la 1.ª y la 2.ª mitad','aten'],
    ['Control inhibitorio','Toques equivocados en menos de 0,7 s y errores repetidos','inhib'],
    ['Discriminación auditiva','Aciertos en modo «a oído» frente a modo con palabra visible','aud'],
    ['Aprendizaje','Evolución entre sesiones (tiempo mediano y aciertos a la primera)','aprend']
  ];
  function filasNeuro(a){
    var o=[];
    o.push(['Velocidad de procesamiento',seg(a.med)+' (mediana)'+(a.media?' · media '+seg(a.media):'')]);
    o.push(['Atención sostenida',a.cv!=null?'coef. de variación '+a.cv.toFixed(2).replace('.',',')+(a.deriva!=null?' · 2.ª mitad '+(a.deriva>=0?'+':'')+Math.round(a.deriva)+' %':''):'—']);
    o.push(['Control inhibitorio',a.errores?(a.rapidos+' de '+a.errores+' errores en <0,7 s · '+a.persev+' repetidos'):'sin errores registrados']);
    var mo=a.modos, k1='a oído · emojis', ks=Object.keys(mo), ao=ks.filter(function(k){return k.indexOf('a oído')===0}), cp=ks.filter(function(k){return k.indexOf('con palabra')===0});
    function agr(l){var n=0,ok=0,t=[];l.forEach(function(k){n+=mo[k].n;ok+=mo[k].ok1;t=t.concat(mo[k].t)}); return {n:n,ok:pct(ok,n),med:med(t)}}
    if(ao.length&&cp.length){ var A1=agr(ao),B1=agr(cp); o.push(['Discriminación auditiva','a oído: '+A1.ok+' % y '+seg(A1.med)+' · con palabra: '+B1.ok+' % y '+seg(B1.med)]); } else o.push(['Discriminación auditiva','faltan sesiones en los dos modos para comparar']);
    var ps=a.porSes; o.push(['Aprendizaje',ps.length>=2&&ps[0].med&&ps[ps.length-1].med?('tiempo '+seg(ps[0].med)+' → '+seg(ps[ps.length-1].med)+' · aciertos '+ps[0].ok1+' % → '+ps[ps.length-1].ok1+' %'):'hacen falta al menos 2 sesiones']);
    return o;
  }
  function informeHTML(codigo,c,a){
    var f=new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
    var ses=c.sesiones, d1=ses.length?new Date(ses[0].t0).toLocaleDateString('es-ES'):'—', d2=ses.length?new Date(ses[ses.length-1].t0).toLocaleDateString('es-ES'):'—';
    var h='<header class="lxi-cab"><div><h1>Informe de juego · El Lince Digital</h1><p>Caso <b>'+esc(codigo)+'</b>'+(c.edad?' · edad '+esc(c.edad)+' años':'')+' · '+d1+' a '+d2+' · '+a.sesiones+' sesiones, '+a.hechas+' palabras</p></div><div class="lxi-ver">Informe anonimizado · '+f+'</div></header>';
    var res=textoResumen(a,codigo);
    h+='<section><h2>Resumen</h2>'+(res.length?'<ul>'+res.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'<p class="lxi-vacio">Todavía no hay partidas suficientes. Juega al menos una sesión de 5 palabras con este caso activo.</p>')+'</section>';
    if(!a.hechas) return h;
    var idx=ses.map(function(s,i){return i+1});
    var ult=ses[ses.length-1], tr=ult.r.map(function(r){return (r.s||r.t==null)?null:r.t});
    h+='<section><h2>Tiempo de búsqueda en la última sesión</h2><p class="lxi-peq">Cada punto es una palabra. La línea discontinua marca la tendencia: si baja, se va haciendo más rápido.</p>'+lineas(tr,{t:'Tiempo por palabra, última sesión'})+'</section>';
    h+='<section><h2>Evolución entre sesiones</h2><div class="lxi-dos"><div><h3>Tiempo mediano</h3>'+lineas(a.porSes.map(function(s){return s.med}),{t:'Tiempo mediano por sesión',etq:idx,W:340,H:190})+'</div><div><h3>Aciertos a la primera</h3>'+lineas(a.porSes.map(function(s){return s.ok1}),{t:'Aciertos a la primera por sesión',pct:true,color:ORO,etq:idx,W:340,H:190})+'</div></div></section>';
    h+='<section><h2>Aciertos a la primera por sonido</h2><p class="lxi-peq">Solo sonidos con 3 palabras o más. Las más bajas son las que más cuestan.</p>'+barras(a.sons.slice(0,12).map(function(x){return {l:sonL(x.s)+' · '+x.n+' palabras',v:x.ok1,t:x.ok1+' % · '+seg(x.med),c:x.ok1<60?ROJO:x.ok1<80?ORO:VERDE}}),{max:100,t:'Aciertos por sonido'})+'</section>';
    h+='<section><h2>Qué se confunde</h2><div class="lxi-dos"><div><h3>Tipo de error</h3>'+barras([{l:'Suena parecido',v:a.tipos.parecida,t:String(a.tipos.parecida),c:ROJO},{l:'Mismo tipo de dibujo',v:a.tipos.categoria,t:String(a.tipos.categoria),c:ORO},{l:'Sin relación',v:a.tipos.otra,t:String(a.tipos.otra),c:GRIS}],{t:'Tipos de error',W:340,pl:150,pr:40})+'</div><div><h3>Confusiones más repetidas</h3>'+(a.conf.length?'<table><tr><th>Buscaba → eligió</th><th>Veces</th></tr>'+a.conf.map(function(x){return '<tr><td>'+esc(x[0])+'</td><td>'+x[1]+'</td></tr>'}).join('')+'</table>':'<p class="lxi-vacio">Sin errores repetidos.</p>')+'</div></div></section>';
    var mk=Object.keys(a.modos);
    if(mk.length>1) h+='<section><h2>Según cómo se juega</h2>'+barras(mk.map(function(k){var o=a.modos[k]; return {l:k,v:pct(o.ok1,o.n),t:pct(o.ok1,o.n)+' % · '+seg(med(o.t)),c:VERDE}}),{max:100,t:'Aciertos por modo'})+'</section>';
    h+='<section><h2>Indicadores orientativos</h2><table class="lxi-n"><tr><th>Área</th><th>Dato de juego</th></tr>'+filasNeuro(a).map(function(x){return '<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td></tr>'}).join('')+'</table></section>';
    h+='<section><h2>Sesiones</h2><table class="lxi-s"><tr><th>#</th><th>Fecha</th><th>Modo</th><th>Palabras</th><th>Aciertos 1.º</th><th>Mediana</th></tr>'+a.porSes.map(function(s){return '<tr><td>'+(s.i+1)+'</td><td>'+new Date(s.f).toLocaleDateString('es-ES')+'</td><td>'+(s.oido?'a oído':'con palabra')+' · '+(s.dib==='picto'?'pictos':'emojis')+(s.filtro&&s.filtro!=='todos'?' · '+esc(s.filtro):'')+'</td><td>'+s.n+(s.c?'':' (incompleta)')+'</td><td>'+(s.ok1==null?'—':s.ok1+' %')+'</td><td>'+seg(s.med)+'</td></tr>'}).join('')+'</table></section>';
    h+='<footer class="lxi-pie"><p><b>Cómo leer este informe.</b> Son datos del juego, no una evaluación: no hay baremos ni valor diagnóstico y no sustituyen a las pruebas estandarizadas ni a la valoración clínica. El tiempo se cuenta desde que aparece la palabra hasta que se toca el dibujo correcto, así que incluye el tiempo de oír la palabra. «Suena parecido» es una estimación automática por letras (se parecen en el comienzo, el final o en casi todas las letras), no un análisis fonético.</p><p><b>Anonimizado:</b> solo lleva un código de caso'+(c.edad?' y un rango de edad':'')+'. No incluye nombre, centro ni ningún dato que identifique a la persona. Los datos están guardados solo en este aparato.</p><p>El Lince Digital · Gabinete Fönia · ColmenIA · foniafonia.github.io/el-lince-digital</p></footer>';
    return h;
  }
  function csv(c,codigo){
    var L=['caso;sesion;fecha;modo_dibujos;a_oido;filtro;palabra;categoria;sonidos;tiempo_ms;errores;errores_detalle;saltada'];
    c.sesiones.forEach(function(s,i){ s.r.forEach(function(r){ L.push([codigo,i+1,s.t0,s.dib,s.oido?1:0,s.f,r.w,r.c,(r.p||[]).join('|'),r.t==null?'':r.t,r.e.length,r.e.map(function(e){return e[0]+':'+e[1]}).join('|'),r.s?1:0].join(';')); }); });
    return L.join('\n');
  }
  function baja(nombre,txt,tipo){ try{ var b=new Blob([txt],{type:tipo}); var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=nombre; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove();},500);}catch(e){ alert('Este navegador no deja descargar. Copia el resumen.'); } }

  /* ================= pantallas ================= */
  var inf=document.createElement('div'); inf.id='lxInforme'; inf.hidden=true;
  var casos=document.createElement('div'); casos.className='lx-ajp'; casos.hidden=true; casos.id='lxCasos';
  function abreInforme(){
    var c=D.casos[D.caso]; if(!c){ abreCasos(); return; }
    cierraSesion(); if(D.on&&!S&&false){}
    var a=analiza(c.sesiones);
    inf.innerHTML='<div class="lxi-barra"><button type="button" id="lxiImp" class="lxi-prim">🖨️ Imprimir o guardar en PDF</button><button type="button" id="lxiCsv">⬇️ Datos (CSV)</button><button type="button" id="lxiTxt">📋 Copiar resumen</button><button type="button" id="lxiCerrar">Cerrar</button></div><div class="lxi-hoja" id="lxiHoja">'+informeHTML(D.caso,c,a)+'</div>';
    inf.hidden=false; inf.scrollTop=0; document.body.classList.add('lxi-abierto'); cuenta('informe_ver');
    $('lxiCerrar').onclick=function(){ inf.hidden=true; document.body.classList.remove('lxi-abierto'); };
    $('lxiImp').onclick=function(){ cuenta('informe_imprimir'); window.print(); };
    $('lxiCsv').onclick=function(){ cuenta('informe_csv'); baja('lince-'+D.caso.replace(/[^a-z0-9_-]/gi,'_')+'.csv','﻿'+csv(c,D.caso),'text/csv;charset=utf-8'); };
    $('lxiTxt').onclick=function(){ var t='Informe de juego · El Lince Digital · caso '+D.caso+'\n'+textoResumen(a).map(function(x){return '- '+x}).join('\n')+'\n(Datos de juego, sin valor diagnóstico. Anonimizado.)'; if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ $('lxiTxt').textContent='✓ Copiado'; },function(){ window.prompt('Copia el resumen:',t); }); else window.prompt('Copia el resumen:',t); };
  }
  function aviso(){ var b=document.getElementById('lxCasoBadge'); var c=activo(); if(!b){ b=document.createElement('div'); b.id='lxCasoBadge'; document.body.appendChild(b); } if(c){ b.textContent='● Guardando datos · caso '+D.caso; b.hidden=false; } else b.hidden=true; }
  function pintaCasos(){
    var ks=Object.keys(D.casos);
    casos.innerHTML='<div class="lx-caja lx-ancha" role="dialog" aria-label="Informe y casos"><h2>📊 Informe de caso</h2>'+
     '<p class="lx-peque">El juego puede guardar los datos de cada partida <b>solo en este aparato</b> para sacar un informe anonimizado con gráficas. No se envía nada a internet. Usa un código, <b>nunca el nombre</b> (por ejemplo, N-07).</p>'+
     '<div class="lx-fila"><label for="lxcOn">Guardar los datos de las partidas<small>Se guardan en el caso elegido.</small></label><input type="checkbox" id="lxcOn"'+(D.on?' checked':'')+'></div>'+
     '<div class="lx-fila"><label for="lxcSel">Caso activo</label><select id="lxcSel"><option value="">— ninguno —</option>'+ks.map(function(k){return '<option value="'+esc(k)+'"'+(k===D.caso?' selected':'')+'>'+esc(k)+' ('+D.casos[k].sesiones.length+' sesiones)</option>'}).join('')+'</select></div>'+
     '<h3 style="margin:12px 0 4px;font-size:16px">Nuevo caso</h3>'+
     '<div class="lx-otra"><input id="lxcCod" type="text" maxlength="16" placeholder="Código con número: N-07" autocomplete="off"><select id="lxcEdad"><option value="">Edad</option><option>3-4</option><option>5-6</option><option>7-8</option><option>9-10</option><option>11-12</option><option>13+</option></select><button type="button" id="lxcCrea">Crear</button></div>'+
     '<p class="lx-peque" id="lxcMsg"></p>'+
     '<div class="lx-botones"><button type="button" class="lx-prim" id="lxcVer">📈 Ver informe</button><button type="button" id="lxcCsv">⬇️ Datos (CSV)</button><button type="button" id="lxcBorra">🗑️ Borrar este caso</button><button type="button" id="lxcCierra">Cerrar</button></div>'+
     '<p class="lx-peque">Un caso nuevo no se mezcla con otro. Si cambias de aparato, los datos no se llevan: descarga el CSV. Son datos de juego, sin valor diagnóstico.</p></div>';
    var q=function(i){return casos.querySelector('#'+i)}, msg=function(t){q('lxcMsg').textContent=t};
    q('lxcOn').onchange=function(){ if(this.checked&&!D.caso){ this.checked=false; msg('Primero crea o elige un caso.'); return; } D.on=this.checked; guardar(); aviso(); };
    q('lxcSel').onchange=function(){ D.caso=this.value; if(!D.caso) D.on=false; else if(!D.on) D.on=true; guardar(); aviso(); pintaCasos(); };
    q('lxcCrea').onclick=function(){
      var cod=q('lxcCod').value.trim().replace(/\s+/g,' ');
      if(cod.length<2){ msg('Escribe un código de al menos 2 caracteres.'); return; }
      if(!/^[A-Za-z0-9 _-]+$/.test(cod)){ msg('Solo letras, números, espacio, guion y guion bajo. Sin tildes ni nombres.'); return; }
      if(!/[0-9]/.test(cod)){ msg('El código debe llevar al menos un número (por ejemplo N-07). Así se evita poner nombres: usa un código, nunca el nombre.'); return; }
      if(D.casos[cod]){ msg('Ese código ya existe.'); return; }
      if(Object.keys(D.casos).length>=40){ msg('Hay demasiados casos en este aparato. Borra alguno.'); return; }
      D.casos[cod]={edad:q('lxcEdad').value,creado:new Date().toISOString(),sesiones:[]}; D.caso=cod; D.on=true; guardar(); aviso(); cuenta('informe_caso_nuevo'); pintaCasos(); casos.querySelector('#lxcMsg').textContent='Caso «'+cod+'» creado. Desde ahora se guardan los datos de las partidas.';
    };
    q('lxcVer').onclick=function(){ casos.hidden=true; abreInforme(); };
    q('lxcCsv').onclick=function(){ var c=D.casos[D.caso]; if(!c){ msg('Elige un caso.'); return; } cuenta('informe_csv'); baja('lince-'+D.caso.replace(/[^a-z0-9_-]/gi,'_')+'.csv','﻿'+csv(c,D.caso),'text/csv;charset=utf-8'); };
    q('lxcBorra').onclick=function(){ if(!D.caso){ msg('Elige un caso.'); return; } if(window.confirm('¿Borrar el caso «'+D.caso+'» y todos sus datos de este aparato? No se puede deshacer.')){ delete D.casos[D.caso]; D.caso=''; D.on=false; guardar(); aviso(); pintaCasos(); } };
    q('lxcCierra').onclick=function(){ casos.hidden=true; };
    casos.onclick=function(e){ if(e.target===casos) casos.hidden=true; };
  }
  function abreCasos(){ cierraSesion(); pintaCasos(); casos.hidden=false; cuenta('informe_abrir'); }

  function monta(){
    document.body.appendChild(inf); document.body.appendChild(casos); instala(); aviso();
    /* botones de entrada */
    var vp=$('lxPortada');
    if(vp){ var b=document.createElement('button'); b.type='button'; b.className='lx-pidebtn'; b.id='lxInfP'; b.textContent='📊 Informe de caso (datos de las partidas)'; b.onclick=abreCasos; var ref=$('lxPideP'); if(ref&&ref.parentNode) ref.parentNode.insertBefore(b,ref); else vp.appendChild(b); }
    var ap=document.querySelector('.lx-ajp .lx-caja'); var cer=$('lxCerrar');
    if(cer&&cer.parentNode){ var b2=document.createElement('button'); b2.type='button'; b2.className='lx-cerrar'; b2.style.cssText='background:#fff;color:#2b5a3a;border:2px solid #2FA866;margin-top:10px'; b2.textContent='📊 Informe de caso'; b2.onclick=function(){ cer.closest('.lx-ajp').hidden=true; abreCasos(); }; cer.parentNode.insertBefore(b2,cer); }
    var ec=document.querySelector('#endScreen .end-content'); if(ec){ var b3=document.createElement('button'); b3.type='button'; b3.className='lx-pidebtn'; b3.textContent='📊 Ver el informe del caso'; b3.onclick=function(){ abreInforme(); }; ec.appendChild(b3); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',monta); else monta();
  window.lxInforme={abre:abreInforme,casos:abreCasos,datos:function(){return D;},analiza:analiza};
})();
