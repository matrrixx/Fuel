(function(){
  var DEFAULTS=window.FUEL_CONFIG.norms;
  var KEY='fuel-calc-v4',OKEY='fuel-calc-odo',NKEY='fuel-calc-norms',TKEY='fuel-calc-tank';

  function clone(a){return JSON.parse(JSON.stringify(a))}
  function valid(a){
    return Array.isArray(a)&&a.length>0&&a.every(function(x){
      return x&&typeof x.name==='string'&&isFinite(x.plus)&&isFinite(x.minus)
    })
  }
  function num(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)&&n>0?n:0}
  function fmt(n,d){return n.toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d})}
  function show(n){return String(n).replace('.',',')}

  var norms=clone(DEFAULTS);
  try{var n0=JSON.parse(localStorage.getItem(NKEY)||'null');if(valid(n0))norms=n0}catch(e){}

  var odo={a:'',b:''};
  try{var q=JSON.parse(localStorage.getItem(OKEY)||'null');if(q)odo=q}catch(e){}

  var tank={start:'',refuels:[]};
  try{var tq=JSON.parse(localStorage.getItem(TKEY)||'null');
    if(tq&&typeof tq.start==='string'&&Array.isArray(tq.refuels))tank={start:tq.start,refuels:tq.refuels.map(String)}}catch(e){}

  var state=[];
  try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(s))state=s}catch(e){}
  function fitState(){
    while(state.length<norms.length)state.push({km:'',t:'plus'});
    state.length=norms.length;
    state.forEach(function(x,i){if(!x||typeof x!=='object')state[i]={km:'',t:'plus'}});
  }
  fitState();

  function saveNorms(){try{localStorage.setItem(NKEY,JSON.stringify(norms))}catch(e){}}

  var rowsEl=document.getElementById('rows');
  var listEl=document.getElementById('adminList');

  /* ---------- расчёт ---------- */
  function calc(){
    var sum=0,km=0,els=rowsEl.children;
    norms.forEach(function(d,i){
      var sec=els[i];if(!sec)return;
      var t=state[i].t==='minus'?'minus':'plus',norm=Number(d[t])||0,k=num(state[i].km),l=k*norm/100;
      [].forEach.call(sec.querySelectorAll('.seg input'),function(r){r.checked=(r.value===t)});
      sec.querySelector('.norm').textContent=fmt(norm,2);
      sec.querySelector('.out').textContent=fmt(l,2);
      sum+=l;km+=k;
    });
    var rf=tank.refuels.reduce(function(s,v){return s+num(v)},0),
        has=tank.start!==''||tank.refuels.some(function(v){return v!==''}),
        end=num(tank.start)+rf-sum,
        tr=document.getElementById('tankRes'),tm=document.getElementById('tankMeta');
    tr.textContent=has?'Заправлено: '+fmt(rf,2)+' л · Всего топлива: '+fmt(num(tank.start)+rf,2)+' л':'';
    tm.hidden=!has;
    if(has){
      if(end>=-0.005){tm.textContent='Остаток в конце: '+fmt(Math.max(end,0),2)+' л';tm.className='meta'}
      else{tm.textContent='Не хватает топлива: '+fmt(-end,2)+' л';tm.className='meta bad'}
    }
    var oa=num(odo.a),ob=num(odo.b),dr=0,msg='',warn=false;
    if(odo.a!==''&&odo.b!==''){
      if(ob>=oa){dr=ob-oa;var rest=dr-km;
        if(km>0){msg=Math.abs(rest)<0.05?'Весь пробег распределён':(rest>0?'Осталось распределить: '+fmt(rest,1)+' км':'Распределено больше на '+fmt(-rest,1)+' км');warn=rest<-0.05}
      }else{msg='Конец меньше начала';warn=true}
    }
    document.getElementById('driven').textContent=fmt(dr,1);
    var lf=document.getElementById('left');lf.textContent=msg;lf.className=warn?'warn':'';
    document.getElementById('sum').textContent=fmt(sum,2);
    document.getElementById('km').textContent=fmt(km,1);
    try{localStorage.setItem(OKEY,JSON.stringify(odo));localStorage.setItem(TKEY,JSON.stringify(tank));localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
  }

  /* ---------- строки калькулятора ---------- */
  function build(){
    rowsEl.innerHTML='';
    norms.forEach(function(nm,i){
      var sec=document.createElement('section');
      sec.className='row';
      sec.innerHTML='<h2></h2><div class="fields"><div><label for="k'+i+'">Пробег, км</label><input type="text" id="k'+i+'" inputmode="decimal" placeholder="0"></div><div><span class="lbl">Температура</span><div class="seg"><label><input type="radio" name="t'+i+'" value="plus"><span>+</span></label><label><input type="radio" name="t'+i+'" value="minus"><span>\u2212</span></label></div></div></div><div class="sub">Норма: <b class="norm"></b> л/100 км · расход: <b class="out">0,00</b> л</div>';
      sec.querySelector('h2').textContent=(i+1)+'. '+(nm.name||'Без названия');
      var inp=sec.querySelector('input[type=text]');
      inp.value=state[i].km;
      inp.addEventListener('input',function(){state[i].km=inp.value;calc()});
      [].forEach.call(sec.querySelectorAll('.seg input'),function(r){
        function pick(){state[i].t=r.value;calc()}
        r.addEventListener('change',pick);r.addEventListener('click',pick);
      });
      rowsEl.appendChild(sec);
    });
    calc();
  }

  /* ---------- панель норм ---------- */
  function buildAdmin(){
    listEl.innerHTML='';
    norms.forEach(function(nm,i){
      var d=document.createElement('div');
      d.className='arow';
      d.innerHTML='<div class="afull"><label for="an'+i+'">Название</label><input type="text" id="an'+i+'"></div><div><label for="ap'+i+'">При плюсе</label><input type="text" id="ap'+i+'" inputmode="decimal"></div><div><label for="am'+i+'">При минусе</label><input type="text" id="am'+i+'" inputmode="decimal"></div>'+(norms.length>1?'<button type="button" class="btn danger del">Удалить строку</button>':'');
      var n=d.querySelector('#an'+i),p=d.querySelector('#ap'+i),m=d.querySelector('#am'+i);
      n.value=nm.name;p.value=show(nm.plus);m.value=show(nm.minus);
      n.addEventListener('input',function(){norms[i].name=n.value;saveNorms();build()});
      p.addEventListener('input',function(){norms[i].plus=num(p.value);saveNorms();build()});
      m.addEventListener('input',function(){norms[i].minus=num(m.value);saveNorms();build()});
      var del=d.querySelector('.del');
      if(del)del.addEventListener('click',function(){
        if(!confirm('Удалить строку «'+(nm.name||'Без названия')+'»?'))return;
        norms.splice(i,1);state.splice(i,1);saveNorms();buildAdmin();build();
      });
      listEl.appendChild(d);
    });
  }

  document.getElementById('gear').addEventListener('click',function(){
    var admin=document.getElementById('admin'),open=admin.hidden;
    admin.hidden=!open;this.setAttribute('aria-expanded',String(open));
    if(open&&admin.scrollIntoView)admin.scrollIntoView({block:'nearest'});
  });
  document.getElementById('addNorm').addEventListener('click',function(){
    norms.push({name:'Новая норма',plus:0,minus:0});fitState();saveNorms();buildAdmin();build();
    var last=listEl.querySelector('.arow:last-child input');if(last){last.focus();last.select()}
  });
  document.getElementById('resetNorms').addEventListener('click',function(){
    if(!confirm('Вернуть исходные нормы? Свои изменения вы потеряете.'))return;
    norms=clone(DEFAULTS);fitState();
    try{localStorage.removeItem(NKEY)}catch(e){}
    buildAdmin();build();
  });

  /* ---------- остаток и заправки ---------- */
  var refEl=document.getElementById('refuels');
  function buildRefuels(){
    refEl.innerHTML='';
    tank.refuels.forEach(function(v,i){
      var d=document.createElement('div');d.className='refuel';
      d.innerHTML='<div><label for="rf'+i+'">Заправка '+(i+1)+', л</label><input type="text" id="rf'+i+'" inputmode="decimal" placeholder="0"></div><button type="button" class="btn danger" aria-label="Удалить заправку '+(i+1)+'">\u2715</button>';
      var inp=d.querySelector('input');inp.value=v;
      inp.addEventListener('input',function(){tank.refuels[i]=inp.value;calc()});
      d.querySelector('button').addEventListener('click',function(){tank.refuels.splice(i,1);buildRefuels();calc()});
      refEl.appendChild(d);
    });
  }
  var ts=document.getElementById('tankStart');ts.value=tank.start;
  ts.addEventListener('input',function(){tank.start=ts.value;calc()});
  document.getElementById('addRefuel').addEventListener('click',function(){
    tank.refuels.push('');buildRefuels();calc();
    var l=refEl.querySelector('.refuel:last-child input');if(l)l.focus();
  });

  /* ---------- одометр и очистка ---------- */
  ['a','b'].forEach(function(k,j){
    var o=document.getElementById('o'+j);o.value=odo[k];
    o.addEventListener('input',function(){odo[k]=o.value;calc()});
  });
  document.getElementById('reset').addEventListener('click',function(){
    state.forEach(function(s){s.km=''});
    odo={a:'',b:''};document.getElementById('o0').value='';document.getElementById('o1').value='';
    tank={start:'',refuels:[]};ts.value='';buildRefuels();
    build();
  });

  buildAdmin();
  buildRefuels();
  build();

  /* ---------- работа без интернета ---------- */
  if('serviceWorker' in navigator){
    window.addEventListener('load',function(){
      navigator.serviceWorker.register('sw.js').catch(function(){});
    });
  }
})();
