import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MASTER_GAME_PROMPT } from '@/lib/gamePrompt'
import { generateSlug, pingGoogle } from '@/lib/seo'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const TOKEN_LIMITS: Record<string, number> = {
  free: 8000,
  creator: 10000,
  pro: 12000,
  studio: 16000,
  premium: 20000,
}

async function callDeepSeek(
  prompt: string,
  country: string,
  language: string,
  maxTokens: number,
  model: string = 'deepseek-chat'
): Promise<string> {
  const systemPrompt = MASTER_GAME_PROMPT
    .replace('{{PROMPT}}', prompt)
    .replace('{{COUNTRY}}', country)
    .replace('{{LANGUAGE}}', language)

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: systemPrompt }],
      max_tokens: maxTokens,
      temperature: model === 'deepseek-reasoner' ? undefined : 0.7,
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

function validateGame(html: string): boolean {
  const trimmed = html.trim()
  const checks = [
    trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html'),
    trimmed.includes('<canvas') || trimmed.includes('<div'),
    trimmed.includes('<script'),
    trimmed.length > 3000,
    trimmed.length < 250000,
    !trimmed.includes('src="http'),
    trimmed.endsWith('</html>') || trimmed.endsWith('</html> ') || trimmed.endsWith('</html>\n'),
  ]
  const passed = checks.filter(Boolean).length
  return passed >= 6
}

