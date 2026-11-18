"use client";
// @ts-nocheck
/**
 * Hero.tsx: tekcify hero in ONE file (pinned scroll + exact cards).
 * Needs:  npm i gsap
 *         public/cards/{logo-white,plud,dbdock,ballast,fontroom,hushboard,skillmd}.png
 * Font:   "Inter Tight" 500/600 (add to your layout, e.g. next/font/google)
 * Usage:  import Hero from "./Hero";   <Hero />
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* ===================== styles ===================== */
const CSS = `:root{--nd-ease-out:cubic-bezier(.16,1,.3,1);--nd-ease-spring:cubic-bezier(.34,1.56,.64,1);--nd-gutter:clamp(1rem,3vw,2.5rem)}
.hero-stage{position:relative;height:100svh;min-height:560px;overflow:hidden;background:#eee;font-family:"Inter Tight",system-ui,sans-serif;color:#111}
.hero-stage .w{display:inline-block;margin-right:.26em}
.hero-stage .w:last-child{margin-right:0}
.tt-mute{color:#999}

.hero-title{position:absolute;inset-inline:0;top:30%;z-index:4;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 1rem}
.hero-title h1{margin:0;font:600 clamp(3.4rem,11.5vw,10.5rem)/1 system-ui;letter-spacing:-.045em}
.hero-hint{position:absolute;right:var(--nd-gutter);top:38%;z-index:4;display:flex;flex-direction:column;align-items:center;gap:12px;color:#737373;font:500 11px system-ui;letter-spacing:.08em;text-transform:uppercase}
.hero-hint span{writing-mode:vertical-rl}.hero-hint i{width:1px;height:48px;background:currentColor;opacity:.4}

.hero-copy{position:absolute;inset-inline:0;top:33%;z-index:3;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 1rem}
.hero-copy h2{margin:0;max-width:20ch;font:600 clamp(2.1rem,4.7vw,4.9rem)/1.02 system-ui;letter-spacing:-.04em}
.hero-copy-sub{margin:20px 0 0;max-width:28rem;color:#525252;line-height:1.6}
.hero-copy-cta{margin-top:24px}.hero-copy-cta a{display:inline-block;padding:10px 18px;border-radius:99px;background:#5a31b2;color:#fff;text-decoration:none}

.hero-cards{--card-w:clamp(112px,15vw,236px);position:absolute;inset:0;z-index:2;pointer-events:none}
.hero-card{position:absolute;top:50%;left:50%;will-change:transform;
  margin-left:calc(var(--card-w)/-2);margin-top:calc(var(--card-w)*-.6667);
  transform:translate(calc(var(--x)*100vw),calc(var(--y)*100svh)) rotate(calc(var(--r)*1deg))}
@keyframes nd-card-rise{0%{translate:0 70vh;rotate:10deg}to{translate:0;rotate:0deg}}
.nd-card-wrap{position:relative;pointer-events:auto}
.nd-card{display:block;position:relative;overflow:hidden;width:var(--card-w);aspect-ratio:3/4;border-radius:calc(var(--card-w)*.075);backface-visibility:hidden;
  box-shadow:0 0 0 1px #0000000f,0 1px 2px #0000000d,0 10px 24px -14px #0000002e}
.nd-card-wrap:before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;border-radius:calc(var(--card-w)*.075);box-shadow:inset 0 0 0 1px #ffffff14;
  background:linear-gradient(112deg,#fff0 38%,#fff3 47%,#ffffff0d 52%,#fff0 60%) 130% 0/260% 100% no-repeat;transition:background-position 1.1s var(--nd-ease-out)}
.nd-card-wrap:hover:before{background-position:-30% 0}

/* the sky panel revealed by the scroll (clip-path is driven by GSAP) */
.hero-expand{position:absolute;inset:0;z-index:5;clip-path:inset(100% 50% 0% 50%);
  background:radial-gradient(55% 38% at 72% 28%,rgb(255 255 255/.6),transparent 70%),radial-gradient(45% 32% at 22% 74%,rgb(255 255 255/.45),transparent 70%),linear-gradient(180deg,#5a86cf,#a2bde8)}
.hero-sky-text{position:absolute;inset:0;color:#fff;pointer-events:none;text-shadow:0 2px 28px #12265459}
.hero-sky-text p{position:absolute;margin:0;font:600 clamp(2rem,4.6vw,4.8rem)/1.02 system-ui;letter-spacing:-.04em}
.hero-sky-text .tt-mute{color:#ffffff99}
.sky-a{left:var(--nd-gutter);top:14%}.sky-b{right:var(--nd-gutter);bottom:8%;text-align:right}
.hero-blackout{position:absolute;inset:0;z-index:6;background:#000;opacity:0;pointer-events:none}
@media (prefers-reduced-motion:reduce){.hero-card>div{animation:none!important}}
`;

