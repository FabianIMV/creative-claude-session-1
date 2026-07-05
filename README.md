# SIGIL — señal / geometría 

Un oráculo visual generativo. Escribes una intención (o haces clic en el vacío
para una consulta ciega) y la app la convierte en la **semilla determinista**
de una figura única de geometría sagrada. La misma intención produce siempre
la misma figura y la misma sentencia del oráculo.

Hay tres **linajes geométricos**, y la semilla elige uno:

- **occidente** — flor de la vida, cubo de Metatrón, espirales áureas,
  anillos de polígonos y puntos;
- **yantra** — triángulos entrelazados (↑ fuego / ↓ agua), anillo de pétalos
  de loto, bindu central y bhupura (el recinto cuadrado con una puerta por
  lado, que no gira: es el marco del mundo);
- **mixto** — flor, espirales, loto y triángulos conviviendo.

Y si la intención **invoca una deidad**, la geometría responde con su yantra
(interpretación libre y respetuosa de las formas tradicionales):

| invocación | triángulos | pétalos | matiz |
|---|---|---|---|
| `ganesha` | 1↑ 1↓ | 8 | rojo teja |
| `shiva` (mahadev) | 5↑ | 16 | ceniza azul |
| `vishnu` (narayan) | 2↑ 2↓ | 12 | oro |
| `brahma` | 1↑ 1↓ | 12 | azafrán rojo |
| `shakti` (sri yantra, devi, durga, kali, lakshmi) | 4↑ 5↓ | 16 | magenta |

Las invocaciones también cambian el sonido: el dron pasa a una escala
hirajōshi.

**Pruébalo:** escribe una palabra, pulsa CONSULTAR, activa SONIDO y espera.

## El nombre

*Sigil*: un sello, un signo condensado de intención — exactamente lo que la
app dibuja. Corto, funciona en inglés y en español, y conecta la tradición
mágica con la gráfica de club nocturno de los 80.

## Concepto y decisiones creativas

La estética viene de Peter Saville y Factory Records, con dos citas directas:

- **Unknown Pleasures** — al fondo laten las crestas apiladas del pulsar
  CP 1919: cada línea ocluye a la de atrás (relleno del color del fondo antes
  del trazo), con una envolvente gaussiana que concentra la agitación en el
  centro y picos ocasionales. Si el sonido está activo, laten con la energía
  de graves del analizador de audio.
- **Power, Corruption & Lies** — la portada de New Order escondía un alfabeto
  cromático de Saville. Aquí, el anillo exterior del mandala codifica tu
  intención **letra a letra** en segmentos de color (A–Z → rueda de matices).
  Tu palabra queda literalmente escrita alrededor del mandala, y los colores
  de acento del propio mandala se toman de esas mismas letras. El anillo del
  código es la única capa que no gira: la palabra permanece fija.

Otras decisiones:

- **Determinismo como misticismo.** La intención se hashea (xmur3) y alimenta
  un PRNG (mulberry32). Todo lo "azaroso" —linaje, simetría, capas, giros,
  paleta, frase del oráculo, raíz del dron— sale de esa semilla. Consultar dos
  veces lo mismo devuelve lo mismo: el oráculo es consistente, como debe ser.
- **Sonido 100 % sintetizado** con Web Audio API, sin muestras: un dron de
  tres voces (raíz, octava, quinta desafinada) tras un filtro cuya frecuencia
  la mueve un LFO de 0.02 Hz —una marea—, más "púas" pentatónicas ocasionales
  con eco por retroalimentación. La raíz y la escala también salen de la
  semilla, así que cada intención suena distinta. Arranca solo tras gesto del
  usuario (política de autoplay) y hace fade in/out para evitar clics.
- **El oráculo habla**: una gramática sembrada (sujeto + giro + objeto) genera
  sentencias crípticas tipo "la señal persiste donde el ruido se rinde".
- **Paleta clínica**: casi todo es tinta hueso (#e8e8e6) sobre negro azulado
  (#0a0a0f); el color solo aparece cuando tu palabra lo trae consigo, y a
  veces el oráculo decide quedarse en monocromo puro (modo Unknown Pleasures).
- **GUARDAR** descarga el fotograma actual como PNG.

## Técnica

- HTML/CSS/JS vanilla, **cero dependencias**, cero build: `index.html`,
  `style.css`, `app.js`. Funciona directo en GitHub Pages.
- Canvas 2D único con DPR limitado a 2; responsive (el mandala y la banda de
  ondas se escalan con el viewport) y con soporte de `safe-area-inset` para
  móviles con notch.
- Respeta `prefers-reduced-motion`: el giro y el latido se reducen casi a cero
  y la frase aparece sin demora teatral.

---

*Sesión creativa generada con Claude Code.*