function getFallbackGame(_prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Zplay Game</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#0a0a1e; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; font-family:sans-serif; touch-action:none; }
canvas { border-radius:16px; box-shadow:0 0 40px rgba(99,102,241,0.4); }
</style>
</head>
<body>
<canvas id="c" width="390" height="580"></canvas>
<script>
try {
const c=document.getElementById('c'),ctx=c.getContext('2d');
let state='title',score=0,best=0,speed=3,frame=0;
let playerY=290,targetY=290,objects=[];
window.onerror=function(){state='error';draw();return true;};
function rand(a,b){return a+Math.random()*(b-a);}
function drawBg(){
  const g=ctx.createLinearGradient(0,0,0,580);
  g.addColorStop(0,'#0a0a1e');g.addColorStop(1,'#1a1a3e');
  ctx.fillStyle=g;ctx.fillRect(0,0,390,580);
}
function drawPlayer(){
  ctx.shadowColor='#6366f1';ctx.shadowBlur=20;
  ctx.fillStyle='#6366f1';
  ctx.beginPath();ctx.arc(80,playerY,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='white';ctx.font='bold 14px sans-serif';
  ctx.textAlign='center';ctx.fillText('YOU',80,playerY+5);
  ctx.shadowBlur=0;ctx.textAlign='left';
}
function rr(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}
function spawn(){
  const colors=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#a855f7'];
  objects.push({x:390,y:rand(30,550),r:rand(12,22),color:colors[Math.floor(rand(0,6))]});
}
function update(){
  frame++;
  playerY+=(targetY-playerY)*0.15;
  playerY=Math.max(22,Math.min(558,playerY));
  if(frame%Math.max(25,60-Math.floor(score/10))===0)spawn();
  if(frame%200===0)speed+=0.3;
  objects=objects.filter(o=>{
    o.x-=speed;
    if(Math.hypot(o.x-80,o.y-playerY)<o.r+20){state='over';if(score>best)best=score;window.zplayGameOver&&window.zplayGameOver(score);}
    return o.x>-30;
  });
  if(frame%15===0){score++;window.zplayScore&&window.zplayScore(score);}
}
function drawGame(){
  drawBg();
  ctx.strokeStyle='rgba(99,102,241,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,playerY);ctx.lineTo(390,playerY);ctx.stroke();
  objects.forEach(o=>{
    ctx.shadowColor=o.color;ctx.shadowBlur=12;
    ctx.fillStyle=o.color;
    ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  });
  drawPlayer();
  ctx.fillStyle='rgba(0,0,0,0.5)';rr(8,8,130,44,10);ctx.fill();
  ctx.fillStyle='#a5b4fc';ctx.font='11px sans-serif';ctx.fillText('SCORE',16,26);
  ctx.fillStyle='white';ctx.font='bold 20px sans-serif';ctx.fillText(score,16,46);
  ctx.fillStyle='rgba(0,0,0,0.5)';rr(252,8,130,44,10);ctx.fill();
  ctx.fillStyle='#fbbf24';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('BEST',382,26);
  ctx.fillStyle='white';ctx.font='bold 20px sans-serif';ctx.fillText(best,382,46);
  ctx.textAlign='left';
}
function drawTitle(){
  drawBg();ctx.textAlign='center';
  ctx.shadowColor='#6366f1';ctx.shadowBlur=30;
  ctx.fillStyle='white';ctx.font='bold 42px sans-serif';ctx.fillText('DODGE',195,200);
  ctx.fillStyle='#818cf8';ctx.font='bold 42px sans-serif';ctx.fillText('RUSH',195,250);
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='14px sans-serif';
  ctx.fillText('Move to dodge obstacles',195,295);
  ctx.fillText('Touch/mouse to control',195,318);
  const g2=ctx.createLinearGradient(120,340,270,340);
  g2.addColorStop(0,'#6366f1');g2.addColorStop(1,'#8b5cf6');
  ctx.fillStyle=g2;ctx.shadowColor='#6366f1';ctx.shadowBlur=15;
  rr(120,340,150,48,24);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='white';ctx.font='bold 16px sans-serif';ctx.fillText('TAP TO START \u26a1',195,370);
  ctx.textAlign='left';
}
function drawOver(){
  drawBg();ctx.textAlign='center';
  ctx.shadowColor='#ef4444';ctx.shadowBlur=20;
  ctx.fillStyle='white';ctx.font='bold 36px sans-serif';ctx.fillText('GAME OVER',195,180);
  ctx.shadowBlur=0;
  ctx.fillStyle='#a5b4fc';ctx.font='14px sans-serif';ctx.fillText('YOUR SCORE',195,230);
  ctx.fillStyle='white';ctx.font='bold 56px sans-serif';ctx.fillText(score,195,295);
  if(score>0&&score>=best){
    ctx.fillStyle='#fbbf24';ctx.shadowColor='#fbbf24';ctx.shadowBlur=10;
    ctx.font='bold 16px sans-serif';ctx.fillText('\ud83c\udfc6 NEW BEST!',195,330);ctx.shadowBlur=0;
  }
  const g2=ctx.createLinearGradient(120,360,270,360);
  g2.addColorStop(0,'#6366f1');g2.addColorStop(1,'#8b5cf6');
  ctx.fillStyle=g2;ctx.shadowColor='#6366f1';ctx.shadowBlur=15;
  rr(120,360,150,48,24);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='white';ctx.font='bold 15px sans-serif';ctx.fillText('PLAY AGAIN \ud83d\ude97',195,390);
  ctx.textAlign='left';
}
function drawError(){
  drawBg();ctx.textAlign='center';
  ctx.fillStyle='white';ctx.font='48px sans-serif';ctx.fillText('\ud83d\ude05',195,220);
  ctx.fillStyle='#6366f1';ctx.font='bold 22px sans-serif';ctx.fillText('Oops! Tap to retry',195,280);
  rr(120,320,150,48,24);ctx.fillStyle='#6366f1';ctx.fill();
  ctx.fillStyle='white';ctx.font='bold 15px sans-serif';ctx.fillText('Retry \u26a1',195,350);
  ctx.textAlign='left';
}
function draw(){
  if(state==='title')drawTitle();
  else if(state==='playing')drawGame();
  else if(state==='over')drawOver();
  else drawError();
}
function reset(){score=0;speed=3;frame=0;objects=[];playerY=290;targetY=290;state='playing';}
c.addEventListener('mousemove',e=>{if(state!=='playing')return;const r=c.getBoundingClientRect();targetY=e.clientY-r.top;});
c.addEventListener('touchmove',e=>{e.preventDefault();if(state!=='playing')return;const r=c.getBoundingClientRect();targetY=e.touches[0].clientY-r.top;},{passive:false});
c.addEventListener('click',()=>{if(state==='title'||state==='over'||state==='error')reset();});
c.addEventListener('touchend',e=>{e.preventDefault();if(state==='title'||state==='over'||state==='error')reset();},{passive:false});
function loop(){draw();if(state==='playing')update();requestAnimationFrame(loop);}
loop();
} catch(e) {
  document.body.innerHTML='<div style="background:#0a0a1e;color:white;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px"><div style="font-size:48px">\ud83d\ude05</div><h2 style="color:#6366f1;margin:16px 0">Oops! Tap to retry</h2><button onclick="location.reload()" style="background:#6366f1;color:white;border:none;padding:12px 32px;border-radius:24px;font-size:16px;cursor:pointer">Retry \u26a1</button></div>';
}
</script>
</body>
</html>`
}

function injectBefore(html: string, tag: string, content: string): string {
  const re = new RegExp(tag.replace(/[<>/]/g, c => `\\${c}`), 'i')
  if (re.test(html)) return html.replace(re, content + tag)
  return html + content
}

function injectAfter(html: string, tag: string, content: string): string {
  const re = new RegExp(tag.replace(/[<>/]/g, c => `\\${c}`), 'i')
  if (re.test(html)) return html.replace(re, tag + content)
  return html + content
}

function repairKnownGeneratedBugs(html: string): string {
  // Match-3 cascades sometimes clear swapAnim before using it as a score anchor.
  html = html.replace(
    "var cx = gridX + swapAnim.c1*cellSize + cellSize/2;\n  var cy = gridY + swapAnim.r1*cellSize + cellSize/2;",
    "var _anchor = swapAnim || {r1:Math.floor(rows/2),c1:Math.floor(cols/2)};\n  var cx = gridX + _anchor.c1*cellSize + cellSize/2;\n  var cy = gridY + _anchor.r1*cellSize + cellSize/2;"
  )

  html = html.replace(
    "var cx = gridX + swapAnim.c1 * cellSize + cellSize/2;\n  var cy = gridY + swapAnim.r1 * cellSize + cellSize/2;",
    "var _anchor = swapAnim || {r1:Math.floor(rows/2),c1:Math.floor(cols/2)};\n  var cx = gridX + _anchor.c1 * cellSize + cellSize/2;\n  var cy = gridY + _anchor.r1 * cellSize + cellSize/2;"
  )

  html = html.replace(
    "if(tx>=95 && tx<=295 && ty>=380 && ty<=430)",
    "if(tx>=95 && tx<=295 && ty>=340 && ty<=430)"
  )

  // Make common match-3 removals visible before candies drop into place.
  html = html.replace(
    "        drawCandy(x,y,type,cellSize);\n      }",
    "        drawCandy(x,y,type,cellSize);\n        if(matched&&matched.length){for(var mi=0;mi<matched.length;mi++){for(var mj=0;mj<matched[mi].length;mj++){if(matched[mi][mj][0]===r&&matched[mi][mj][1]===c){ctx.save();ctx.strokeStyle='#fff7ad';ctx.lineWidth=4;ctx.shadowColor='#fbbf24';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(x,y,cellSize*0.42,0,Math.PI*2);ctx.stroke();ctx.restore();}}}}\n      }"
  )

  html = html.replace(
    "var removed = removeMatches(matches);\n  var bonus = removed.length * 10;",
    "matched = matches;\n  var removed = [];\n  for(var _mi=0;_mi<matches.length;_mi++){for(var _mj=0;_mj<matches[_mi].length;_mj++){removed.push({r:matches[_mi][_mj][0],c:matches[_mi][_mj][1]});}}\n  var bonus = removed.length * 10;"
  )

  html = html.replace(
    "setTimeout(function(){\n    dropCandies();",
    "setTimeout(function(){\n    removeMatches(matches);\n    matched=[];\n    dropCandies();"
  )

  return html
}

const GLOBAL_BOILERPLATE = `
<script>
// Polyfill roundRect
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    if(typeof r==='number')r=[r,r,r,r];
    var tl=r[0]||0,tr=(r[1]!==undefined?r[1]:r[0])||0,br=(r[2]!==undefined?r[2]:r[0])||0,bl=(r[3]!==undefined?r[3]:r[0])||0;
    this.moveTo(x+tl,y);this.lineTo(x+w-tr,y);this.arcTo(x+w,y,x+w,y+tr,tr);
    this.lineTo(x+w,y+h-br);this.arcTo(x+w,y+h,x+w-br,y+h,br);
    this.lineTo(x+bl,y+h);this.arcTo(x,y+h,x,y+h-bl,bl);
    this.lineTo(x,y+tl);this.arcTo(x,y,x+tl,y,tl);
    this.closePath();return this;
  };
}

