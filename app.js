/* ============================================================
   ORÁCULO — geometría / señal
   Un oráculo visual: la intención escrita se convierte en la
   semilla determinista de un mandala de geometría sagrada.

   Dos citas a Peter Saville:
   · las ondas apiladas de "Unknown Pleasures" laten al fondo,
   · el alfabeto cromático de "Power, Corruption & Lies"
     codifica la intención, letra a letra, en el anillo exterior.
   ============================================================ */

'use strict';

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const forma = document.getElementById('forma');
const campo = document.getElementById('intencion');
const respuestaEl = document.getElementById('respuesta');
const btnSonido = document.getElementById('btn-sonido');
const btnGuardar = document.getElementById('btn-guardar');

const MOV_REDUCIDO =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   Azar determinista: xmur3 (hash de texto) + mulberry32 (PRNG).
   La misma intención produce siempre el mismo mandala.
   ------------------------------------------------------------ */

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function elegir(rng, lista) {
  return lista[Math.floor(rng() * lista.length)];
}

/* ------------------------------------------------------------
   Alfabeto cromático (homenaje a la rueda de color de
   "Power, Corruption & Lies"): cada letra A–Z es un matiz.
   ------------------------------------------------------------ */

function matizDeLetra(ch) {
  const i = ch.toUpperCase().charCodeAt(0) - 65;
  if (i < 0 || i > 25) return null;
  return (i / 26) * 360;
}

function coloresDeTexto(texto) {
  const matices = [];
  for (const ch of texto) {
    const h = matizDeLetra(ch);
    if (h !== null) matices.push(h);
  }
  return matices;
}

/* ------------------------------------------------------------
   Yantras: si la intención invoca una deidad, la geometría
   responde con su yantra (interpretación libre y respetuosa:
   triángulos entrelazados, pétalos de loto, bhupura, bindu).
   ------------------------------------------------------------ */

const YANTRAS = {
  //          triángulos ↑ / ↓   pétalos   matiz de acento
  ganesha: { arriba: 1, abajo: 1, petalos: 8,  matiz: 22 },   // rojo teja
  shiva:   { arriba: 5, abajo: 0, petalos: 16, matiz: 208 },  // ceniza azul
  vishnu:  { arriba: 2, abajo: 2, petalos: 12, matiz: 46 },   // oro
  brahma:  { arriba: 1, abajo: 1, petalos: 12, matiz: 355 },  // azafrán rojo
  shakti:  { arriba: 4, abajo: 5, petalos: 16, matiz: 328 },  // sri yantra
};

const ALIAS_YANTRA = [
  [/ganesh/, 'ganesha'],
  [/shiva|siva|mahadev/, 'shiva'],
  [/vishnu|visnu|narayan/, 'vishnu'],
  [/brahma/, 'brahma'],
  [/shakti|sri\s?yantra|devi|durga|kali|lakshmi|laksmi/, 'shakti'],
];

function detectarYantra(texto) {
  const llano = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [re, clave] of ALIAS_YANTRA) {
    if (re.test(llano)) return { clave, ...YANTRAS[clave] };
  }
  return null;
}

/* ------------------------------------------------------------
   La especificación del mandala: todo lo que el azar decide
   una sola vez por consulta.
   ------------------------------------------------------------ */

let espec = null;
let nacimiento = 0; // instante en que nació el mandala actual

