/* Visualizador de PDF em modal + navegação ativa */
(function(){
  // ---- Ligações de âncora junto a cabeçalhos com id ----
  (function(){
    var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
    var cabs = document.querySelectorAll('h2[id], h3[id], h4[id], h2.titulo, h3.cabec, .cabec h3');
    cabs.forEach(function(h){
      var id = h.id;
      // herdar o id do contentor de secção quando o cabeçalho não tem id próprio
      if(!id){
        var cont = h.closest('section[id], .aula[id]');
        if(cont) id = cont.id;
      }
      if(!id) return;
      if(h.querySelector('.anchor-link')) return;
      h.classList.add('tem-anchor');
      var btn = document.createElement('button');
      btn.className = 'anchor-link';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copiar ligação para esta secção');
      btn.title = 'Copiar ligação para esta secção';
      btn.innerHTML = ICON;
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var url = location.origin + location.pathname + '#' + id;
        history.replaceState(null, '', '#' + id);
        function feito(){ btn.classList.add('copiado'); setTimeout(function(){ btn.classList.remove('copiado'); }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(feito, function(){ fallback(url); feito(); });
        } else { fallback(url); feito(); }
      });
      h.appendChild(btn);
    });
    function fallback(text){
      var t = document.createElement('textarea');
      t.value = text; t.style.position='fixed'; t.style.opacity='0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch(e){}
      document.body.removeChild(t);
    }
  })();

  // ---- Modal PDF ----
  var modal, frame, titulo, btnDownload, btnAbrir;

  function montarModal(){
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML =
      '<div class="painel">' +
        '<div class="barra">' +
          '<span class="titulo-modal"></span>' +
          '<div class="controlos">' +
            '<a class="btn fantasma abrir" target="_blank" rel="noopener">Abrir em nova aba ↗</a>' +
            '<a class="btn primario download">Descarregar ↓</a>' +
            '<button class="fechar" aria-label="Fechar">×</button>' +
          '</div>' +
        '</div>' +
        '<iframe title="Visualizador de PDF"></iframe>' +
      '</div>';
    document.body.appendChild(modal);
    frame = modal.querySelector('iframe');
    titulo = modal.querySelector('.titulo-modal');
    btnDownload = modal.querySelector('.download');
    btnAbrir = modal.querySelector('.abrir');

    modal.addEventListener('click', function(e){
      if (e.target === modal || e.target.classList.contains('fechar')) fechar();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') fechar();
    });
  }

  function abrir(url, nome){
    if (!modal) montarModal();
    titulo.textContent = nome || '';
    frame.src = url;
    btnDownload.href = url;
    btnDownload.setAttribute('download','');
    btnAbrir.href = url;
    modal.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  }

  function fechar(){
    modal.classList.remove('aberto');
    frame.src = '';
    document.body.style.overflow = '';
  }

  // Delegação: qualquer elemento com data-pdf abre o visualizador
  document.addEventListener('click', function(e){
    var alvo = e.target.closest('[data-pdf]');
    if (alvo){
      e.preventDefault();
      abrir(alvo.getAttribute('data-pdf'), alvo.getAttribute('data-nome') || alvo.getAttribute('data-pdf'));
    }
  });

  // ---- Carrossel "Análise de Conteúdo" + lightbox ----
  // lightbox partilhado (criado uma vez)
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="lb-fechar" aria-label="Fechar">×</button>' +
    '<button class="lb-nav lb-prev" aria-label="Anterior">‹</button>' +
    '<img alt=""><div class="lb-leg"></div>' +
    '<button class="lb-nav lb-next" aria-label="Seguinte">›</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbLeg = lb.querySelector('.lb-leg'), lbCtrl = null;
  function lbAtualiza(){ if(!lbCtrl) return; var o=lbCtrl.atual(); lbImg.src=o.src; lbLeg.textContent=o.leg||''; }
  function lbFechar(){ lb.classList.remove('aberto'); lbImg.src=''; document.body.style.overflow=''; lbCtrl=null; }
  lb.querySelector('.lb-fechar').addEventListener('click', lbFechar);
  lb.querySelector('.lb-prev').addEventListener('click', function(){ if(lbCtrl){lbCtrl.ir(-1);lbAtualiza();} });
  lb.querySelector('.lb-next').addEventListener('click', function(){ if(lbCtrl){lbCtrl.ir(1);lbAtualiza();} });
  lb.addEventListener('click', function(e){ if(e.target===lb) lbFechar(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('aberto')) return;
    if(e.key==='Escape') lbFechar();
    if(e.key==='ArrowLeft' && lbCtrl){ lbCtrl.ir(-1); lbAtualiza(); }
    if(e.key==='ArrowRight' && lbCtrl){ lbCtrl.ir(1); lbAtualiza(); }
  });

  // construtor de carrossel reutilizável
  function montarCarrossel(host, imgs){
    if (!host || !imgs || !imgs.length) return;
    var cur = 0;
    var slides = imgs.map(function(o,i){
      return '<figure class="slide'+(i===0?' ativo':'')+'" data-i="'+i+'">' +
               '<img src="'+o.src+'" alt="'+(o.leg||'')+'" loading="'+(i===0?'eager':'lazy')+'">' +
               (o.leg ? '<figcaption class="leg">'+o.leg+'</figcaption>' : '') +
             '</figure>';
    }).join('');
    var dots = imgs.map(function(o,i){ return '<button data-i="'+i+'" class="'+(i===0?'ativo':'')+'" aria-label="Imagem '+(i+1)+'"></button>'; }).join('');
    var tiras = imgs.map(function(o,i){ return '<img src="'+o.src+'" data-i="'+i+'" class="'+(i===0?'ativo':'')+'" alt="" loading="lazy">'; }).join('');

    host.innerHTML =
      '<div class="carrossel">' +
        '<div class="palco">' + slides +
          '<span class="carr-contador"><b>1</b> / '+imgs.length+'</span>' +
          (imgs.length>1 ? '<button class="carr-nav carr-prev" aria-label="Anterior">‹</button><button class="carr-nav carr-next" aria-label="Seguinte">›</button>' : '') +
        '</div>' +
        (imgs.length>1 ? '<div class="carr-dots">' + dots + '</div><div class="carr-tiras">' + tiras + '</div>' : '') +
      '</div>';

    var elSlides = host.querySelectorAll('.slide');
    var elDots   = host.querySelectorAll('.carr-dots button');
    var elTiras  = host.querySelectorAll('.carr-tiras img');
    var elCont   = host.querySelector('.carr-contador b');

    function ir(delta){
      cur = (cur + delta + imgs.length) % imgs.length;
      aplica();
    }
    function vai(i){ cur = (i + imgs.length) % imgs.length; aplica(); }
    function aplica(){
      elSlides.forEach(function(s,k){ s.classList.toggle('ativo', k===cur); });
      elDots.forEach(function(d,k){ d.classList.toggle('ativo', k===cur); });
      elTiras.forEach(function(t,k){ t.classList.toggle('ativo', k===cur);
        if(k===cur) t.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'}); });
      if(elCont) elCont.textContent = cur+1;
    }
    var prev = host.querySelector('.carr-prev'), next = host.querySelector('.carr-next');
    if(prev) prev.addEventListener('click', function(){ ir(-1); });
    if(next) next.addEventListener('click', function(){ ir(1); });
    elDots.forEach(function(d){ d.addEventListener('click', function(){ vai(+d.dataset.i); }); });
    elTiras.forEach(function(t){ t.addEventListener('click', function(){ vai(+t.dataset.i); }); });

    var ctrl = { ir:ir, atual:function(){ return imgs[cur]; } };

    // teclado quando este carrossel está visível e o lightbox fechado
    document.addEventListener('keydown', function(e){
      if(lb.classList.contains('aberto')) return;
      var r = host.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0){
        if(e.key==='ArrowLeft') ir(-1);
        if(e.key==='ArrowRight') ir(1);
      }
    });

    // clicar num slide abre o lightbox neste carrossel
    elSlides.forEach(function(s){ s.addEventListener('click', function(){
      lbCtrl = ctrl; lbAtualiza(); lb.classList.add('aberto'); document.body.style.overflow='hidden';
    }); });
  }

  // Carrossel 1: Análise de Conteúdo
  var hostAC = document.getElementById('galeria-analise');
  if (hostAC){
    if (window.GALERIA_ANALISE && window.GALERIA_ANALISE.length) montarCarrossel(hostAC, window.GALERIA_ANALISE);
    else hostAC.outerHTML = '<div class="galeria-vazia">O carrossel está pronto. Coloca as imagens dos trabalhos na pasta <b>img/galeria-analise-conteudo/</b> e elas aparecem aqui.</div>';
  }
  // Carrossel 2: Inquérito
  montarCarrossel(document.getElementById('galeria-inquerito'), window.GALERIA_INQUERITO);

  // Carrosséis das "Outras atividades de estágio"
  montarCarrossel(document.getElementById('galeria-visitas'), window.GAL_VISITAS);
  montarCarrossel(document.getElementById('galeria-agrupamento'), window.GAL_AGRUPAMENTO);
  montarCarrossel(document.getElementById('galeria-jornadas'), window.GAL_JORNADAS);
  montarCarrossel(document.getElementById('galeria-formacao-museu'), window.GAL_FORMACAO_MUSEU);

  // ---- Destaques do questionário (10 questões, gráficos) ----
  var qhost = document.getElementById('questionario-destaques');
  if (qhost && window.QUESTIONARIO_DESTAQUES){
    var Q = window.QUESTIONARIO_DESTAQUES;
    var COR = { azul:'#1b5aa0', azulClaro:'#7ea8d8', azulEsc:'#0b2a4a',
                verde:'#1f7a4d', vermelho:'#c0506e',
                paleta:['#13447a','#1b5aa0','#2a72c4','#5b91d4','#7ea8d8','#a9c6e6'] };

    qhost.innerHTML =
      '<p class="quest-legenda">'+Q.n+' respostas · '+Q.questoes.length+' questões, por ordem · nas escalas, <b>5 = «muito»</b> e <b>1 = «nada»</b> (média mais alta = mais positiva).</p>' +
      '<div class="quest-grid" id="q-grid"></div>';
    var grid = qhost.querySelector('#q-grid');

    var TIPO_LAB = {escala:'Escala 1–5', simnao:'Sim / Não', opcoes:'Escolha', texto:'Resposta aberta'};
    function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    Q.questoes.forEach(function(q,i){
      var card = document.createElement('div');
      card.className = 'qcard' + (q.tipo==='texto' ? ' qcard-texto' : '');
      var num = q.i ? '<span class="qnum">'+q.i+'</span>' : '';
      var corpo, extra = '';
      if (q.tipo === 'texto'){
        var vs = (q.respostas||[]);
        corpo = vs.length
          ? '<div class="qcitacoes">' + vs.map(function(v){ return '<div class="qcit">«'+esc(v)+'»</div>'; }).join('') + '</div>'
          : '<p class="quest-vazio">Sem respostas escritas.</p>';
      } else {
        corpo = '<div class="qchart-wrap"><canvas id="qc'+i+'"></canvas></div>';
        extra = (q.tipo==='escala' && q.media!=null) ? '<span class="qmedia">★ Média '+q.media+' / 5</span>' : '';
      }
      card.innerHTML =
        '<div class="qcard-top">'+num+'<span class="qtipo '+q.tipo+'">'+TIPO_LAB[q.tipo]+'</span></div>' +
        '<h4>'+esc(q.q)+'</h4>' +
        corpo + extra;
      grid.appendChild(card);
    });

    function desenhar(){
      if (typeof Chart === 'undefined') return;
      Chart.defaults.font.family = "'Helvetica Neue','Helvetica',Arial,sans-serif";
      Chart.defaults.color = '#52627a';
      Q.questoes.forEach(function(q,i){
        if(q.tipo==='texto') return;
        var ctx = document.getElementById('qc'+i);
        if(!ctx) return;
        var labels = q.dados.map(function(d){return d.rotulo;});
        var vals = q.dados.map(function(d){return d.valor;});

        if (q.tipo === 'simnao'){
          new Chart(ctx, {
            type:'doughnut',
            data:{labels:labels, datasets:[{data:vals,
              backgroundColor: labels.map(function(l){return l==='Sim'?COR.verde:COR.vermelho;}),
              borderWidth:2, borderColor:'#fff'}]},
            options:{cutout:'62%', plugins:{
              legend:{position:'bottom', labels:{boxWidth:12, padding:14, font:{size:12}}},
              tooltip:{callbacks:{label:function(c){var t=vals.reduce(function(a,b){return a+b;},0);return c.label+': '+c.parsed+' ('+Math.round(c.parsed/t*100)+'%)';}}}
            }}
          });
        } else {
          var horiz = (q.tipo==='opcoes');
          new Chart(ctx, {
            type:'bar',
            data:{labels:labels, datasets:[{data:vals,
              backgroundColor: q.tipo==='opcoes' ? labels.map(function(_,k){return COR.paleta[k%COR.paleta.length];}) : COR.azul,
              borderRadius:6, maxBarThickness:34}]},
            options:{
              indexAxis: horiz ? 'y' : 'x',
              plugins:{legend:{display:false},
                tooltip:{callbacks:{label:function(c){var t=vals.reduce(function(a,b){return a+b;},0);var v=horiz?c.parsed.x:c.parsed.y;return v+' ('+Math.round(v/t*100)+'%)';}}}},
              scales: horiz
                ? {x:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef2f7'}}, y:{grid:{display:false}}}
                : {y:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef2f7'}}, x:{grid:{display:false}}}
            }
          });
        }
      });
    }

    // Chart.js é carregado localmente (vendor/chart.umd.min.js) antes deste script.
    // Fallbacks: cópia local -> CDN, caso a ordem de carregamento falhe.
    function carregar(src, prox){
      var s = document.createElement('script');
      s.src = src; s.onload = desenhar; s.onerror = prox;
      document.head.appendChild(s);
    }
    if (typeof Chart !== 'undefined'){
      desenhar();
    } else {
      carregar('vendor/chart.umd.min.js', function(){
        carregar('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js', function(){
          grid.insertAdjacentHTML('afterbegin','<p class="quest-vazio">Não foi possível carregar a biblioteca de gráficos.</p>');
        });
      });
    }
  }

  // ---- Navegação ativa por scroll (apenas na home) ----
  var links = document.querySelectorAll('.nav a[href^="#"]');
  if (links.length){
    var secs = [];
    links.forEach(function(l){
      var s = document.querySelector(l.getAttribute('href'));
      if (s) secs.push({link:l, sec:s});
    });
    window.addEventListener('scroll', function(){
      var y = window.scrollY + 120;
      var atual = null;
      secs.forEach(function(o){ if (o.sec.offsetTop <= y) atual = o; });
      links.forEach(function(l){ l.classList.remove('ativo'); });
      if (atual) atual.link.classList.add('ativo');
    }, {passive:true});
  }
})();
