(function(){
  var Q=new URLSearchParams(location.search);
  function cuenta(k){ if(window.linceCuenta) window.linceCuenta(k); }
  /* ---- ajustes (se guardan solo en este aparato) ---- */
  var A={voz:true,volumen:'normal',busca:false,aoido:false};
  try{ var g=JSON.parse(localStorage.getItem('lince-ajustes')||'{}'); for(var k in g) if(k in A) A[k]=g[k]; }catch(e){}
  if(Q.get('modo')==='audio') A.aoido=true;
  function guarda(){ try{localStorage.setItem('lince-ajustes',JSON.stringify(A));}catch(e){} aplica(); }
  function aplica(){ document.body.classList.toggle('lx-aoido',!!A.aoido); }
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
  function diObjetivo(){ var t=cartaNombre(); if(t) di(slug(t)); }
  /* ---- carátula ---- */
  var velo=document.createElement('div'); velo.className='lx-velo'; velo.id='lxPortada';
  velo.innerHTML=
   '<div class="lx-tarjeta">'+
   '<picture><source media="(max-width:700px) and (orientation:portrait)" srcset="portada/portada-movil.jpg">'+
   '<img class="lx-heroe" src="portada/portada-ancha.jpg" width="1600" height="900" alt="Un lince con una lupa mira un ratón en un tablero de dibujos" onerror="this.style.minHeight=\'30vh\'"></picture>'+
   '<div class="lx-cuerpo"><h1>🐱 El Lince Digital</h1>'+
   '<p>El lince pide un dibujo y hay que encontrarlo en el tablero. Cada dibujo trabaja un sonido. Se oye cómo se dice.</p>'+
   '<button class="lx-jugar" id="lxJugar" type="button" aria-label="Jugar ya"><img src="portada/boton-jugar.webp" width="720" height="240" alt="" onerror="this.parentNode.classList.add(\'lx-sinimg\')"><span class="lx-txt">▶ Jugar</span></button>'+
   '<a class="lx-cta" data-sk="portada" href="https://www.skool.com/logopedia-7339/about" target="_blank" rel="noopener">🐝 Más juegos en la comunidad ColmenIA</a>'+
   '<a class="lx-idea" data-sk="idea_portada" href="https://www.skool.com/logopedia-7339/about" target="_blank" rel="noopener">💡 ¿Echas algo en falta? Cuéntanoslo en la comunidad</a>'+
   '<p class="lx-nota">Móvil, tableta u ordenador · sin registro · los resultados no salen del aparato.<br>Voz: Ximena (Microsoft). Material de apoyo: no sustituye a la logopeda. <a href="privacidad.html">Privacidad</a></p>'+
   '</div></div>';
  /* ---- ajustes ---- */
  var ab=document.createElement('button'); ab.className='lx-ajb'; ab.type='button'; ab.title='Ajustes'; ab.setAttribute('aria-label','Ajustes de la logopeda'); ab.textContent='⚙️';
  var ap=document.createElement('div'); ap.className='lx-ajp'; ap.hidden=true;
  ap.innerHTML='<div class="lx-caja" role="dialog" aria-label="Ajustes"><h2>⚙️ Ajustes (logopeda)</h2>'+
   '<div class="lx-fila"><label for="lxVoz">Voz<small>Dice cada palabra en voz alta.</small></label><input type="checkbox" id="lxVoz"></div>'+
   '<div class="lx-fila"><label for="lxVol">Volumen</label><select id="lxVol"><option value="normal">Normal</option><option value="alto">Alto</option></select></div>'+
   '<div class="lx-fila"><label for="lxBusca">Decir «El lince busca…»<small>Antes de cada palabra.</small></label><input type="checkbox" id="lxBusca"></div>'+
   '<div class="lx-fila"><label for="lxOido">A oído<small>Esconde la palabra escrita: solo se oye.</small></label><input type="checkbox" id="lxOido"></div>'+
   '<p style="font-size:13px;color:#4d6457;margin:10px 0 0">Para elegir sonido o tipo de dibujo, usa los botones de la parte de arriba del juego. Estos ajustes se guardan solo en este aparato.</p>'+
   '<button class="lx-cerrar" type="button" id="lxCerrar">Listo</button></div>';
  var ob=document.createElement('button'); ob.className='lx-oir'; ob.type='button'; ob.title='Repetir la palabra'; ob.setAttribute('aria-label','Repetir la palabra'); ob.textContent='🔊';
  function monta(){
    document.body.appendChild(ab); document.body.appendChild(ob); document.body.appendChild(ap); document.body.appendChild(velo);
    var $=function(i){return document.getElementById(i)};
    $('lxVoz').checked=A.voz; $('lxVol').value=A.volumen; $('lxBusca').checked=A.busca; $('lxOido').checked=A.aoido; aplica();
    ab.onclick=function(){ap.hidden=false};
    $('lxCerrar').onclick=function(){ap.hidden=true};
    ap.onclick=function(e){ if(e.target===ap) ap.hidden=true };
    $('lxVoz').onchange=function(){A.voz=this.checked;guarda()};
    $('lxVol').onchange=function(){A.volumen=this.value;guarda()};
    $('lxBusca').onchange=function(){A.busca=this.checked;guarda()};
    $('lxOido').onchange=function(){A.aoido=this.checked;guarda()};
    ob.onclick=function(){ diObjetivo(); };
    var tc=$('targetCard'); if(tc) tc.addEventListener('click',diObjetivo);
    velo.querySelectorAll('a[data-sk]').forEach(function(a){ a.addEventListener('click',function(){cuenta('skool_'+a.getAttribute('data-sk'))}); });
    $('lxJugar').onclick=function(){
      velo.hidden=true; cuenta('jugar');
      try{ if(typeof resetGame==='function') resetGame(); }catch(e){}
    };
    /* di la palabra cada vez que cambia el objetivo (y la sigue diciendo si se pulsa la carta) */
    var n=$('targetName'), tmr=null;
    if(n && window.MutationObserver){
      new MutationObserver(function(){ if(!velo.hidden) return; clearTimeout(tmr); tmr=setTimeout(diObjetivo,220); }).observe(n,{childList:true,characterData:true,subtree:true});
    }
    var fin=$('endScreen');
    if(fin && window.MutationObserver){
      new MutationObserver(function(){ if(fin.classList.contains('show')) di('_completo',true); }).observe(fin,{attributes:true,attributeFilter:['class']});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',monta); else monta();
})();
