'use strict';
const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d', {willReadFrequently:true});
let photo = null, points = [], currentKey = [], revision = 0;
const letters = () => 'ABCDE'.slice(0, Number($('choices').value));
function message(text) { $('message').textContent = text; }
function getKey() {
  const key = $('key').value.toUpperCase().trim().split(/[\s,;]+/).filter(Boolean);
  if (!key.length || key.length > 200 || key.some(a => a.length !== 1 || !letters().includes(a))) throw Error('Informe de 1 a 200 respostas válidas para a quantidade de alternativas escolhida.');
  return key;
}
function invalidate() { $('review').hidden = $('result').hidden = true; currentKey = []; message(''); }
['key','choices'].forEach(id => $(id).addEventListener('input',invalidate));
function draw() {
  if (!photo) return;
  ctx.drawImage(photo,0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#00b981';ctx.lineWidth=3;
  points.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.stroke();});
}
$('photo').addEventListener('change', async e => {
  const token = ++revision;
  photo = null; points = []; $('reader').hidden = true; invalidate();
  const file=e.target.files[0];if(!file)return;
  const url=URL.createObjectURL(file), img=new Image();
  try {
    img.src=url;await img.decode();if(token!==revision)return;
    const ratio=Math.min(1,1800/Math.max(img.width,img.height));
    canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);
    photo=img;$('reader').hidden=false;draw();
  } catch {message('Não foi possível abrir a imagem. Tente uma foto JPEG ou PNG.');}
  finally {URL.revokeObjectURL(url);}
});
canvas.addEventListener('click',e=>{
  if(!photo)return;if(points.length===2)points=[];
  const rect=canvas.getBoundingClientRect();points.push({x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height});draw();
});
$('reset').onclick=()=>{points=[];draw();};
function review(responses) {
  currentKey=getKey();$('answers').replaceChildren();$('result').hidden=true;
  currentKey.forEach((_,i)=>{
    const row=document.createElement('div');row.className='answer';
    const label=document.createElement('label');label.htmlFor='answer-'+i;label.textContent='Questão '+(i+1);
    const select=document.createElement('select');select.id='answer-'+i;
    [['','Em branco'],...Array.from(letters(),a=>[a,a])].forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);});
    select.value=responses[i]||'';select.onchange=()=>{$('result').hidden=true;};row.append(label,select);
    if(!responses[i]){const note=document.createElement('small');note.textContent='Revisar';row.append(note);} $('answers').append(row);
  });$('review').hidden=false;message('Revise as respostas antes de calcular a nota.');
}
$('manual').onclick=()=>{try{review([]);}catch(e){message(e.message);}};
$('read').onclick=()=>{
  try {
    const key=getKey(), count=letters().length;
    if(!photo||points.length!==2)throw Error('Selecione os dois extremos da grade na foto.');
    const [a,b]=points;
    if(b.x-a.x<30 || (key.length>1 && b.y-a.y<10*(key.length-1)))throw Error('Selecione do canto superior esquerdo para o inferior direito, com espaço suficiente entre as linhas.');
    ctx.drawImage(photo,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    const dx=(b.x-a.x)/(count-1),dy=key.length>1?(b.y-a.y)/(key.length-1):dx;
    const radius=Math.max(2,Math.min(18,dx*.20,dy*.20));
    const responses=key.map((_,i)=>{
      const scores=Array.from({length:count},(_,j)=>{
        const cx=a.x+j*dx,cy=key.length>1?a.y+i*dy:a.y;let sum=0,n=0;
        for(let y=Math.max(0,Math.floor(cy-radius));y<=Math.min(canvas.height-1,cy+radius);y++)for(let x=Math.max(0,Math.floor(cx-radius));x<=Math.min(canvas.width-1,cx+radius);x++){
          if((x-cx)**2+(y-cy)**2>radius**2)continue;
          const k=(y*canvas.width+x)*4;sum+=1-(pixels.data[k]*.299+pixels.data[k+1]*.587+pixels.data[k+2]*.114)/255;n++;
        }return {letter:letters()[j],score:n?sum/n:0};
      }).sort((x,y)=>y.score-x.score);
      return scores[0].score>.22 && scores[0].score-scores[1].score>.12?scores[0].letter:'';
    });draw();review(responses);
  }catch(e){message(e.message);}
};
$('grade').onclick=()=>{
  try {
    const maximum=Number($('maximum').value);if(!Number.isFinite(maximum)||maximum<=0)throw Error('Informe uma nota máxima maior que zero.');
    if(!currentKey.length)throw Error('Informe o gabarito e revise as respostas.');
    const responses=currentKey.map((_,i)=>$('answer-'+i).value);
    const correct=responses.filter((a,i)=>a===currentKey[i]).length;
    const result=$('result');result.replaceChildren();
    const heading=document.createElement('h2');heading.textContent=$('title').value||'Resultado';
    const student=document.createElement('p');student.textContent=$('student').value||'Aluno não informado';
    const grade=document.createElement('strong');grade.textContent=(maximum*correct/currentKey.length).toLocaleString('pt-BR',{maximumFractionDigits:2})+' / '+maximum.toLocaleString('pt-BR');
    const summary=document.createElement('p');summary.textContent=`${correct} acertos em ${currentKey.length} questões · ${responses.filter(a=>!a).length} em branco. Resultado baseado nas respostas revisadas.`;
    const table=document.createElement('table');
    const header=table.createTHead().insertRow();['Questão','Correta','Aluno','Resultado'].forEach(text=>{const th=document.createElement('th');th.textContent=text;header.append(th);});
    const body=table.createTBody();currentKey.forEach((a,i)=>{const row=body.insertRow();[i+1,a,responses[i]||'—',responses[i]===a?'Acertou':'Errou'].forEach(text=>{row.insertCell().textContent=text;});});
    result.append(heading,student,grade,summary,table);result.hidden=false;message('');result.scrollIntoView({behavior:'smooth'});
  }catch(e){message(e.message);}
};