/* ===================== card faces (exact painter) ===================== */
// EXACT card painter from tekcify.com (module 99472, "albedo" pass), de-minified.
// Needs: public/cards/{logo-white.png, plud.png, dbdock.png, ballast.png, fontroom.png, hushboard.png, skillmd.*}
// and the "Inter Tight" font (600 weight) loaded on the page.
export const W = 600,
  H = 800,
  S = W / 300; // canvas 600x800, scale factor 2
export const BRAND = "#5a31b2",
  PLUD = "#508c87";

const grad = (c, stops) => {
  const g = c.createLinearGradient(0, 0, W, H);
  for (const [o, k] of stops) g.addColorStop(o, k);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
};
const glow = (c, x, y, r, col) => {
  const g = c.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * W);
  g.addColorStop(0, col);
  g.addColorStop(1, col.replace(/[\d.]+\)$/, "0)"));
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
};

// word = vertical title on the right edge, domain = bottom-left micro text, icon = logo plate at top-left
export const FACES = {
  holo: {
    word: "Tekcify",
    domain: "TEKCIFY.COM",
    icon: "tekcify",
    wordInk: "#ffffff",
    plate: "#f1eef8",
    markInk: BRAND,
    micro: "rgba(255,255,255,0.82)",
    paint: (c) => {
      grad(c, [
        [0, "#3a1d8f"],
        [0.5, BRAND],
        [1, "#9a72f0"],
      ]);
      glow(c, 0.95, 0.04, 0.8, "rgba(236,128,214,0.6)");
      glow(c, 0.02, 0.98, 0.9, "rgba(84,120,255,0.5)");
    },
  },
  plud: {
    word: "Plud",
    domain: "PLUD.APP",
    icon: "plud.png",
    wordInk: "#f7f1da",
    micro: "rgba(247,241,218,0.85)",
    paint: (c) => {
      grad(c, [
        [0, "#346f69"],
        [0.55, PLUD],
        [1, "#78b2ab"],
      ]);
      glow(c, 0.12, 0.04, 0.8, "rgba(255,255,255,0.16)");
    },
  },
  dbdock: {
    word: "DBDock",
    domain: "DBDOCK.XYZ",
    icon: "dbdock.png",
    wordInk: "#ffffff",
    micro: "rgba(238,243,255,0.82)",
    paint: (c) => {
      grad(c, [
        [0, "#13245a"],
        [0.5, "#1b3577"],
        [1, "#2448a8"],
      ]);
      glow(c, 0.92, 0.96, 0.9, "rgba(37,99,235,0.7)");
    },
  },
  ballast: {
    word: "Ballast",
    domain: "GITHUB.COM/TEKCIFY",
    icon: "ballast.png",
    wordInk: "#f4f5f7",
    micro: "rgba(244,245,247,0.72)",
    paint: (c) => {
      grad(c, [
        [0, "#2b2f36"],
        [1, "#16181c"],
      ]);
      glow(c, 0.95, 0.05, 0.9, "rgba(91,108,214,0.5)");
      glow(c, 0.05, 1, 0.6, "rgba(212,134,63,0.16)");
    },
  },
  fontroom: {
    word: "Fontroom",
    domain: "FONTROOM.TEKCIFY.COM",
    icon: "fontroom.png",
    wordInk: "#f2f4f7",
    micro: "rgba(242,244,247,0.72)",
    paint: (c) => {
      grad(c, [
        [0, "#1d2027"],
        [1, "#0b0d10"],
      ]);
      glow(c, 0.08, 0.98, 0.95, "rgba(255,90,54,0.42)");
    },
  },
  hushboard: {
    word: "Hushboard",
    domain: "GITHUB.COM/TEKCIFY",
    icon: "hushboard.png",
    wordInk: "#fff6ee",
    micro: "rgba(255,246,238,0.82)",
    paint: (c) => {
      grad(c, [
        [0, "#c8653a"],
        [0.55, "#b4532a"],
        [1, "#8f3f1f"],
      ]);
      glow(c, 0.1, 0.05, 0.8, "rgba(255,246,238,0.2)");
    },
  },
  skillmd: {
    word: "skillmd",
    domain: "GETSKILLMD.COM",
    icon: "skillmd.png",
    wordInk: "#ffffff",
    micro: "rgba(255,255,255,0.85)",
    paint: (c) => {
      grad(c, [
        [0, "#ff8448"],
        [0.5, "#ff6a2c"],
        [1, "#e2541a"],
      ]);
      glow(c, 0.9, 0.05, 0.8, "rgba(255,255,255,0.18)");
    },
  },
};

