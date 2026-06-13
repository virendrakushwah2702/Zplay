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
  maxTokens: number
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
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: systemPrompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
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

function postProcess(html: string, _gameId: string): string {
  html = repairKnownGeneratedBugs(html)

  // Polyfill roundRect — inject as very first thing in <head> (case-insensitive)
  const polyfill = `<script>if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r=[r,r,r,r];var tl=r[0]||0,tr=(r[1]!==undefined?r[1]:r[0])||0,br=(r[2]!==undefined?r[2]:r[0])||0,bl=(r[3]!==undefined?r[3]:r[0])||0;this.moveTo(x+tl,y);this.lineTo(x+w-tr,y);this.arcTo(x+w,y,x+w,y+tr,tr);this.lineTo(x+w,y+h-br);this.arcTo(x+w,y+h,x+w-br,y+h,br);this.lineTo(x+bl,y+h);this.arcTo(x,y+h,x,y+h-bl,bl);this.lineTo(x,y+tl);this.arcTo(x,y,x+tl,y,tl);this.closePath();return this;};};</script>`
  html = injectAfter(html, '<head>', polyfill)

  // Inject viewport if missing
  if (!/viewport/i.test(html)) {
    html = injectAfter(html, '<head>', '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">')
  }

  // Black-screen watchdog: canvas still dark after 2.5s → show retry overlay
  const watchdog = `<script>;(function(){setTimeout(function(){try{var c=document.querySelector('canvas');if(!c)return;var x=c.getContext('2d');var w=c.width||390,h=c.height||580;var d=x.getImageData(w/2-60,h/2-60,120,120);var bright=0;for(var i=0;i<d.data.length;i+=4){if(d.data[i]>45||d.data[i+1]>45||d.data[i+2]>45)bright++;}if(bright<15){if(document.getElementById('_zw'))return;var div=document.createElement('div');div.id='_zw';div.style.cssText='position:fixed;inset:0;background:#0a0a1e;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px';div.innerHTML='<div style=\\'font-size:56px\\'>\\u{1F605}</div><h2 style=\\'color:white;margin:16px 0 8px\\'>Oops! Something glitched</h2><p style=\\'color:#94a3b8;margin-bottom:24px;font-size:14px\\'>Tap the button to try again</p><button onclick=\\'location.reload()\\' style=\\'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;padding:14px 36px;border-radius:28px;font-size:16px;font-weight:bold;cursor:pointer\\'>Retry \u26a1</button>';document.body.appendChild(div);}}catch(e){}},2500);})();</script>`

  // Zplay watermark
  const watermark = `<div style="position:fixed;top:8px;right:10px;font-size:10px;color:rgba(255,255,255,0.4);font-family:sans-serif;z-index:9999;letter-spacing:2px;pointer-events:none">ZPLAY</div>`

  // Bottom bar
  const bottomBar = `<div id="zplay-bar" style="position:fixed;bottom:0;left:0;right:0;height:44px;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-around;z-index:9998;border-top:1px solid rgba(99,102,241,0.4)"><button onclick="zplayShare(window._zplayScore||0)" style="background:rgba(99,102,241,0.8);border:none;color:white;padding:6px 14px;border-radius:16px;font-size:12px;cursor:pointer">Share 🔗</button><button onclick="zplayLike()" style="background:transparent;border:none;color:white;font-size:18px;cursor:pointer">❤️</button><button onclick="zplayRemix()" style="background:rgba(249,115,22,0.8);border:none;color:white;padding:6px 14px;border-radius:16px;font-size:12px;cursor:pointer">Remix 🎨</button></div>`

  // Inject before </body>; fall back to before </html> if no </body>
  if (/<\/body>/i.test(html)) {
    html = injectBefore(html, '</body>', watchdog + watermark + bottomBar)
  } else {
    html = injectBefore(html, '</html>', watchdog + watermark + bottomBar)
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

    // Generate game with retry logic
    let html = ''
    let attempts = 0

    while (attempts < 3) {
      attempts++
      try {
        const raw = await callDeepSeek(prompt, country, language, maxTokens)
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
        ai_model_used: 'deepseek-chat'
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
      }
    } catch {}

    // Increment generation counter
    if (userId) {
      await supabase.rpc('increment_generations', { user_id: userId })
    }

    return NextResponse.json({
      success: true,
      gameId: game.id,
      html: html,
      model: 'deepseek-chat'
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