// Zplay global variables (pre-defined for AI usage)
var scoreFloat = 0;
var score = 0;
var best = 0;
var combo = 0;
var scoreFlash = 0;
var speed = 3;
var paused = false;
var pauseStart = 0;
var pauseAdSent = false;
var frame = 0;
var state = 'title';

// Error Boundary recovery
window.onerror = function(msg, src, line, col, err) {
  document.body.innerHTML = '<div style="background:#0a0a1e;color:white;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px"><div style="font-size:56px">😅</div><h2 style="color:#6366f1;margin:16px 0 8px">Oops! Something glitched</h2><p style="color:#94a3b8;margin-bottom:24px;font-size:14px">Tap the button to try again</p><button onclick="location.reload()" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:14px 36px;border-radius:28px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 20px rgba(99,102,241,0.4)">Retry ⚡</button></div>';
  return true;
};

// Zplay event listeners & messaging
window.zplayShare = function(score) {
  window.parent.postMessage({type:'share',score:score},'*');
};
window.zplayScore = function(s) {
  window._zplayScore = s;
  window.parent.postMessage({type:'score',score:s},'*');
};
window.zplayGameOver = function(s) {
  window.parent.postMessage({type:'gameover',score:s},'*');
};
window.zplayLike = function() { window.parent.postMessage({type:'like'},'*'); };
window.zplayRemix = function() { window.parent.postMessage({type:'remix'},'*'); };

