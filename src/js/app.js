(function(){
  var DATA=window.FUEL_CONFIG.norms;
  var KEY='fuel-calc-v4',OKEY='fuel-calc-odo';
  var odo={a:'',b:''};
  try{var q=JSON.parse(localStorage.getItem(OKEY)||'null');if(q)odo=q}catch(e){}
  var els=[].slice.call(document.querySelectorAll('section.row[data-i]'));
  var state=DATA.map(function(){return {km:'',t:'plus'}});
  try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.length===DATA.length)state=s}catch(e){}
  function num(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)&&n>0?n:0}
  function fmt(n,d){return n.toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d})}
  function calc(){
    var sum=0,km=0;
    DATA.forEach(function(d,i){
      var sec=els[i],norm=d[state[i].t],k=num(state[i].km),l=k*norm/100;
      sec.querySelectorAll('.seg input').forEach(function(r){r.checked=(r.value===state[i].t)});
      sec.querySelector('.norm').textContent=fmt(norm,2);
      sec.querySelector('.out').textContent=fmt(l,2);
      sum+=l;km+=k;
    });
    var oa=num(odo.a),ob=num(odo.b),dr=0,msg='',warn=false;
    if(odo.a!==''&&odo.b!==''){
      if(ob>=oa){dr=ob-oa;var rest=dr-km;
        if(km>0){msg=Math.abs(rest)<0.05?'Весь пробег распределён':(rest>0?'Осталось распределить: '+fmt(rest,1)+' км':'Распределено больше на '+fmt(-rest,1)+' км');warn=rest<-0.05}
      }else{msg='Конец меньше начала';warn=true}
    }
    document.getElementById('driven').textContent=fmt(dr,1);
    var lf=document.getElementById('left');lf.textContent=msg;lf.className=warn?'warn':'';
    try{localStorage.setItem(OKEY,JSON.stringify(odo))}catch(e){}
    document.getElementById('sum').textContent=fmt(sum,2);
    document.getElementById('km').textContent=fmt(km,1);
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
  }
  ['a','b'].forEach(function(k,j){
    var o=document.getElementById('o'+j);o.value=odo[k];
    o.addEventListener('input',function(){odo[k]=o.value;calc()});
  });
  els.forEach(function(sec,i){
    var inp=sec.querySelector('input[type=text]');inp.value=state[i].km;
    inp.addEventListener('input',function(){state[i].km=inp.value;calc()});
    sec.querySelectorAll('.seg input').forEach(function(r){r.addEventListener('change',function(){state[i].t=r.value;calc()});r.addEventListener('click',function(){state[i].t=r.value;calc()})});
  });
  document.getElementById('reset').addEventListener('click',function(){
    state.forEach(function(s,i){s.km='';els[i].querySelector('input[type=text]').value=''});
    odo={a:'',b:''};document.getElementById('o0').value='';document.getElementById('o1').value='';calc();
  });
  calc();
})();