function crearEspec(texto) {
  const semilla = xmur3(texto.trim().toLowerCase() || 'silencio');
  const rng = mulberry32(semilla());

  const simetria = elegir(rng, [6, 8, 10, 12]);
  const matices = coloresDeTexto(texto);
  const deidad = detectarYantra(texto);

  // Linaje geométrico: occidente (flor/Metatrón/espirales),
  // yantra (triángulos/loto/bhupura) o mixto. Invocar una deidad
  // fuerza su yantra.
  let linaje;
  if (deidad) {
    linaje = 'yantra';
  } else {
    const u = rng();
    linaje = u < 0.4 ? 'occidente' : u < 0.72 ? 'yantra' : 'mixto';
  }

  const cromatico = deidad ? true : matices.length > 0 && rng() < 0.6;

  // Acentos: el matiz ritual de la deidad, o matices tomados
  // de las propias letras de la intención.
  const acentos = [];
  if (deidad) {
    acentos.push(deidad.matiz, (deidad.matiz + 18) % 360);
  } else if (cromatico) {
    const n = Math.min(matices.length, 2 + Math.floor(rng() * 2));
    for (let i = 0; i < n; i++) {
      acentos.push(matices[Math.floor(rng() * matices.length)]);
    }
  }

  return {
    texto,
    rng,
    simetria,
    matices,
    cromatico,
    acentos,
    linaje,
    deidad,
    triArriba: deidad ? deidad.arriba : 1 + Math.floor(rng() * 3),
    triAbajo: deidad ? deidad.abajo : Math.floor(rng() * 3),
    petalos: deidad ? deidad.petalos : elegir(rng, [8, 12, 16]),
    anillosFlor: 2 + Math.floor(rng() * 2),        // flor de la vida: 2–3 anillos
    conMetatron: rng() < 0.55,                      // cubo de Metatrón
    conEspirales: rng() < 0.7,                      // espirales áureas
    espiralesInvertidas: rng() < 0.5,
    poligonos: 1 + Math.floor(rng() * 3),           // anillos poligonales
    ladosPoligono: elegir(rng, [3, 4, 5, 6]),
    anillosPuntos: 1 + Math.floor(rng() * 2),
    girBase: (rng() * 0.5 + 0.2) * (rng() < 0.5 ? 1 : -1), // rad / min aprox
    fase: rng() * TAU,
    respuesta: generarRespuesta(rng),
    raizHz: 96 + rng() * 96,                        // raíz del dron sonoro
    modoEscala: deidad ? 2 : elegir(rng, [0, 1, 2]), // deidad → hirajoshi
  };
}

/* ------------------------------------------------------------
   El oráculo habla: frases crípticas armadas por gramática
   sembrada. Mismo texto, misma sentencia.
   ------------------------------------------------------------ */

const SUJETOS = [
  'la señal', 'el círculo', 'lo que nombras', 'la corriente',
  'el patrón', 'tu sombra', 'la distancia', 'el pulso',
  'lo no dicho', 'la simetría',
];
const VERBOS = [
  'persiste más allá de', 'se disuelve en', 'regresa hacia',
  'aprende de', 'no reconoce', 'gira alrededor de',
  'se enciende con', 'guarda silencio ante',
];
const OBJETOS = [
  'el ruido que se rinde', 'la espera', 'lo que dejaste abierto',
  'la repetición', 'el borde de la luz', 'aquello que no mides',
  'la puerta que cerraste', 'el intervalo', 'la pregunta misma',
  'lo que aún no ocurre',
];

function generarRespuesta(rng) {
  const frase = `${elegir(rng, SUJETOS)} ${elegir(rng, VERBOS)} ${elegir(rng, OBJETOS)}`;
  return frase.replace(/\bde el\b/g, 'del');
}

/* ------------------------------------------------------------
   Lienzo y geometría de pantalla
   ------------------------------------------------------------ */

let W = 0, H = 0, DPR = 1;

function redimensionar() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  lienzo.width = Math.round(W * DPR);
  lienzo.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', redimensionar);
redimensionar();

/* ------------------------------------------------------------
   Ondas al fondo — "Unknown Pleasures".
   Crestas apiladas que ocluyen a las de atrás; si el sonido
   está activo, laten con el analizador de audio.
   ------------------------------------------------------------ */

const FILAS_ONDA = 22;
const PUNTOS_ONDA = 96;
const fasesOnda = [];
for (let f = 0; f < FILAS_ONDA; f++) {
  fasesOnda.push({
    a: Math.random() * TAU,
    b: Math.random() * TAU,
    c: Math.random() * TAU,
    v: 0.4 + Math.random() * 0.8,
  });
}