function requestReplay() {
  window.parent.postMessage({type:'requestReplay'}, '*');
}

window.addEventListener('message', function(evt) {
  if (!evt.data || typeof evt.data !== 'object') return;
  if (evt.data.type === 'doReplay') { resetGame(); }
  if (evt.data.type === 'doResume') {
    paused = false; pauseAdSent = false;
    _startBg();
  }
});

function resetGame() {
  scoreFloat = 0; score = 0; combo = 0; scoreFlash = 0;
  speed = 3; frame = 0; paused = false; state = 'playing';
  if (typeof window.initGame === 'function') window.initGame();
  else if (typeof window.restartGame === 'function') window.restartGame();
  else if (typeof window.reset === 'function') window.reset();
  else location.reload();
}

function endGame() {
  paused = false; _stopBg();
  if(score > best) best = score;
  state = 'over';
  window.zplayGameOver && window.zplayGameOver(score);
  window.parent.postMessage({type:'earlyEnd',score:score},'*');
}

function addBonus(pts) {
  scoreFloat += pts; score = Math.floor(scoreFloat);
  scoreFlash = 10; combo++;
}

function updateScore() {
  scoreFloat += speed * 0.12;
  var ns = Math.floor(scoreFloat);
  if (ns > score) { score = ns; scoreFlash = 6; }
  if (frame % 300 === 0 && frame > 0) speed = Math.min(speed + 0.5, 10);
  window.zplayScore && window.zplayScore(score);
}

function updateScoreBoard() {
  scoreFloat += 0.36 + frame * 0.00008;
  var ns = Math.floor(scoreFloat);
  if (ns > score) { score = ns; scoreFlash = 6; }
  window.zplayScore && window.zplayScore(score);
}