const load = (src) => {
  const i = new Image();
  i.decoding = "async";
  i.src = src;
  return i.decode().then(() => i);
};
const tint = (img, w, h, color) => {
  const k = document.createElement("canvas");
  k.width = Math.ceil(w);
  k.height = Math.ceil(h);
  const x = k.getContext("2d");
  x.drawImage(img, 0, 0, k.width, k.height);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color;
  x.fillRect(0, 0, k.width, k.height);
  return k;
};

let cache;
/** Loads the logo mark + app icons once. base = folder that serves /cards/* (default "/cards") */
export function loadAssets(
  base = "/cards",
  family = '"Inter Tight", system-ui, sans-serif',
) {
  return (cache ??= (async () => {
    const [markImg, ...imgs] = await Promise.all([
      load(`${base}/logo-white.png`),
      ...Object.values(FACES)
        .filter((f) => f.icon !== "tekcify")
        .map((f) => load(`${base}/${f.icon}`)),
    ]);
    const mark = document.createElement("canvas");
    mark.width = 540;
    mark.height = 612;
    mark.getContext("2d").drawImage(markImg, 0, 0, 540, 612, 0, 0, 540, 612);
    const icons = new Map(
      Object.values(FACES)
        .filter((f) => f.icon !== "tekcify")
        .map((f, i) => [f.icon, imgs[i]]),
    );
    try {
      await document.fonts.load(`600 40px ${family.split(",")[0]}`);
    } catch {}
    return { mark, icons, family };
  })());
}

export function paintFace(canvas, face, A) {
  const e = canvas.getContext("2d"),
    t = FACES[face],
    r = S;
  t.paint(e);
  const l = 22 * r,
    o = 136 * r,
    d = 66 * r; // logo plate: x, y, size
  if (t.icon === "tekcify") {
    // Tekcify card: white plate + tinted mark
    e.fillStyle = t.plate;
    e.beginPath();
    e.roundRect(l, o, d, d, 0.26 * d);
    e.fill();
    const h = 0.62 * d,
      w = (540 * h) / 612;
    e.drawImage(
      tint(A.mark, w, h, t.markInk),
      l + (d - w) / 2,
      o + (d - h) / 2,
      w,
      h,
    );
  } else e.drawImage(A.icons.get(t.icon), l, o, d, d); // app card: the app icon
  // vertical title along the right edge
  e.save();
  e.font = `600 ${46 * r}px ${A.family}`;
  if ("letterSpacing" in e) e.letterSpacing = `${-1 * r}px`;
  e.textBaseline = "alphabetic";
  const m = e.measureText(t.word);
  e.translate(W - 22 * r, 22 * r);
  e.rotate(Math.PI / 2);
  e.fillStyle = t.wordInk;
  e.fillText(t.word, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent);
  e.restore();
  // domain line bottom-left
  e.save();
  e.font = `600 ${11 * r}px ${A.family}`;
  if ("letterSpacing" in e) e.letterSpacing = `${1.6 * r}px`;
  e.fillStyle = t.micro;
  e.fillText(t.domain, 22 * r, 378 * r);
  e.restore();
  // small Tekcify mark bottom-right on app cards
  if (t.icon !== "tekcify") {
    const h = 15 * r,
      w = (540 * h) / 612;
    e.drawImage(
      tint(A.mark, w, h, t.micro),
      278 * r - w,
      378 * r - h + 0.8 * r,
      w,
      h,
    );
  }
}

/* ===================== scroll timeline ===================== */
// The pinned, scroll-scrubbed hero timeline from tekcify.com (GSAP + ScrollTrigger).
// Cards: scatter -> fan into an arc -> arc rotates -> a rounded "sky" panel expands to fullscreen -> blackout.
// Usage: const kill = initHeroScroll(sectionEl, gsap)   (register ScrollTrigger first)