function dibujarOndas(t, energia) {
  const anchoBanda = Math.min(W * 0.72, 620);
  const x0 = (W - anchoBanda) / 2;
  const yTope = H * 0.58;
  const paso = (H * 0.34) / FILAS_ONDA;
  const veloc = MOV_REDUCIDO ? 0.05 : 1;

  ctx.save();
  ctx.lineWidth = 1;

  for (let f = 0; f < FILAS_ONDA; f++) {
    const y = yTope + f * paso;
    const ph = fasesOnda[f];
    const tt = t * 0.00035 * ph.v * veloc;

    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let i = 0; i <= PUNTOS_ONDA; i++) {
      const u = i / PUNTOS_ONDA;               // 0..1 a lo ancho
      const x = x0 + u * anchoBanda;
      // envolvente gaussiana: la agitación vive en el centro
      const env = Math.exp(-Math.pow((u - 0.5) * 3.1, 2));
      let n =
        Math.sin(u * 21 + ph.a + tt * 5) * 0.45 +
        Math.sin(u * 47 + ph.b - tt * 9) * 0.3 +
        Math.sin(u * 89 + ph.c + tt * 13) * 0.25;
      // picos ocasionales, marca de la casa
      n += Math.pow(Math.max(0, Math.sin(u * 13 + ph.b + tt * 3)), 6) * 1.4;
      const amp = env * (10 + 26 * (0.35 + energia)) * n;
      ctx.lineTo(x, y - Math.max(-6, amp));
    }
    // ocluir las crestas de atrás: relleno del color del fondo
    ctx.lineTo(x0 + anchoBanda, y + paso * 1.5);
    ctx.lineTo(x0, y + paso * 1.5);
    ctx.closePath();
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232, 232, 230, 0.30)';
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------
   Capas del mandala
   ------------------------------------------------------------ */

function trazo(alpha, matiz) {
  return matiz == null
    ? `rgba(232, 232, 230, ${alpha})`
    : `hsla(${matiz}, 62%, 64%, ${alpha})`;
}

function suavizar(x) {
  x = Math.min(Math.max(x, 0), 1);
  return x * x * (3 - 2 * x);
}

// Círculo dibujado parcialmente (para la animación de revelado)
function arcoRevelado(r, rev) {
  if (rev <= 0) return;
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + TAU * rev);
  ctx.stroke();
}

// Flor de la vida: retícula hexagonal de círculos entrelazados
function dibujarFlor(radio, anillos, rev, matiz) {
  const rc = radio / (anillos + 0.5);
  ctx.strokeStyle = trazo(0.5 * rev, matiz);
  ctx.lineWidth = 1;
  arcoRevelado(rc, rev);
  for (let anillo = 1; anillo <= anillos; anillo++) {
    const revA = suavizar(rev * (anillos + 1) - anillo);
    if (revA <= 0) continue;
    for (let k = 0; k < 6; k++) {
      const angA = (k / 6) * TAU;
      const angB = (((k + 1) % 6) / 6) * TAU;
      for (let p = 0; p < anillo; p++) {
        const u = p / anillo;
        const cx = rc * anillo * (Math.cos(angA) * (1 - u) + Math.cos(angB) * u);
        const cy = rc * anillo * (Math.sin(angA) * (1 - u) + Math.sin(angB) * u);
        ctx.save();
        ctx.translate(cx, cy);
        arcoRevelado(rc, revA);
        ctx.restore();
      }
    }
  }
}

// Cubo de Metatrón: 13 centros, todas las líneas entre ellos
function dibujarMetatron(radio, rev, matiz) {
  const d = radio / 2;
  const pts = [[0, 0]];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    pts.push([Math.cos(a) * d, Math.sin(a) * d]);
    pts.push([Math.cos(a) * d * 2, Math.sin(a) * d * 2]);
  }
  ctx.strokeStyle = trazo(0.16 * rev, matiz);
  ctx.lineWidth = 0.7;
  let n = 0;
  const total = (pts.length * (pts.length - 1)) / 2;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const revL = suavizar(rev * 1.6 - (n / total) * 0.6);
      n++;
      if (revL <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(
        pts[i][0] + (pts[j][0] - pts[i][0]) * revL,
        pts[i][1] + (pts[j][1] - pts[i][1]) * revL
      );
      ctx.stroke();
    }
  }
  // los 13 nodos
  ctx.fillStyle = trazo(0.55 * rev, matiz);
  for (const [x, y] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, TAU);
    ctx.fill();
  }
}