// Audio Engine setup
var _AC=null,_MG=null,_BG=null,_vol=0.7,_muted=false,_bgType='sine',_bgFreq=80;
function _iA(){
  if(_AC)return;
  _AC=new(window.AudioContext||window.webkitAudioContext)();
  _MG=_AC.createGain();_MG.gain.value=_vol;_MG.connect(_AC.destination);
}
function _tone(f,t,dur,v){
  if(!_AC||_muted)return;
  var o=_AC.createOscillator(),g=_AC.createGain();
  o.connect(g);g.connect(_MG);o.type=t||'sine';o.frequency.value=f;
  g.gain.setValueAtTime(v||0.3,_AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,_AC.currentTime+dur);
  o.start();o.stop(_AC.currentTime+dur);
}
function _noise(dur,v){
  if(!_AC||_muted)return;
  var b=_AC.createBuffer(1,_AC.sampleRate*dur,_AC.sampleRate);
  var d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  var s=_AC.createBufferSource(),g=_AC.createGain();
  s.buffer=b;s.connect(g);g.connect(_MG);
  g.gain.setValueAtTime(v||0.15,_AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,_AC.currentTime+dur);
  s.start();
}
function _startBg(){
  if(!_AC||_muted||_BG)return;
  _BG=_AC.createOscillator();var g=_AC.createGain();
  _BG.connect(g);g.connect(_MG);
  _BG.type=_bgType||'sawtooth';_BG.frequency.value=_bgFreq||80;
  g.gain.value=0.05;_BG.start();
}
function _stopBg(){if(_BG){try{_BG.stop();}catch(e){}}_BG=null;}
function _sndVol(v){_vol=Math.max(0,Math.min(1,v));if(_MG)_MG.gain.value=_muted?0:_vol;}
function _sndMute(){_muted=!_muted;if(_MG)_MG.gain.value=_muted?0:_vol;}

// UI Drawing helpers (using canvas 2D fallback context lookup)
function getGameCtx() {
  return window.ctx || (typeof ctx !== 'undefined' ? ctx : null) || (document.querySelector('canvas') ? document.querySelector('canvas').getContext('2d') : null);
}

function drawPauseBtn() {
  var c = getGameCtx();
  if (!c) return;
  c.save();
  c.fillStyle='rgba(0,0,0,0.55)';
  c.beginPath();c.roundRect(8,540,50,32,8);c.fill();
  c.fillStyle='white';c.font='bold 14px sans-serif';c.textAlign='center';
  c.fillText(paused?'▶':'⏸',33,561);
  c.restore();
}

function drawPauseOverlay() {
  var c = getGameCtx();
  if (!c) return;
  c.save();
  c.fillStyle='rgba(5,5,20,0.93)';c.fillRect(0,0,390,580);
  c.textAlign='center';
  c.fillStyle='white';c.font='bold 30px sans-serif';c.fillText('PAUSED',195,180);
  c.fillStyle='rgba(255,255,255,0.4)';c.font='13px sans-serif';
  c.fillText('Score: '+score,195,210);
  c.fillStyle='rgba(99,102,241,0.9)';
  c.beginPath();c.roundRect(95,250,200,52,26);c.fill();
  c.fillStyle='white';c.font='bold 17px sans-serif';c.fillText('▶  Resume',195,282);
  c.fillStyle='rgba(239,68,68,0.75)';
  c.beginPath();c.roundRect(95,318,200,48,24);c.fill();
  c.fillStyle='white';c.font='bold 15px sans-serif';c.fillText('End Game',195,347);
  c.restore();
}

function drawVolControl() {
  var c = getGameCtx();
  if (!c) return;
  c.save();
  c.fillStyle='rgba(0,0,0,0.5)';
  c.beginPath();c.roundRect(340,540,42,32,8);c.fill();
  c.fillStyle='white';c.font='17px sans-serif';c.textAlign='center';
  c.fillText(_muted?'🔇':_vol>0.4?'🔊':'🔉',361,561);
  c.restore();
}

function drawScoreDisplay() {
  var c = getGameCtx();
  if (!c) return;
  if (scoreFlash > 0) scoreFlash--;
  c.save();
  c.fillStyle = 'rgba(0,0,0,0.55)';
  c.beginPath(); c.roundRect(8,8,140,48,10); c.fill();
  c.fillStyle = '#a5b4fc'; c.font = '11px sans-serif';
  c.textAlign = 'left'; c.fillText('SCORE', 18, 26);
  c.fillStyle = scoreFlash > 0 ? '#fbbf24' : 'white';
  c.font = 'bold ' + (scoreFlash > 0 ? '28' : '22') + 'px sans-serif';
  c.fillText(score, 18, 48);
  c.fillStyle = 'rgba(0,0,0,0.55)';
  c.beginPath(); c.roundRect(242,8,140,48,10); c.fill();
  c.fillStyle = '#fbbf24'; c.font = '11px sans-serif';
  c.textAlign = 'right'; c.fillText('BEST', 372, 26);
  c.fillStyle = 'white'; c.font = 'bold 22px sans-serif';
  c.fillText(best, 372, 48); c.restore();
  
  if (combo >= 3) {
    var cc = combo >= 10 ? '#ef4444' : combo >= 6 ? '#a855f7' : '#f97316';
    var ct = combo >= 10 ? 'ON FIRE! x5 !' : combo >= 6 ? 'COMBO x3' : 'COMBO x2';
    c.save(); c.fillStyle = cc; c.shadowColor = cc; c.shadowBlur = 12;
    c.font = 'bold 14px sans-serif'; c.textAlign = 'center';
    c.fillText(ct, 195, 85); c.restore();
  }
}