// per card: intro (resting fan at the bottom) and scatter positions. [x, y, rotation]; x,y = fraction of viewport w/h from centre
export const CARDS = [
  { face: "ballast", intro: [-0.22, 0.41, -10], scatter: [-0.36, -0.05, -14] },
  { face: "plud", intro: [-0.11, 0.37, -5], scatter: [-0.31, -0.36, 10] },
  { face: "holo", intro: [0, 0.35, 0], scatter: [0.3, -0.37, -8] },
  { face: "dbdock", intro: [0.11, 0.37, 5], scatter: [-0.22, 0.36, 8] },
  { face: "fontroom", intro: [0.22, 0.41, 10], scatter: [0.28, 0.34, -10] },
  { face: "hushboard", intro: [0.33, 0.46, 15], scatter: [0.41, 0, 12] },
  { face: "skillmd", intro: [-0.33, 0.46, -15], scatter: [-0.45, 0.28, -18] },
];

export function initHeroScroll(root, gsap) {
  const q = gsap.utils.selector(root);
  const cards = q(".hero-card"),
    n = cards.length;
  const wrap = q(".hero-cards")[0],
    expand = q(".hero-expand")[0];
  const desktop = window.innerWidth >= 768;

  // fan geometry: cards sit on an arc of radius R around a pivot below the screen
  const geo = () => {
    const w = cards[0]?.offsetWidth ?? 200,
      R = root.clientHeight * (desktop ? 1.18 : 0.8);
    const pivotY =
      root.clientHeight * (desktop ? 0.6 : 0.62) +
      (4 * w) / 3 / 2 +
      R -
      root.clientHeight / 2;
    return { R, pivotY, spread: desktop ? 10.5 : 9 };
  };
  const arc = (i) => {
    const { R, pivotY, spread } = geo(),
      deg = (i - (n - 1) / 2) * spread,
      a = (deg * Math.PI) / 180;
    return { x: Math.sin(a) * R, y: pivotY - Math.cos(a) * R, r: deg };
  };
  const scatter = (i) => CARDS[i].scatter;

  // clip-path rectangle for the expanding sky panel (starts as a card-sized sliver)
  const rect = () => {
    const s = Math.min(
      window.innerWidth * (desktop ? 0.3 : 0.62),
      0.42 * root.clientHeight,
    );
    const L = ((window.innerWidth - s) / 2 / window.innerWidth) * 100,
      T = ((root.clientHeight - 1.3 * s) / 2 / root.clientHeight) * 100;
    return { L, Tp: T, Bp: T, rad: 0.075 * s };
  };
  const clip = { t: 100, r: 50, b: 0, l: 50, rad: 24 };
  const applyClip = () => {
    expand.style.clipPath = `inset(${clip.t}% ${clip.r}% ${clip.b}% ${clip.l}% round ${clip.rad}px)`;
  };
  const setPivot = () =>
    gsap.set(wrap, {
      transformOrigin: `50% ${50 + (geo().pivotY / root.clientHeight) * 100}%`,
    });
  const unblur = function () {
    gsap.set(this.targets(), { clearProps: "filter" });
  };

  setPivot();
  gsap.set(clip, {
    t: 100,
    b: 0,
    l: () => rect().L,
    r: () => rect().L,
    rad: () => rect().rad,
  });
  applyClip();
  gsap.set(q(".hero-copy .w, .hero-sky-text .w"), {
    opacity: 0,
    yPercent: 70,
    filter: "blur(8px)",
  });
  gsap.set(q(".hero-copy-sub, .hero-copy-cta"), { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onUpdate: () => {
      const t = tl.time();
      root.dataset.ndTheme = t > 10.35 ? "dark" : "light";
    },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => `+=${root.clientHeight * (desktop ? 6.2 : 5)}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: setPivot,
    },
  });

  tl.to(
    q(".hero-title"),
    {
      yPercent: -120,
      scale: 0.6,
      opacity: 0,
      filter: "blur(10px)",
      duration: 1.2,
      ease: "power2.in",
    },
    0,
  )
    .to(q(".hero-hint"), { opacity: 0, y: 20, duration: 0.4 }, 0)
    // 1) cards scatter outward
    .to(
      cards,
      {
        x: (i) => scatter(i)[0] * window.innerWidth,
        y: (i) => scatter(i)[1] * root.clientHeight,
        rotation: (i) => scatter(i)[2],
        scale: desktop ? 1.05 : 1,
        duration: 1.7,
        stagger: { each: 0.04, from: "center" },
        ease: "power3.out",
      },
      0.25,
    )
    // 2) headline words rise in
    .to(
      q(".hero-copy .w"),
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        onComplete: unblur,
      },
      1.3,
    )
    .to(
      q(".hero-copy-sub, .hero-copy-cta"),
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" },
      2.1,
    )
    .to(
      q(".hero-copy"),
      {
        y: () => -root.clientHeight * (desktop ? 0.18 : 0.15),
        duration: 1.3,
        ease: "power3.inOut",
      },
      2.7,
    )
    // 3) cards gather into a fan on an arc
    .to(
      cards,
      {
        x: (i) => arc(i).x,
        y: (i) => arc(i).y,
        rotation: (i) => arc(i).r,
        scale: 1,
        duration: 1.5,
        stagger: { each: 0.05, from: "edges" },
        ease: "power3.inOut",
      },
      2.7,
    )
    // 4) whole fan rotates, then sinks and fades
    .to(wrap, { rotation: -14, duration: 1.4, ease: "sine.inOut" }, 4.3)
    .fromTo(
      clip,
      {
        t: 100,
        b: 0,
        l: () => rect().L,
        r: () => rect().L,
        rad: () => rect().rad,
      },
      {
        t: () => rect().Tp,
        b: () => rect().Bp,
        duration: 0.9,
        ease: "power3.out",
        onUpdate: applyClip,
        immediateRender: false,
      },
      5.3,
    )
    .to(
      wrap,
      {
        y: () => 0.25 * root.clientHeight,
        opacity: 0.4,
        duration: 1.2,
        ease: "power2.in",
      },
      5.3,
    )
    // 5) sky panel grows to fullscreen
    .to(
      q(".hero-copy"),
      { scale: 0.94, opacity: 0, duration: 1, ease: "power2.in" },
      6,
    )
    .to(
      clip,
      {
        t: 0,
        r: 0,
        b: 0,
        l: 0,
        rad: 0,
        duration: 1,
        ease: "power3.inOut",
        onUpdate: applyClip,
      },
      6.2,
    )
    .to(
      q(".hero-sky-text .w"),
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        onComplete: unblur,
      },
      7.1,
    )
    // 6) fade to black
    .to(q(".hero-blackout"), { opacity: 1, duration: 0.5, ease: "none" }, 10.1);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}

/* ===================== component ===================== */

const Words = ({ text }: { text: string }) => (
  <>
    {text.split(" ").map((w, i) => {
      const mute = w.startsWith("~");
      return (
        <span key={i} className={`w${mute ? " tt-mute" : ""}`}>
          {w.replace(/~/g, "")}{" "}
        </span>
      );
    })}
  </>
);

/** Pinned scroll hero: cards scatter -> fan -> rotate -> sky panel expands -> blackout. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let kill: (() => void) | undefined,
      dead = false;
    loadAssets("/cards").then((A) => {
      if (dead) return;
      root
        .current!.querySelectorAll<HTMLCanvasElement>("canvas[data-face]")
        .forEach((c) => paintFace(c, c.dataset.face!, A));
      kill = initHeroScroll(root.current!, gsap);
    });
    return () => {
      dead = true;
      kill?.();
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <section ref={root} className="hero-stage" data-nd-theme="light">
        <div className="hero-title">
          <h1>We build solutions.</h1>
        </div>
        <div className="hero-hint">
          <span>Scroll</span>
          <i />
        </div>

        <div className="hero-copy">
          <h2>
            <Words text="~From~ a real problem ~to~ an app people ~actually~ use." />
          </h2>
          <p className="hero-copy-sub">
            We build for real people with real problems.
          </p>
        </div>

        <div className="hero-cards">
          {CARDS.map((k, i) => (
            <div
              key={k.face}
              className="hero-card"
              style={
                {
                  "--x": k.intro[0],
                  "--y": k.intro[1],
                  "--r": k.intro[2],
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  animation: `nd-card-rise .95s var(--nd-ease-spring) ${0.35 + 0.06 * i}s both`,
                }}
              >
                <div className="nd-card-wrap">
                  <canvas
                    className="nd-card"
                    width={600}
                    height={800}
                    data-face={k.face}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hero-expand">
          <div className="hero-sky-text">
            <p className="sky-a">
              <Words text="~Not just~ slides." />
            </p>
            <p className="sky-b">
              <Words text="~Real~ apps ~that~ run." />
            </p>
          </div>
        </div>
        <div className="hero-blackout" />
      </section>
    </>
  );
}