// Espirales áureas: r = a · φ^(θ·2/π), repetidas por simetría
function dibujarEspirales(radio, simetria, invertidas, rev, matiz) {
  ctx.strokeStyle = trazo(0.4 * rev, matiz);
  ctx.lineWidth = 1;
  const pasos = 90;
  const thetaMax = TAU * 1.6 * rev;
  const signo = invertidas ? -1 : 1;
  for (let k = 0; k < simetria; k++) {
    ctx.save();
    ctx.rotate((k / simetria) * TAU);
    ctx.beginPath();
    for (let i = 0; i <= pasos; i++) {
      const th = (i / pasos) * thetaMax;
      const r = radio * 0.06 * Math.pow(PHI, th * (2 / Math.PI));
      if (r > radio) break;
      const x = Math.cos(th * signo) * r;
      const y = Math.sin(th * signo) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// Anillo de polígonos regulares rotados
function dibujarPoligonos(radio, lados, copias, rev, matiz) {
  ctx.strokeStyle = trazo(0.35 * rev, matiz);
  ctx.lineWidth = 1;
  for (let c = 0; c < copias; c++) {
    const revC = suavizar(rev * copias - c * 0.5);
    if (revC <= 0) continue;
    ctx.save();
    ctx.rotate((c / copias) * (TAU / lados));
    ctx.beginPath();
    for (let i = 0; i <= lados; i++) {
      const a = (i / lados) * TAU - Math.PI / 2;
      const x = Math.cos(a) * radio;
      const y = Math.sin(a) * radio;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.globalAlpha = revC;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

// Anillo de puntos
function dibujarPuntos(radio, cantidad, rev, matiz) {
  ctx.fillStyle = trazo(0.7 * rev, matiz);
  const visibles = Math.floor(cantidad * rev);
  for (let i = 0; i < visibles; i++) {
    const a = (i / cantidad) * TAU - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * radio, Math.sin(a) * radio, 1.4, 0, TAU);
    ctx.fill();
  }
}

// Bindu: el punto-semilla en el centro del yantra
function dibujarBindu(rev, matiz) {
  if (rev <= 0) return;
  ctx.fillStyle = trazo(0.9 * rev, matiz);
  ctx.beginPath();
  ctx.arc(0, 0, 2.6 * rev, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = trazo(0.5 * rev, matiz);
  ctx.lineWidth = 1;
  arcoRevelado(8, rev);
}

// Un triángulo equilátero trazado progresivamente
function dibujarTri(r, rot, revL) {
  if (revL <= 0) return;
  const per = 3 * r * Math.sqrt(3);
  ctx.setLineDash([per * revL, per]);
  ctx.beginPath();
  for (let i = 0; i <= 3; i++) {
    const a = rot + (i % 3) * (TAU / 3);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

// Triángulos entrelazados del yantra: ↑ fuego / ↓ agua
function dibujarYantraTri(radio, arriba, abajo, rev, matiz) {
  ctx.strokeStyle = trazo(0.5 * rev, matiz);
  ctx.lineWidth = 1.1;
  const total = Math.max(1, arriba + abajo);
  let idx = 0;
  for (let i = 0; i < arriba; i++, idx++) {
    const r = radio * (1 - (i / (arriba + 0.6)) * 0.62);
    dibujarTri(r, -Math.PI / 2, suavizar(rev * total * 0.9 - idx * 0.45));
  }
  for (let i = 0; i < abajo; i++, idx++) {
    const r = radio * (0.92 - (i / (abajo + 0.6)) * 0.58);
    dibujarTri(r, Math.PI / 2, suavizar(rev * total * 0.9 - idx * 0.45));
  }
}

// Anillo de pétalos de loto
function dibujarLoto(r0, r1, petalos, rev, matiz) {
  ctx.strokeStyle = trazo(0.45 * rev, matiz);
  ctx.lineWidth = 1;
  for (let i = 0; i < petalos; i++) {
    const revP = suavizar(rev * petalos * 0.5 - i * 0.35);
    if (revP <= 0) continue;
    const a = (i / petalos) * TAU - Math.PI / 2;
    const da = TAU / petalos / 2;
    const tip = r0 + (r1 - r0) * revP;
    const medio = r0 + (tip - r0) * 0.62;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - da * 0.9) * r0, Math.sin(a - da * 0.9) * r0);
    ctx.quadraticCurveTo(
      Math.cos(a - da) * medio, Math.sin(a - da) * medio,
      Math.cos(a) * tip, Math.sin(a) * tip
    );
    ctx.quadraticCurveTo(
      Math.cos(a + da) * medio, Math.sin(a + da) * medio,
      Math.cos(a + da * 0.9) * r0, Math.sin(a + da * 0.9) * r0
    );
    ctx.stroke();
  }
}

// Bhupura: el recinto cuadrado del yantra, con una puerta por lado
function dibujarBhupura(mitad, rev, matiz) {
  if (rev <= 0) return;
  const g = mitad * 0.2;    // media anchura de la puerta
  const p = mitad * 0.1;    // saliente de la puerta
  ctx.lineWidth = 1.2;
  for (let k = 0; k < 4; k++) {
    const revL = suavizar(rev * 1.9 - k * 0.28);
    if (revL <= 0) continue;
    ctx.save();
    ctx.rotate(k * (Math.PI / 2));
    const pts = [
      [-mitad, -mitad], [-g, -mitad], [-g, -mitad - p],
      [-g * 0.45, -mitad - p], [-g * 0.45, -mitad - p * 1.9],
      [g * 0.45, -mitad - p * 1.9], [g * 0.45, -mitad - p],
      [g, -mitad - p], [g, -mitad], [mitad, -mitad],
    ];
    let per = 0;
    for (let i = 1; i < pts.length; i++) {
      per += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    ctx.setLineDash([per * revL, per]);
    ctx.strokeStyle = trazo(0.5 * rev, matiz);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  // marco interior sencillo
  const m2 = mitad * 0.94;
  const per2 = 8 * m2;
  ctx.setLineDash([per2 * rev, per2]);
  ctx.strokeStyle = trazo(0.28 * rev, matiz);
  ctx.beginPath();
  ctx.rect(-m2, -m2, m2 * 2, m2 * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Anillo exterior: la intención codificada en color, letra a letra
// (el "alfabeto" de Power, Corruption & Lies)
function dibujarAnilloCodigo(radio, matices, rev, cromatico) {
  if (matices.length === 0) return;
  const hueco = TAU * 0.006;
  const seg = TAU / matices.length;
  ctx.lineWidth = Math.max(3, radio * 0.03);
  const visibles = Math.ceil(matices.length * rev);
  for (let i = 0; i < visibles; i++) {
    const a0 = -Math.PI / 2 + i * seg + hueco;
    const a1 = -Math.PI / 2 + (i + 1) * seg - hueco;
    ctx.strokeStyle = cromatico
      ? `hsla(${matices[i]}, 68%, 58%, ${0.85 * rev})`
      : `rgba(232, 232, 230, ${(0.2 + 0.6 * (matices[i] / 360)) * rev})`;
    ctx.beginPath();
    ctx.arc(0, 0, radio, a0, a1);
    ctx.stroke();
  }
}

function dibujarMandala(t, energia) {
  if (!espec) return;
  const edad = t - nacimiento;
  const rev = suavizar(edad / 3800); // revelado total en ~3.8 s
  const veloc = MOV_REDUCIDO ? 0.06 : 1;

  const cx = W / 2;
  const cy = H * 0.44;
  const esYantra = espec.linaje === 'yantra';
  // el bhupura necesita aire: sus esquinas sobresalen del círculo
  const radio = Math.min(W, H) * 0.30 * (esYantra ? 0.78 : 1);

  // latido: respira despacio, y un poco más si hay sonido
  const latido = 1 + Math.sin(t * 0.0006 * veloc) * 0.012 + energia * 0.03;
  // giro meditativo: una vuelta completa cada 2–5 minutos
  const gir = espec.fase + t * 0.0001 * espec.girBase * veloc;

  const ac = espec.acentos; // matices de acento (o vacío en modo mono)
  const acento = (i) => (ac.length ? ac[i % ac.length] : null);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(latido, latido);

  // halo tenue de fondo
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, radio * 1.35);
  halo.addColorStop(0, 'rgba(232, 232, 230, 0.05)');
  halo.addColorStop(1, 'rgba(232, 232, 230, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, radio * 1.35, 0, TAU);
  ctx.fill();

  // capas según linaje, cada una con su giro propio
  if (espec.linaje !== 'yantra') {
    ctx.save();
    ctx.rotate(gir);
    dibujarFlor(
      radio * (espec.linaje === 'mixto' ? 0.5 : 0.62),
      espec.anillosFlor, suavizar(rev * 1.3), null
    );
    ctx.restore();
  }

  if (espec.linaje === 'occidente' && espec.conMetatron) {
    ctx.save();
    ctx.rotate(-gir * 0.6);
    dibujarMetatron(radio * 0.88, suavizar(rev * 1.15 - 0.1), acento(0));
    ctx.restore();
  }

  if (espec.linaje !== 'yantra' && espec.conEspirales) {
    ctx.save();
    ctx.rotate(gir * 0.4);
    dibujarEspirales(
      radio * 0.95, espec.simetria, espec.espiralesInvertidas,
      suavizar(rev * 1.2 - 0.15), acento(1)
    );
    ctx.restore();
  }

  if (espec.linaje === 'occidente') {
    ctx.save();
    ctx.rotate(-gir * 0.25);
    dibujarPoligonos(
      radio * 0.8, espec.ladosPoligono, espec.poligonos,
      suavizar(rev * 1.1 - 0.2), acento(2)
    );
    ctx.restore();

    for (let i = 0; i < espec.anillosPuntos; i++) {
      ctx.save();
      ctx.rotate(gir * (i % 2 ? 0.5 : -0.35));
      dibujarPuntos(
        radio * (1.0 + i * 0.06), espec.simetria * (3 + i * 2),
        suavizar(rev * 1.1 - 0.25 - i * 0.1), null
      );
      ctx.restore();
    }
  }

  if (espec.linaje !== 'occidente') {
    // las capas del yantra ignoran la fase aleatoria:
    // los triángulos deben nacer rectos (↑ fuego / ↓ agua)
    const girY = gir - espec.fase;

    // el recinto no gira: es la tierra, el marco del mundo
    if (esYantra) {
      dibujarBhupura(radio * 1.3, suavizar(rev * 1.2 - 0.05), acento(0));
    }

    ctx.save();
    ctx.rotate(girY * 0.12);
    dibujarLoto(
      radio * (esYantra ? 0.78 : 0.85), radio * (esYantra ? 0.98 : 1.02),
      espec.petalos, suavizar(rev * 1.15 - 0.15), acento(1)
    );
    ctx.restore();

    // los triángulos no giran jamás: ↑ fuego / ↓ agua, siempre rectos
    dibujarYantraTri(
      radio * 0.72, espec.triArriba, espec.triAbajo,
      suavizar(rev * 1.1 - 0.25), acento(0)
    );

    dibujarBindu(suavizar(rev * 1.4 - 0.5), acento(0));
  }

  // el anillo del código no gira: es la palabra, fija
  dibujarAnilloCodigo(
    radio * 1.16, espec.matices,
    suavizar(rev * 1.3 - 0.35), espec.cromatico
  );

  ctx.restore();
}

/* ------------------------------------------------------------
   Sonido — dron generativo con Web Audio.
   Raíz derivada de la semilla; púas pentatónicas ocasionales;
   eco por retroalimentación. Nada de muestras: todo síntesis.
   ------------------------------------------------------------ */

let audio = null; // { ctx, master, analizador, datos, ... }
let sonidoActivo = false;
let temporizadorPua = null;

const ESCALAS = [
  [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3],       // pentatónica mayor
  [1, 6 / 5, 4 / 3, 3 / 2, 9 / 5],       // pentatónica menor
  [1, 16 / 15, 4 / 3, 3 / 2, 8 / 5],     // hirajoshi-ish
];

function crearAudio() {
  const actx = new (window.AudioContext || window.webkitAudioContext)();

  const master = actx.createGain();
  master.gain.value = 0;

  const compresor = actx.createDynamicsCompressor();
  compresor.threshold.value = -28;
  compresor.ratio.value = 6;

  const analizador = actx.createAnalyser();
  analizador.fftSize = 256;
  analizador.smoothingTimeConstant = 0.85;

  master.connect(compresor);
  compresor.connect(analizador);
  analizador.connect(actx.destination);

  // eco: retardo con retroalimentación filtrada
  const eco = actx.createDelay(2);
  eco.delayTime.value = 0.62;
  const retro = actx.createGain();
  retro.gain.value = 0.42;
  const filtroEco = actx.createBiquadFilter();
  filtroEco.type = 'lowpass';
  filtroEco.frequency.value = 1600;
  eco.connect(filtroEco);
  filtroEco.connect(retro);
  retro.connect(eco);
  eco.connect(master);

  return {
    ctx: actx,
    master,
    analizador,
    datos: new Uint8Array(analizador.frequencyBinCount),
    eco,
    drones: [],
  };
}

function iniciarDron() {
  if (!audio || !espec) return;
  detenerDron();
  const { ctx: actx, master } = audio;
  const raiz = espec.raizHz;
  const ahora = actx.currentTime;

  const filtro = actx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 700;
  filtro.Q.value = 0.7;

  // LFO lentísimo que abre y cierra el filtro: la marea
  const lfo = actx.createOscillator();
  lfo.frequency.value = 0.02;
  const lfoGan = actx.createGain();
  lfoGan.gain.value = 320;
  lfo.connect(lfoGan);
  lfoGan.connect(filtro.frequency);
  lfo.start();

  const salidaDron = actx.createGain();
  salidaDron.gain.setValueAtTime(0, ahora);
  salidaDron.gain.linearRampToValueAtTime(0.05, ahora + 4);
  filtro.connect(salidaDron);
  salidaDron.connect(master);

  const voces = [
    { f: raiz / 2, tipo: 'sine', det: 0 },
    { f: raiz, tipo: 'triangle', det: 3 },
    { f: raiz * 1.5, tipo: 'sine', det: -4 },
  ];
  const oscs = voces.map((v) => {
    const o = actx.createOscillator();
    o.type = v.tipo;
    o.frequency.value = v.f;
    o.detune.value = v.det;
    o.connect(filtro);
    o.start();
    return o;
  });

  audio.drones = [...oscs, lfo];
  audio.salidaDron = salidaDron;
  programarPua();
}

function detenerDron() {
  if (!audio) return;
  clearTimeout(temporizadorPua);
  for (const o of audio.drones) {
    try { o.stop(); } catch (e) { /* ya detenido */ }
  }
  audio.drones = [];
}

// una nota breve, como gota en el estanque
function pua() {
  if (!audio || !sonidoActivo || !espec) return;
  const { ctx: actx, master, eco } = audio;
  const escala = ESCALAS[espec.modoEscala];
  const ratio = escala[Math.floor(Math.random() * escala.length)];
  const octava = Math.random() < 0.5 ? 2 : 4;
  const f = espec.raizHz * ratio * octava;
  const ahora = actx.currentTime;

  const o = actx.createOscillator();
  o.type = 'sine';
  o.frequency.value = f;
  const g = actx.createGain();
  g.gain.setValueAtTime(0, ahora);
  g.gain.linearRampToValueAtTime(0.055, ahora + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ahora + 2.8);
  o.connect(g);
  g.connect(master);
  g.connect(eco);
  o.start(ahora);
  o.stop(ahora + 3);
}

function programarPua() {
  clearTimeout(temporizadorPua);
  temporizadorPua = setTimeout(() => {
    pua();
    programarPua();
  }, 1800 + Math.random() * 4200);
}

async function alternarSonido() {
  if (!sonidoActivo) {
    if (!audio) audio = crearAudio();
    await audio.ctx.resume();
    sonidoActivo = true;
    iniciarDron();
    const ahora = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(ahora);
    audio.master.gain.linearRampToValueAtTime(0.9, ahora + 1.5);
    btnSonido.textContent = 'SONIDO · ON';
    btnSonido.setAttribute('aria-pressed', 'true');
  } else {
    sonidoActivo = false;
    const ahora = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(ahora);
    audio.master.gain.linearRampToValueAtTime(0, ahora + 0.8);
    setTimeout(() => detenerDron(), 900);
    btnSonido.textContent = 'SONIDO · OFF';
    btnSonido.setAttribute('aria-pressed', 'false');
  }
}

// energía de graves 0..1 para que lo visual respire con el sonido
function energiaAudio() {
  if (!audio || !sonidoActivo) return 0;
  audio.analizador.getByteFrequencyData(audio.datos);
  let suma = 0;
  const n = Math.min(20, audio.datos.length);
  for (let i = 0; i < n; i++) suma += audio.datos[i];
  return Math.min(1, suma / n / 160);
}

/* ------------------------------------------------------------
   Consultas
   ------------------------------------------------------------ */

const PALABRAS_CIEGAS = [
  'umbral', 'deriva', 'ceniza', 'vértice', 'marea', 'eco',
  'penumbra', 'órbita', 'quietud', 'fisura', 'norte', 'vigilia',
  'hondura', 'brasa', 'intervalo', 'niebla',
];

function consultar(texto) {
  espec = crearEspec(texto);
  nacimiento = performance.now();

  respuestaEl.classList.remove('visible');
  clearTimeout(consultar._timer);
  consultar._timer = setTimeout(() => {
    respuestaEl.textContent = espec.respuesta;
    respuestaEl.classList.add('visible');
  }, MOV_REDUCIDO ? 300 : 2200);

  if (sonidoActivo) iniciarDron(); // el dron cambia de raíz con la consulta
}

forma.addEventListener('submit', (e) => {
  e.preventDefault();
  consultar(campo.value.trim() || elegir(mulberry32(Date.now()), PALABRAS_CIEGAS));
  campo.blur();
});

// clic en el vacío: consulta ciega con una palabra al azar
lienzo.addEventListener('pointerdown', () => {
  const palabra = PALABRAS_CIEGAS[Math.floor(Math.random() * PALABRAS_CIEGAS.length)];
  campo.value = palabra;
  consultar(palabra);
});

btnSonido.addEventListener('click', alternarSonido);

btnGuardar.addEventListener('click', () => {
  const enlace = document.createElement('a');
  const slug = (espec ? espec.texto : 'sigil')
    .toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, '-').slice(0, 40) || 'sigil';
  enlace.download = `sigil-${slug}.png`;
  enlace.href = lienzo.toDataURL('image/png');
  enlace.click();
});

/* ------------------------------------------------------------
   Bucle principal
   ------------------------------------------------------------ */

function cuadro(t) {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // viñeta sutil
  const v = ctx.createRadialGradient(
    W / 2, H * 0.44, Math.min(W, H) * 0.2,
    W / 2, H * 0.44, Math.max(W, H) * 0.8
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');

  const energia = energiaAudio();
  dibujarOndas(t, energia);
  dibujarMandala(t, energia);

  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(cuadro);
}

// primera consulta: la app nunca está vacía
consultar(elegir(mulberry32(Date.now() >>> 0), PALABRAS_CIEGAS));
requestAnimationFrame(cuadro);