// 45-second pause monitor
setInterval(function() {
  if (paused && !pauseAdSent && (Date.now() - pauseStart) > 45000) {
    pauseAdSent = true;
    window.parent.postMessage({type:'pauseAdRequired'},'*');
  }
}, 1000);

// Global Tap Interceptor (Capture phase)
function checkHUDClicks(clientX, clientY) {
  var canvas = document.querySelector('canvas');
  if (!canvas) return false;
  var rect = canvas.getBoundingClientRect();
  var tx = (clientX - rect.left) * (390 / rect.width);
  var ty = (clientY - rect.top) * (580 / rect.height);

  // Pause button (8,540,50,32)
  if (tx >= 8 && tx <= 58 && ty >= 540 && ty <= 572) {
    _iA();
    if (!paused) { 
      paused = true; 
      pauseStart = Date.now(); 
      pauseAdSent = false; 
      _stopBg(); 
    } else { 
      paused = false; 
      _startBg(); 
    }
    return true;
  }
  
  // Volume control (340,540,42,32)
  if (tx >= 340 && tx <= 382 && ty >= 540 && ty <= 572) {
    _iA();
    _sndMute();
    return true;
  }
  
  // Resume/End Game overlay buttons
  if (paused) {
    // Resume zone (95,250,200,52)
    if (tx >= 95 && tx <= 295 && ty >= 250 && ty <= 302) {
      paused = false;
      _startBg();
      return true;
    }
    // End Game zone (95,318,200,48)
    if (tx >= 95 && tx <= 295 && ty >= 318 && ty <= 366) {
      endGame();
      return true;
    }
    return true; // Lock input if paused
  }
  return false;
}

