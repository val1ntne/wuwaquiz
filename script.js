import {initFeatherEffects, featherBurst, completionFeathers} from './effects.mjs';
import {questions, columns, keyColumn, keywordDisplay, normalize, newGame, solve, nextUnsolved, unlockedKeyword} from './puzzle.mjs';
const $ = selector => document.querySelector(selector);
let game = newGame();
const input = $('#answer');
const feedback = $('#feedback');
const form = $('#answer-form');
const grid = $('#crossword');
const nav = $('#question-nav');
const sourceList = $('#sources-list');
const number = i => String(i+1).padStart(2,'0');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let completionTimer;
function motion(element, frames, options = {}) {
 if (!element || reducedMotion.matches || typeof element.animate !== 'function') return;
 element.getAnimations().forEach(animation => animation.cancel());
 return element.animate(frames, {duration: 300, easing: 'cubic-bezier(.22,1,.36,1)', ...options});
}
function openDialog(dialog) {
 if (dialog.open) return;
 dialog.showModal();
 motion(dialog, [{opacity:0,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}], {duration:360});
 if (dialog.id === 'complete-dialog') {
  completionFeathers(dialog, reducedMotion.matches);
  dialog.querySelectorAll('.result-letters span').forEach((letter,i) => motion(letter,[{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:160+i*70,fill:'backwards'}));
 }
}
function celebrateRow(index) {
 featherBurst(grid.children[index].querySelector('.key-cell'), reducedMotion.matches);
 grid.children[index].querySelectorAll('.letter').forEach((letter,i) => motion(letter,[{transform:'translateY(0)',boxShadow:'0 0 0 0 #70c8e500'},{transform:'translateY(-3px)',boxShadow:'0 4px 16px 0 #70c8e54d'},{transform:'translateY(0)',boxShadow:'0 0 0 0 #70c8e500'}],{duration:460,delay:i*30}));
}


function makeBoard() {
 grid.replaceChildren(); nav.replaceChildren();
 questions.forEach((q,i) => {
  const row = document.createElement('button');
  row.type='button'; row.className='cross-row'; row.dataset.index=i;
  row.setAttribute('aria-pressed',String(i===game.active));
  row.setAttribute('aria-label',`Hàng ngang ${i+1}, ${q.normalized.length} chữ cái${game.solved[i]?`, đã giải: ${q.answer}`:''}`);
  row.classList.toggle('active',i===game.active); row.classList.toggle('solved',game.solved[i]);
  const count = document.createElement('span'); count.className='row-number';count.textContent=number(i);count.setAttribute('aria-hidden','true');row.append(count);
  const letters = game.solved[i] ? q.normalized : normalize(game.drafts[i]);
  for(let col=0;col<columns;col++){
   const cell=document.createElement('span'); const offset=col-q.start;
   cell.setAttribute('aria-hidden','true');
   if(offset>=0 && offset<q.normalized.length){
    cell.className='letter'+(col===keyColumn?' key-cell':''); cell.textContent=letters[offset]||'';
   }else cell.className='blank-cell';
   row.append(cell);
  }
  row.addEventListener('click',()=>selectQuestion(i,true));
  row.addEventListener('keydown',event=>{ if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const next=(i+(event.key==='ArrowDown'?1:questions.length-1))%questions.length;selectQuestion(next,false);grid.children[next].focus();} });
  grid.append(row);
  const btn=document.createElement('button');btn.type='button';btn.textContent=i+1;
  btn.className=(i===game.active?'active ':'')+(game.solved[i]?'solved':'');
  btn.setAttribute('aria-label',`Câu ${i+1}${game.solved[i]?', đã giải':''}`);btn.setAttribute('aria-pressed',String(i===game.active));
  btn.addEventListener('click',()=>selectQuestion(i,true));nav.append(btn);
 });
}
function clearFeedback(){feedback.textContent='';feedback.className='';$('.answer-wrap').classList.remove('invalid');input.removeAttribute('aria-invalid');}
function renderQuestion(){
 const q=questions[game.active], done=game.solved[game.active];
 $('#question-number').textContent=`HÀNG NGANG ${number(game.active)}`;
 $('#letter-count').textContent=`${q.normalized.length} chữ cái`;
 $('#question-tag').textContent=q.tag;
 $('#question-title').textContent=q.clue;
 input.value=game.drafts[game.active]; input.readOnly=done;
 input.setAttribute('aria-label',`Đáp án cho hàng ngang ${game.active+1}`);
 $('#submit-answer').disabled=done;
 $('#submit-answer').firstChild.textContent=done?'Đã giải đúng ':'Kiểm tra ';
 $('#hint-button').disabled=done;
 $('#hint-button').setAttribute('aria-expanded',String(game.hints[game.active]));
 $('#hint').textContent=q.hint; $('#hint').hidden=!game.hints[game.active];
 const explanation=$('#explanation');explanation.hidden=!done;
 explanation.querySelector('p').textContent=q.explanation;
 const link=explanation.querySelector('a');link.href=q.source;link.setAttribute('aria-label',`Đọc nguồn lịch sử: ${q.sourceName} (mở thẻ mới)`);
 clearFeedback();
 if(done){feedback.textContent=`Chính xác! Đáp án: ${q.answer}.`;feedback.className='correct';}
 $('#next-question').firstChild.textContent=game.solved.every(Boolean)?'Xem thông điệp ':'Câu tiếp theo ';
 updateInputCount();
}
function updateInputCount(){const q=questions[game.active];$('#input-count').textContent=`${normalize(input.value).length}/${q.normalized.length}`;}
function renderProgress(){
 const count=game.solved.filter(Boolean).length;
 $('#progress-text').innerHTML=`Đã giải <strong>${count} / ${questions.length}</strong> hàng ngang`;
 const percent=Math.round(count/questions.length*100);
 $('#progress-percent').textContent=`${percent}%`;
 $('.progress-track').setAttribute('aria-valuenow',String(count));
 $('.progress-track>span').style.width=`${percent}%`;
 const complete=!!unlockedKeyword(game);
 $('#keyword-box').classList.toggle('unlocked',complete);
 $('#keyword-preview').textContent=complete?keywordDisplay:'· · · · · · ·';
 $('#keyword-preview').setAttribute('aria-label',complete?`Từ khóa: ${keywordDisplay}`:'Từ khóa chưa được mở');
 $('#keyword-note').textContent=complete?'Đọc cột xanh từ trên xuống.':`Hoàn thành cả 7 hàng ngang để mở khóa. Còn ${questions.length-count} hàng.`;
 $('#keyword-box .keyword-icon use').setAttribute('href',complete?'#feather':'#lock');
}
function render(){makeBoard();renderQuestion();renderProgress();}
function selectQuestion(index,focus){const changed=game.active!==index;game.active=index;render();if(changed)motion($('.question-content'),[{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:250});if(focus){if(game.solved[index])$('#question-title').focus({preventScroll:true});else input.focus({preventScroll:true});}}
input.addEventListener('input',()=>{game.drafts[game.active]=input.value;clearFeedback();updateInputCount();makeBoard();});
form.addEventListener('submit',event=>{
 event.preventDefault();if(game.solved[game.active])return;
 const answer=input.value;
 if(solve(game,game.active,answer)){
  render();
  celebrateRow(game.active);
  if(unlockedKeyword(game)){
   const completedGame=game;
   clearTimeout(completionTimer);
   completionTimer=setTimeout(()=>{
    if(game===completedGame && unlockedKeyword(game) && !document.querySelector('dialog[open]'))openDialog($('#complete-dialog'));
   },reducedMotion.matches?0:660);
  }else $('#next-question').focus({preventScroll:true});
 }else{
  const len=normalize(answer).length,expected=questions[game.active].normalized.length;
  feedback.textContent=len===0?'Bạn hãy nhập một đáp án trước nhé.':len!==expected?`Hàng này gồm ${expected} chữ cái; bạn đang nhập ${len}. Hãy thử lại hoặc mở gợi ý nhé.`:'Đáp án chưa đúng. Bạn có thể thử lại hoặc mở gợi ý nhé.';
  motion($('.answer-wrap'),[{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(-2px)'},{transform:'translateX(0)'}],{duration:260,easing:'ease-out'});feedback.className='';input.setAttribute('aria-invalid','true');$('.answer-wrap').classList.add('invalid');input.focus({preventScroll:true});
 }
});
$('#hint-button').addEventListener('click',()=>{game.hints[game.active]=!game.hints[game.active];$('#hint').hidden=!game.hints[game.active];$('#hint-button').setAttribute('aria-expanded',String(game.hints[game.active]));if(game.hints[game.active])motion($('#hint'),[{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}]);});
$('#next-question').addEventListener('click',()=>{const next=nextUnsolved(game);if(next===-1)openDialog($('#complete-dialog'));else selectQuestion(next,true);});
$('#reset-button').addEventListener('click',()=>{if(game.solved.some(Boolean)||game.drafts.some(Boolean)||game.hints.some(Boolean))openDialog($('#reset-dialog'));else selectQuestion(0,true);});
$('#confirm-reset').addEventListener('click',()=>{clearTimeout(completionTimer);$('#reset-dialog').close();game=newGame();render();input.focus({preventScroll:true});});
document.querySelectorAll('[data-open]').forEach(btn=>btn.addEventListener('click',()=>openDialog(document.getElementById(btn.dataset.open))));
document.querySelectorAll('.close-dialog').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
const sourceGroups=new Map();questions.forEach((q,i)=>{if(!sourceGroups.has(q.source))sourceGroups.set(q.source,{...q,numbers:[]});sourceGroups.get(q.source).numbers.push(i+1);});
sourceGroups.forEach(s=>{const li=document.createElement('li'),a=document.createElement('a'),note=document.createElement('small');a.href=s.source;a.textContent=`${s.sourceName} ↗`;a.target='_blank';a.rel='noopener noreferrer';note.textContent=`Tham khảo cho câu ${s.numbers.join(', ')}`;li.append(a,note);sourceList.append(li);});
render();

const art = $('.scenery');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let pointerFrame = 0;
window.addEventListener('pointermove',event=>{
 if(reducedMotion.matches || !finePointer.matches || pointerFrame)return;
 const x=(event.clientX/window.innerWidth-.5)*9;
 const y=(event.clientY/window.innerHeight-.5)*5;
 pointerFrame=requestAnimationFrame(()=>{art.style.setProperty('--drift-x',`${x}px`);art.style.setProperty('--drift-y',`${y}px`);pointerFrame=0;});
},{passive:true});
reducedMotion.addEventListener('change',()=>{
 if(reducedMotion.matches){
  document.getAnimations().forEach(animation=>animation.cancel());
  art.style.setProperty('--drift-x','0px');art.style.setProperty('--drift-y','0px');
 }
});

initFeatherEffects(reducedMotion, finePointer);
