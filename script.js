// ===== CONFIGURAÇÕES (edite aqui) =====
const NUMERO_WHATSAPP = "556184321171";              // DDI + DDD + número
const DATA_EVENTO     = new Date(2026, 9, 31, 13, 0); // ano, mês (0=jan), dia, hora, min
const TEMPO_CARROSSEL = 4500;                         // ms entre as fotos

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("abrirBtn").addEventListener("click", abrirConvite);
  document.getElementById("enviarBtn").addEventListener("click", enviarConfirmacao);
  iniciarBrasas();
  iniciarCarrossel();
  iniciarContagem();
  iniciarRevelar();
});

// ===== ABERTURA =====
function abrirConvite(){
  const ab = document.getElementById("abertura");
  ab.classList.add("aberta");
  soltarConfete();
  setTimeout(() => {
    ab.classList.add("fim");
    document.body.classList.remove("travado");
    document.querySelectorAll(".hero .rev").forEach((el, i) =>
      setTimeout(() => el.classList.add("vis"), i * 180));
  }, 1300);
}

// ===== REVELAR AO ROLAR =====
function iniciarRevelar(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting && !e.target.closest(".hero")){
      e.target.classList.add("vis"); io.unobserve(e.target);
    }
  }), {threshold:.15});
  document.querySelectorAll(".rev").forEach(el => io.observe(el));
}

// ===== BRASAS NO FUNDO =====
function iniciarBrasas(){
  const c = document.getElementById("brasas"), ctx = c.getContext("2d");
  let ps = [];
  const ajustar = () => { c.width = innerWidth; c.height = innerHeight; };
  ajustar(); addEventListener("resize", ajustar);
  const nova = (y) => ({x:Math.random()*c.width, y:y ?? c.height+10, r:Math.random()*2.5+.6,
    v:Math.random()*.9+.3, d:Math.random()*Math.PI*2, a:Math.random()*.6+.3});
  for(let i=0;i<70;i++) ps.push(nova(Math.random()*c.height));
  (function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    ps.forEach((p,i) => {
      p.y -= p.v; p.d += .02; p.x += Math.sin(p.d)*.5; p.a -= .0007;
      if(p.y < -10 || p.a <= 0) ps[i] = nova();
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,${120+Math.random()*80|0},40,${p.a})`;
      ctx.shadowColor = "#ff5a1f"; ctx.shadowBlur = 8; ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
}

// ===== CARROSSEL AUTOMÁTICO =====
function iniciarCarrossel(){
  const root = document.getElementById("carrossel");
  const slides = [...root.querySelectorAll(".slide")];
  const box = root.querySelector(".pontos");
  const barra = root.querySelector(".barra i");
  let atual = 0, timer, ini;

  slides.forEach(s => {
    const img = s.querySelector("img");
    img.addEventListener("error", () => { img.style.display="none"; s.classList.add("sem-foto"); });
  });
  const pontos = slides.map((_, i) => {
    const p = document.createElement("button");
    p.type="button"; p.className="ponto"; p.setAttribute("aria-label","Foto "+(i+1));
    p.onclick = () => { ir(i); reiniciar(); };
    box.appendChild(p); return p;
  });

  function ir(n){
    slides[atual].classList.remove("ativo"); pontos[atual].classList.remove("ativo");
    atual = (n + slides.length) % slides.length;
    slides[atual].classList.add("ativo"); pontos[atual].classList.add("ativo");
    ini = performance.now();
  }
  function progresso(){
    barra.style.width = Math.min(100,(performance.now()-ini)/TEMPO_CARROSSEL*100) + "%";
    requestAnimationFrame(progresso);
  }
  function iniciar(){ ini = performance.now(); timer = setInterval(() => ir(atual+1), TEMPO_CARROSSEL); }
  function reiniciar(){ clearInterval(timer); iniciar(); }

  root.querySelector(".seta-esq").onclick = () => { ir(atual-1); reiniciar(); };
  root.querySelector(".seta-dir").onclick = () => { ir(atual+1); reiniciar(); };

  let x0 = null;
  root.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, {passive:true});
  root.addEventListener("touchend", e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 40){ ir(atual + (dx<0 ? 1 : -1)); reiniciar(); }
    x0 = null;
  });

  pontos[0].classList.add("ativo");
  iniciar(); progresso();
}

// ===== CONTAGEM REGRESSIVA =====
function iniciarContagem(){
  const el = id => document.getElementById(id);
  const pad = n => String(n).padStart(2,"0");
  function atualizar(){
    let t = Math.max(0, DATA_EVENTO - new Date());
    if(t === 0){ document.getElementById("contagem").innerHTML = '<div style="padding:14px 22px"><b>É HOJE! 🔥</b></div>'; return; }
    el("cd-dias").textContent = Math.floor(t/864e5); t %= 864e5;
    el("cd-horas").textContent = pad(Math.floor(t/36e5)); t %= 36e5;
    el("cd-min").textContent = pad(Math.floor(t/6e4));
    el("cd-seg").textContent = pad(Math.floor((t%6e4)/1000));
  }
  atualizar(); setInterval(atualizar, 1000);
}

// ===== CONFIRMAÇÃO VIA WHATSAPP =====
// O botão é um link <a target="_blank">: o toque abre o WhatsApp direto,
// sem bloqueio de pop-up no celular. O JS só monta a mensagem antes de abrir.
function enviarConfirmacao(e){
  const nome = document.getElementById("nome").value.trim();
  const filho = document.getElementById("filho").value.trim();
  const qtd = Number(document.getElementById("qtd").value) || 2;

  if(!nome){
    e.preventDefault();
    alert("Digite seu nome!");
    return;
  }

  let msg = `Olá! Meu nome é ${nome}`;
  if(filho) msg += ` e vou com ${filho}`;
  msg += `. Estamos confirmando presença no Churras de Pai e Filho 🔥 (${qtd} pessoa${qtd>1?"s":""})`;

  e.currentTarget.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  soltarConfete(); criarBaloes();
}

function criarBaloes(){
  const box = document.getElementById("baloes-container");
  const em = ["🎈","🔥","🍖","⚽"];
  for(let i=0;i<16;i++){
    const b = document.createElement("div");
    b.className="balao"; b.textContent = em[i%em.length];
    b.style.left = Math.random()*100+"vw";
    b.style.animationDuration = (5+Math.random()*4)+"s";
    box.appendChild(b); setTimeout(() => b.remove(), 9500);
  }
}

// ===== CONFETE =====
function soltarConfete(){
  const c = document.getElementById("confete"), ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cores = ["#ffb703","#ff5a1f","#fff1e0","#e63946","#2ecc71"];
  const ps = Array.from({length:160}, () => ({
    x:Math.random()*c.width, y:-20, w:Math.random()*8+4, h:Math.random()*5+3,
    vy:Math.random()*3+2, vx:Math.random()*2-1, rot:Math.random()*6, vr:Math.random()*.2-.1,
    cor:cores[Math.random()*cores.length|0]
  }));
  let t = 0;
  (function anim(){
    ctx.clearRect(0,0,c.width,c.height);
    ps.forEach(p => {
      p.y+=p.vy; p.x+=p.vx; p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.cor; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    });
    if(++t < 220) requestAnimationFrame(anim); else ctx.clearRect(0,0,c.width,c.height);
  })();
}