window.addEventListener('mousedown', function(e) {
  _iA();
  if (checkHUDClicks(e.clientX, e.clientY)) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);

window.addEventListener('touchstart', function(e) {
  _iA();
  if (e.touches.length > 0) {
    if (checkHUDClicks(e.touches[0].clientX, e.touches[0].clientY)) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
}, true);
</script>
`;

function postProcess(html: string, _gameId: string): string {
  html = repairKnownGeneratedBugs(html)

  // Replace Date.now() % 9999 with a static seed to make the theme and colors permanent for this game!
  const staticSeed = Math.floor(Math.random() * 9999)
  html = html.replace(/Date\.now\(\)\s*%\s*9999/g, String(staticSeed))

  // Inject global boilerplate inside <head> (which includes polyfill, error recovery, audio, pause systems, etc)
  html = injectAfter(html, '<head>', GLOBAL_BOILERPLATE)

  // Inject viewport if missing
  if (!/viewport/i.test(html)) {
    html = injectAfter(html, '<head>', '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">')
  }

  // Zplay watermark
  const watermark = `<div style="position:fixed;top:8px;right:10px;font-size:10px;color:rgba(255,255,255,0.4);font-family:sans-serif;z-index:9999;letter-spacing:2px;pointer-events:none">ZPLAY</div>`

  // Bottom bar
  const bottomBar = `<div id="zplay-bar" style="position:fixed;bottom:0;left:0;right:0;height:44px;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-around;z-index:9998;border-top:1px solid rgba(99,102,241,0.4)"><button onclick="zplayShare(window._zplayScore||0)" style="background:rgba(99,102,241,0.8);border:none;color:white;padding:6px 14px;border-radius:16px;font-size:12px;cursor:pointer">Share 🔗</button><button onclick="zplayLike()" style="background:transparent;border:none;color:white;font-size:18px;cursor:pointer">❤️</button><button onclick="zplayRemix()" style="background:rgba(249,115,22,0.8);border:none;color:white;padding:6px 14px;border-radius:16px;font-size:12px;cursor:pointer">Remix 🎨</button></div>`

  // Inject before </body>; fall back to before </html> if no </body>
  if (/<\/body>/i.test(html)) {
    html = injectBefore(html, '</body>', watermark + bottomBar)
  } else {
    html = injectBefore(html, '</html>', watermark + bottomBar)
  }

  return html
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId, country = 'US', language = 'en' } = await request.json()

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Prompt too short' }, { status: 400 })
    }

    const supabase = await createClient()

    let userTier = 'free'

    // Check user generation limit
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('free_generations_today, last_generation_reset, subscription_tier')
        .eq('id', userId)
        .single()

      if (user) {
        userTier = user.subscription_tier || 'free'

        const today = new Date().toISOString().split('T')[0]
        const lastReset = user.last_generation_reset

        // Reset counter if new day
        if (lastReset !== today) {
          await supabase
            .from('users')
            .update({ free_generations_today: 0, last_generation_reset: today })
            .eq('id', userId)
          user.free_generations_today = 0
        }

        // Check limit for free users
        if (user.subscription_tier === 'free' && user.free_generations_today >= 3) {
          return NextResponse.json({ error: 'Daily limit reached', code: 'LIMIT_REACHED' }, { status: 429 })
        }
      }
    }

    const maxTokens = TOKEN_LIMITS[userTier] ?? TOKEN_LIMITS.free
    const model = (userTier === 'studio' || userTier === 'premium') ? 'deepseek-reasoner' : 'deepseek-chat'

    // Generate game with retry logic
    let html = ''
    let attempts = 0

    while (attempts < 3) {
      attempts++
      try {
        const raw = await callDeepSeek(prompt, country, language, maxTokens, model)
        console.log(`[generate] attempt ${attempts} raw length=${raw.length} starts="${raw.slice(0,80).replace(/\n/g,' ')}"`)
        if (validateGame(raw)) {
          html = postProcess(raw, 'temp')
          console.log(`[generate] validated ok, final html length=${html.length}`)
          break
        } else {
          console.log(`[generate] attempt ${attempts} validation FAILED`)
        }
      } catch (err) {
        console.error(`[generate] attempt ${attempts} error:`, err)
        if (attempts === 3) throw err
      }
    }

    // Use fallback game if all retries failed or html is still empty
    if (!html) {
      console.log('[generate] all attempts failed, using fallback game')
      html = postProcess(getFallbackGame(prompt), 'temp')
    }

    // Save game to database
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        creator_id: userId || null,
        title: prompt.slice(0, 60),
        prompt: prompt,
        html_content: html,
        status: 'draft',
        country_origin: country,
        language: language,
        ai_model_used: model
      })
      .select()
      .single()

    if (gameError) throw gameError

    // Generate and persist SEO slug
    const slug = generateSlug(prompt, game.id)
    await supabase.from('games').update({ slug }).eq('id', game.id)
    pingGoogle(slug).catch(() => {})

    // Award Sparks for game generation if user is authenticated
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { awardSparks } = await import('@/lib/sparks')
        await awardSparks(authUser.id, 'GAME_GENERATED', game.id, 'Game created!')
        
        // Referral first game bonus check
        const { data: referral } = await supabase
          .from('referrals')
          .select('id, referrer_id')
          .eq('referred_id', authUser.id)
          .eq('status', 'signup')
          .maybeSingle()

        if (referral) {
          await awardSparks(
            referral.referrer_id,
            'REFERRAL_FIRST_GAME',
            game.id,
            'Your referral generated their first game!'
          )
          await supabase
            .from('referrals')
            .update({ status: 'first_game', sparks_awarded: 150 })
            .eq('id', referral.id)
        }
      }
    } catch {}

    // Increment generation counter
    if (userId) {
      await supabase.rpc('increment_generations', { user_id: userId })
    }

    return NextResponse.json({
      success: true,
      gameId: game.id,
      slug: slug,
      html: html,
      model: 'deepseek-chat'
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
