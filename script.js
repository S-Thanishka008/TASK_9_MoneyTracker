let list=[];
let cap=0;
let user=" ";
document.addEventListener("DOMContentLoaded",() =>{
    askUser();
    putDate();
    load();
    bind();
    calc();
});
function askUser(){
    let saved=localStorage.getItem('user');
    if (!saved){
        let name=prompt("Welcome to VAULTO! What is your name?");
        saved=(name && name.trim()) ? name.trim() : "User";
        localStorage.setItem('user',saved);
    }
    user = saved;
    let hrs=new Date().getHours();
    let txt ="Good Morning";
    if (hrs >=12 && hrs < 17) txt= "Good afternoon";
    if (hrs >=17) txt="Good Evening";
    let el=document.getElementById('user');
    if (el) el.textContent=`${txt},${user}`;
}
function putDate(){
    let el=document.getElementById('day');
    let d=new Date();
    if (el) el.textContent = d.toLocaleDateString();
    let inp=document.getElementById('dt');
    if (inp) inp.value=d.toISOString().split('T')[0];
}
function load(){
    try{
        let rawList = localStorage.getItem('list');
        let rawCap = localStorage.getItem('cap');
        list = rawList ? JSON.parse(rawList) : [];
        cap = rawCap ? parseFloat(rawCap) : 0;
    } catch (e){
        list = [];
        cap=0;
    }
    let inp=document.getElementById('set');
    if (inp && cap >0) inp.value=cap;
}
function save(){
    try{
        localStorage.setItem('list',JSON.stringify(list));
        localStorage.setItem('cap',JSON.stringify(cap));
    } catch (e) {}
}
function isNow(str){
    let a = new Date(str);
    let b = new Date();
    return a.getFullYear()===b.getFullYear() && a.getMonth() === b.getMonth();
}
function bind(){
    let f1 = document.getElementById('add');
    if (f1) f1.addEventListener('submit',addExp);
    let f2 = document.getElementById('form');
    if (f2) f2.addEventListener('submit',setLimit);
}
function setLimit(e){
    e.preventDefault();
    let inp= document.getElementById('set');
    if (!inp) return;
    let v=parseFloat(inp.value);
    if (isNaN(v) || v <= 0) return;
    cap = v;
    save();
    calc();
    alert('Budget updated!');
}
function addExp(e){
    e.preventDefault();
    let name=document.getElementById('name').value.trim();
    let amt=parseFloat(document.getElementById('amt').value);
    let cat=document.getElementById('cat').value;
    let dt=document.getElementById('dt').value;
    let err = document.getElementById('err');
    if (!name|| isNaN(amt) || !cat || !dt){
        if (err) {
            err.textContent='All Fields required'; 
            err.classList.remove('none');
        }
        return;
    }
    if (amt<=0) {
        if (err) {err.textContent='Amount must be > 0 !'; 
            err.classList.remove('none');
        }
        return;
    }
    if (err) err.classList.add('none');
    list.unshift({
        id: Date.now().toString,
        name: name,
        amt: amt,
        cat: cat,
        dt: dt
    });
    save();
    calc();
    document.getElementById('name').value=' ';
    document.getElementById('amt').value=' ';
    document.getElementById('cat').value='';
    putDate();
}
window.del=function(id){
    list=list.filter(item => String(item.id)!== String(id));
    save();
    calc();
};
function calc(){
    let cur=list.filter(item=> isNow(item.dt));
    let sum=cur.reduce((a,b)=> a+b.amt,0);
    let rem = cap - sum;
    let elSum=document.getElementById('sum');
    let elRem=document.getElementById('rem');
    let elMax=document.getElementById('max');
    let elWarn=document.getElementById('warn');
    if (elSum) elSum.textContent = `₹${sum.toFixed(2)}`;
    if (elRem){
        elRem.textContent=`₹${rem.toFixed(2)}`;
        elRem.style.color=(cap>0 && rem <0) ? '#dc2626' : '#8b91f4';
    }
    if (elWarn){
        if (cap  >0 && rem<0) elWarn.classList.remove('none');
        else elWarn.classList.add('none');
    }
    if (elMax){
        if (cur.length >0){
            let top = cur.reduce((a,b) => b.amt > a.amt ? b : a);
            elMax.textContent=`₹${top.amt.toFixed(2)}`;
        }else{
            elMax.textContent='₹0.00';
        }
    }
    showCat(cur,sum);
    showTable();
}
function showCat(cur,sum){
    let box = document.getElementById('cats');
    if (!box) return;
    box.innerHTML='';
    let cats=['Food','Travel','Shopping','Other'];
    cats.forEach( c=>{
        let total=cur.filter(x => x.cat === c).reduce((a,b) => a+b.amt, 0);
        let pct = sum > 0 ? Math.round((total / sum)*100) : 0;
        let div = document.createElement('div');
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                <span>${c}</span>
                <strong>₹${total.toFixed(2)} (${pct}%)</strong>
            </div>
            <div class="bar-bg" style="height:6px; background:#201538; border-radius:3px; overflow:hidden;">
                <div class="bar" style="width:${pct}%; height:100%; background:#ff4d2e; border-radius:3px;"></div>
            </div>
        `;
        box.appendChild(div);
    });
}
function showTable(){
    let tb=document.getElementById('body');
    let emp=document.getElementById('empty');
    if (!tb) return;
    tb.innerHTML='';
    if (list.length ===0){
        if (emp) emp.classList.remove('none');
        return;
    }
    if (emp) emp.classList.add('none');
    list.forEach(x => {
        let tr=document.createElement('tr');
        tr.innerHTML = `
            <td>${x.name}</td>
            <td><span class="pill" style="padding:2px 8px; border-radius:10px; background:#382654; font-size:0.8rem;">${x.cat}</span></td>
            <td>${x.dt}</td>
            <td>₹${x.amt.toFixed(2)}</td>
            <td><button type="button" class="btn del" onclick="window.del('${x.id}')">Del</button></td>
        `;
        tb.appendChild(tr);
    })
}
