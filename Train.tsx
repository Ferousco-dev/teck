"use client";
// @ts-nocheck
/**
 * Train.tsx: the "Draw a line." section in ONE file (canvas train + wrapper + styles).
 * Needs:  public/icons/{plud,dbdock,fontroom,skillmd,hushboard,ballast}.png
 * Usage:  import Train from "./Train";   <Train />   (move the mouse inside the box)
 */
import { useEffect, useRef } from "react";

const CSS = `:root { --nd-brand: #5a31b2; --nd-brand-hover: #4f2aa1; --nd-ink: #141414; --nd-paper: #eee; --nd-gutter: clamp(1rem, 3vw, 2.5rem); }
.draw-a-line { background: var(--nd-paper); padding: 0 var(--nd-gutter) 6rem; display: none; }
/* only for devices with a real mouse and motion allowed, same gate as the original */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) { .draw-a-line { display: block; } }
.draw-box { position: relative; max-width: 80rem; margin: 0 auto; height: min(68vh, 620px); overflow: hidden; border-radius: 1.75rem; background: #fff; box-shadow: 0 0 0 1px rgb(0 0 0 / .06); }
.draw-box canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.draw-copy { position: relative; z-index: 10; pointer-events: none; display: flex; flex-direction: column; gap: .75rem; padding: 2.5rem; }
.draw-copy h2 { margin: 0; font: 600 clamp(2.2rem, 4.6vw, 4rem) / 1 system-ui; letter-spacing: -.04em; }
.draw-copy h2 span { color: #999; }
.draw-copy p { margin: 0; max-width: 20rem; font-size: .95rem; line-height: 1.6; color: #525252; }
`;

/* ===================== train engine ===================== */

/* ---- path buffer helpers ---------------------------------------------
 a()        new path {xs[], ys[], s[]}      (s = cumulative distance)
 l(p,x,y)   append a point (skips moves < 4px)
 s(p,d)     binary search segment at distance d
 o(p,d,out) point at distance d
 m(p,d,span) heading angle at distance d
 ------------------------------------------------------------------------ */
function a() {
  return { xs: [], ys: [], s: [] };
}
let n = (e) => (e.s.length ? e.s[e.s.length - 1] : 0),
  i = (e) => (e.s.length ? e.s[0] : 0);
function l(e, t, r, a = 4) {
  let n = e.s.length;
  if (0 === n) return (e.xs.push(t), e.ys.push(r), e.s.push(0), !0);
  let i = Math.hypot(t - e.xs[n - 1], r - e.ys[n - 1]);
  return !(i < a) && (e.xs.push(t), e.ys.push(r), e.s.push(e.s[n - 1] + i), !0);
}
function s(e, t) {
  let r = 0,
    a = e.s.length - 1;
  for (; a - r > 1;) {
    let n = (r + a) >> 1;
    e.s[n] <= t ? (r = n) : (a = n);
  }
  return r;
}
function o(e, t, r) {
  let a = e.s.length;
  if (0 === a) return ((r.x = 0), (r.y = 0), r);
  if (1 === a || t <= e.s[0]) return ((r.x = e.xs[0]), (r.y = e.ys[0]), r);
  if (t >= e.s[a - 1]) return ((r.x = e.xs[a - 1]), (r.y = e.ys[a - 1]), r);
  let n = s(e, t),
    i = (t - e.s[n]) / (e.s[n + 1] - e.s[n]);
  return (
    (r.x = e.xs[n] + (e.xs[n + 1] - e.xs[n]) * i),
    (r.y = e.ys[n] + (e.ys[n + 1] - e.ys[n]) * i),
    r
  );
}
let d = { x: 0, y: 0 },
  c = { x: 0, y: 0 };
function m(e, t, r = 8) {
  let a = Math.max(i(e), t - r),
    l = Math.min(n(e), t + r);
  return (o(e, a, d), o(e, l, c), c.x === d.x && c.y === d.y)
    ? 0
    : Math.atan2(c.y - d.y, c.x - d.x);
}
function u(e, t, r) {
  return Math.max(r, e.s - 47 * t);
}

function RailTrain({
  tone: e = "light",
  icons: b,
}: {
  tone?: "light" | "dark";
  icons: { src: string }[];
}) {
  let d = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let t = d.current,
      r = t?.parentElement;
    if (
      !t ||
      !r ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let c = t.getContext("2d");
    if (!c) return;
    let p = getComputedStyle(r),
      h = p.getPropertyValue("--nd-brand").trim() || "#5a31b2",
      f = p.getPropertyValue("--nd-brand-hover").trim() || "#4f2aa1",
      x = "dark" === e,
      g = x ? "#ffffff" : p.getPropertyValue("--nd-ink").trim() || "#141414",
      y = x ? "rgba(255,255,255,0.8)" : "rgba(20,20,20,0.78)",
      v = x ? "rgba(255,255,255,0.3)" : "rgba(20,20,20,0.22)",
      w = "#f4f1fb",
      j = 1,
      M = 0,
      k = 0,
      N = () => {
        ((j = Math.min(2, window.devicePixelRatio || 1)),
          (M = r.clientWidth),
          (k = r.clientHeight),
          (t.width = Math.round(M * j)),
          (t.height = Math.round(k * j)),
          G || J(performance.now()));
      },
      P = { x: 0, y: 0, inside: !1 },
      T = { x: 0, y: 0 },
      _ = a(),
      S = { s: 0, v: 0, a: 0 },
      R = "idle",
      E = 0,
      O = 0,
      A = 0,
      $ = 1,
      q = Array.from({ length: 3 }, () => ({ y: 0, vy: 0, delay: -1 })),
      W = [],
      C = 0,
      L = 0,
      F = b.map((e) => {
        let t = new Image();
        return ((t.decoding = "async"), (t.src = e.src), t);
      }),
      I = (e) => e.complete && e.naturalWidth > 0,
      z = performance.now() + 2500,
      H = { x: -1e4, y: -1e4 },
      B = { x: 0, y: 0, ux: 0, uy: -1, dx: 1, dy: 0 },
      U = { x: 0, y: 0 },
      D = (e) => {
        q.forEach((t, r) => {
          ((t.delay = 0.07 * r), (t.vy = -e * (1 - 0.12 * r)));
        });
      },
      Y = (e) => {
        W.length > 24 && W.shift();
        let t = (Math.random() - 0.5) * (e ? 80 : 16);
        W.push({
          x: B.x,
          y: B.y,
          vx: B.ux * (e ? 80 : 46) - B.dx * S.v * 0.1 + t,
          vy: B.uy * (e ? 80 : 46) - B.dy * S.v * 0.1 + 0.3 * t,
          age: 0,
          life: e ? 1.8 : 1.6,
          app: L++ % b.length,
          rot: (Math.random() - 0.5) * 0.5,
          spin: (Math.random() - 0.5) * 0.8,
        });
      },
      G = 0,
      V = 0,
      X = () => {
        G || ((V = performance.now()), (G = requestAnimationFrame(K)));
      },
      K = (e) => {
        G = 0;
        let t = Math.min(0.05, Math.max(0.001, (e - V) / 1e3));
        if (((V = e), P.inside && "idle" !== R)) {
          let e = 1 - Math.exp(-((t / 4) * 18));
          for (let t = 0; t < 4; t++)
            ((T.x += (P.x - T.x) * e),
              (T.y += (P.y - T.y) * e),
              l(_, T.x, T.y, 3));
        }
        if ("idle" !== R) {
          var r;
          let l = n(_);
          if (
            (!(function (e, t, r) {
              if (!(r > 0)) return;
              let a = t - e.s,
                n = e.v,
                i = Math.max(
                  0,
                  n + ((a > 0 ? Math.min(2600, 140 + 0.4 * a) : 0) - n) * r,
                );
              i = Math.min(i, Math.sqrt(2400 * Math.max(0, a)), 1500);
              let l = e.s + i * r;
              (l >= t && ((l = Math.max(e.s, t)), (i = 0)),
                (e.s = l),
                (e.v = i),
                (e.a = (i - n) / r));
            })(S, P.inside ? l - 42 : l, t),
            (O = Math.max(O, Math.max((r = i(_)), u(S, 2, r) - 14))),
            !(function (e, t) {
              if (e.s.length < 3 || e.s[1] > t) return;
              let r = s(e, t);
              (r < 32 && r < e.s.length - 2) ||
                (e.xs.splice(0, r), e.ys.splice(0, r), e.s.splice(0, r));
            })(_, O - 30),
            !P.inside && "run" === R && 0 === S.v && S.s >= l - 0.5)
          ) {
            ((R = "park"), (E = e), D(260));
            for (let e = 0; e < b.length; e++) Y(!0);
          }
          "park" === R && e - E > 1300 && (R = "gone");
          let o = 1 - Math.exp(-t * ("gone" === R ? 9 : 12));
          ((A += (("gone" !== R) - A) * o),
            "gone" === R && A < 0.02 && ((R = "idle"), (_ = a()), (W = [])));
        }
        for (let e of q) {
          if (e.delay >= 0) {
            ((e.delay -= t), e.delay < 0 && (e.y += e.vy * t));
            continue;
          }
          (0 !== e.y || 0 !== e.vy) &&
            ((e.vy += 2e3 * t),
            (e.y += e.vy * t),
            e.y > 0 &&
              ((e.y = 0), (e.vy = Math.abs(e.vy) > 90 ? -(0.3 * e.vy) : 0)));
        }
        if ("run" === R && S.v > 20)
          for (C += t * Math.min(2.6, 0.9 + S.v / 600); C >= 1;)
            (Y(!1), (C -= 1));
        for (let e of (W = W.filter((e) => (e.age += t) < e.life)))
          ((e.vx *= 1 - 1.6 * t),
            (e.vy = e.vy * (1 - 1.6 * t) - 26 * t),
            (e.x += e.vx * t),
            (e.y += e.vy * t),
            (e.rot += e.spin * t));
        (J(e),
          "idle" === R ||
            ("run" === R &&
              0 === S.v &&
              0 === W.length &&
              q.every((e) => 0 === e.y && 0 === e.vy && e.delay < 0) &&
              0.01 > Math.abs(Math.abs($) - 1) &&
              0.005 > Math.abs(A - 1) &&
              0.5 > Math.hypot(P.x - T.x, P.y - T.y)) ||
            (G = requestAnimationFrame(K)));
      },
      J = (e) => {
        if (
          (c.setTransform(1, 0, 0, 1, 0, 0),
          c.clearRect(0, 0, t.width, t.height),
          "idle" === R)
        )
          return;
        c.setTransform(j, 0, 0, j, 0, 0);
        let r = Math.min(1, 1.4 * A);
        c.globalAlpha = r;
        let a = Math.max(O, i(_)),
          l = n(_);
        ((c.strokeStyle = v),
          (c.lineCap = "round"),
          (c.lineWidth = 4),
          c.beginPath());
        for (let e = 15 * Math.ceil(a / 15); e <= l; e += 15) {
          let t = Math.min(1, (l - e) / 18 + 0.15, (e - O) / 22);
          if (t <= 0) continue;
          o(_, e, U);
          let r = m(_, e) + Math.PI / 2,
            a = 12 * t;
          (c.moveTo(U.x - Math.cos(r) * a, U.y - Math.sin(r) * a),
            c.lineTo(U.x + Math.cos(r) * a, U.y + Math.sin(r) * a));
        }
        for (let e of (c.stroke(),
        (c.strokeStyle = y),
        (c.lineWidth = 2.2),
        (c.lineJoin = "round"),
        [-1, 1])) {
          c.beginPath();
          let t = !0;
          for (let r = a; ; r = Math.min(l, r + 5)) {
            o(_, r, U);
            let a = m(_, r) + Math.PI / 2,
              n = U.x + 7 * Math.cos(a) * e,
              i = U.y + 7 * Math.sin(a) * e;
            if ((t ? c.moveTo(n, i) : c.lineTo(n, i), (t = !1), r >= l)) break;
          }
          c.stroke();
        }
        for (let e of W) {
          let t = F[e.app];
          if (!I(t)) continue;
          let a = e.age / e.life,
            n = 14 + 20 * Math.sqrt(a);
          (c.save(),
            (c.globalAlpha = 0.55 * r * Math.min(1, a / 0.12) * (1 - a * a)),
            c.translate(e.x, e.y),
            c.rotate(e.rot),
            c.beginPath(),
            c.roundRect(-n / 2, -n / 2, n, n, 0.225 * n),
            c.clip(),
            c.drawImage(t, -n / 2, -n / 2, n, n),
            c.restore());
        }
        let s = e > z;
        e > z + 130 && (z = e + 2200 + 2600 * Math.random());
        let d = "park" === R || "gone" === R,
          p = 1 + Math.max(-0.07, Math.min(0.09, S.a / 16e3)),
          h = Math.cos(m(_, S.s, 10)),
          f = h > 0.25 ? 1 : h < -0.25 ? -1 : Math.sign($) || 1;
        (($ += (f - $) * 0.18), 0.005 > Math.abs(f - $) && ($ = f));
        for (let t = 2; t >= 0; t--) {
          let r = u(S, t, i(_));
          o(_, r, U);
          let a = m(_, r, 10),
            n = Math.max(
              -0.3,
              Math.min(
                0.3,
                S.v *
                  S.v *
                  (function (e, t, r = 12) {
                    let a = m(e, t + r, r) - m(e, t - r, r);
                    return (a = Math.atan2(Math.sin(a), Math.cos(a))) / (2 * r);
                  })(_, r) *
                  4e-6,
              ),
            ),
            l = Math.abs(Math.sin((r + 9 * t) / 13)) * Math.min(2.4, S.v / 420);
          (c.save(),
            c.translate(U.x, U.y),
            c.rotate(a),
            c.scale(1.25 * A * p, ((1.25 * A) / p) * $),
            c.rotate(-n * Math.sign($)),
            c.translate(0, -l + q[t].y));
          let h = r / 5.5;
          (0 === t ? ee(h, s, d) : et(h, t, e), c.restore());
        }
        c.globalAlpha = 1;
      },
      Q = (e, t, r) => {
        ((c.fillStyle = g),
          c.beginPath(),
          c.arc(e, -t + 1, t, 0, 2 * Math.PI),
          c.fill(),
          (c.strokeStyle = w),
          (c.lineWidth = 1.3),
          c.beginPath(),
          c.moveTo(e, -t + 1),
          c.lineTo(
            e + Math.cos(r) * (t - 1.5),
            -t + 1 + Math.sin(r) * (t - 1.5),
          ),
          c.stroke(),
          (c.fillStyle = w),
          c.beginPath(),
          c.arc(e, -t + 1, 1.4, 0, 2 * Math.PI),
          c.fill());
      },
      Z = (e, t, r, a, n, i) => {
        ((c.fillStyle = i),
          c.beginPath(),
          c.roundRect(e, t, r, a, n),
          c.fill());
      },
      ee = (e, t, r) => {
        let a = c.getTransform(),
          n = new DOMPoint(9.5, -36).matrixTransform(a),
          i = new DOMPoint(9.5, -26).matrixTransform(a),
          l = new DOMPoint(20, -12).matrixTransform(a),
          s = new DOMPoint(-20, -12).matrixTransform(a);
        ((B.x = n.x / j), (B.y = n.y / j));
        let o = Math.hypot(n.x - i.x, n.y - i.y) || 1;
        ((B.ux = (n.x - i.x) / o), (B.uy = (n.y - i.y) / o));
        let d = Math.hypot(l.x - s.x, l.y - s.y) || 1;
        ((B.dx = (l.x - s.x) / d),
          (B.dy = (l.y - s.y) / d),
          (H.x = (l.x + s.x) / 2 / j),
          (H.y = (l.y + s.y) / 2 / j),
          Z(-25, -9, 47, 5, 2, g),
          (c.fillStyle = g),
          c.beginPath(),
          c.moveTo(21, -8),
          c.lineTo(28, -1),
          c.lineTo(21, -1),
          c.closePath(),
          c.fill(),
          Z(-12, -24, 33, 16, 8, h),
          Z(6, -33, 7, 10, 1.5, f),
          Z(3.5, -37, 12, 5, 2, g),
          (c.fillStyle = f),
          c.beginPath(),
          c.arc(-2, -24, 4.2, Math.PI, 0),
          c.fill(),
          Z(-27, -34, 19, 26, 4, f),
          Z(-29.5, -37, 24, 4.5, 2, g),
          Z(-23.5, -30, 11, 8, 2, w),
          (c.fillStyle = w),
          c.beginPath(),
          c.arc(17, -16, 9, 0, 2 * Math.PI),
          c.fill());
        let m = a.inverse().transformPoint(new DOMPoint(P.x * j, P.y * j));
        for (let e of [13.6, 20.4]) {
          if (
            ((c.fillStyle = "#ffffff"),
            (c.strokeStyle = g),
            (c.lineWidth = 1),
            c.beginPath(),
            r)
          ) {
            (c.arc(e, -17, 2.6, 1.1 * Math.PI, 1.9 * Math.PI), c.stroke());
            continue;
          }
          if (
            (c.ellipse(e, -18.5, 3.2, t ? 0.6 : 3.4, 0, 0, 2 * Math.PI),
            c.fill(),
            c.stroke(),
            t)
          )
            continue;
          let a = m.x - e,
            n = m.y - -18.5,
            i = Math.hypot(a, n) || 1;
          ((c.fillStyle = g),
            c.beginPath(),
            c.arc(
              e + (a / i) * 1.5,
              -18.5 + (n / i) * 1.6,
              1.6,
              0,
              2 * Math.PI,
            ),
            c.fill());
        }
        for (let t of ((c.strokeStyle = g),
        (c.lineWidth = 1.3),
        c.beginPath(),
        c.arc(17, -13, r ? 4.2 : 3.4, 0.15 * Math.PI, 0.85 * Math.PI),
        c.stroke(),
        [-18, -5, 8]))
          Q(t, 5.5, e);
        ((c.strokeStyle = w),
          (c.lineWidth = 1.6),
          c.beginPath(),
          c.moveTo(-18 + 3 * Math.cos(e), -4.5 + 3 * Math.sin(e)),
          c.lineTo(8 + 3 * Math.cos(e), -4.5 + 3 * Math.sin(e)),
          c.stroke());
      },
      et = (e, t, r) => {
        (Z(-17, -9, 34, 5, 2, g),
          (c.strokeStyle = g),
          (c.lineWidth = 1.6),
          c.beginPath(),
          c.moveTo(-21, -6.5),
          c.lineTo(-17, -6.5),
          c.moveTo(17, -6.5),
          c.lineTo(21, -6.5),
          c.stroke());
        let a = F[(t - 1) % b.length];
        if (I(a)) {
          let e = Math.min(1.6, S.v / 500);
          (c.save(),
            c.translate(0, -27 + Math.sin(r / 90 + 1.7 * t) * e),
            $ < 0 && c.scale(-1, 1),
            c.rotate(0.06 * Math.sin(r / 160 + t) * Math.min(1, S.v / 300)),
            c.beginPath(),
            c.roundRect(-9, -9, 18, 18, 4),
            c.clip(),
            c.drawImage(a, -9, -9, 18, 18),
            c.restore());
        }
        for (let r of (Z(-15, -22, 30, 14, 4, t % 2 ? w : h),
        (c.strokeStyle = h),
        (c.lineWidth = 1.4),
        c.beginPath(),
        c.roundRect(-15, -22, 30, 14, 4),
        c.stroke(),
        [-9, 9]))
          Q(r, 5, e);
      },
      er = (e) => {
        let t = r.getBoundingClientRect();
        ((P.x = e.clientX - t.left), (P.y = e.clientY - t.top));
      },
      ea = (e) => {
        if ("mouse" === e.pointerType) {
          if ((er(e), (P.inside = !0), "idle" === R)) {
            var t, r;
            ((t = P.x),
              (r = P.y),
              l((_ = a()), t, r),
              (T.x = t),
              (T.y = r),
              (S.s = 0),
              (S.v = 0),
              (S.a = 0),
              (O = 0),
              (A = 0),
              (W = []),
              ($ = 1),
              (R = "run"));
          } else "run" !== R && (R = "run");
          X();
        }
      },
      en = (e) => {
        "mouse" === e.pointerType && ((P.inside = !1), X());
      },
      ei = (e) => {
        if (
          "mouse" === e.pointerType &&
          "idle" !== R &&
          (er(e), !(Math.hypot(P.x - H.x, P.y - H.y) > 40))
        ) {
          D(420);
          for (let e = 0; e < 2; e++) Y(!0);
          X();
        }
      };
    (r.addEventListener("pointermove", ea, { passive: !0 }),
      r.addEventListener("pointerleave", en, { passive: !0 }),
      r.addEventListener("pointerdown", ei, { passive: !0 }));
    let el = new ResizeObserver(N);
    return (
      el.observe(r),
      N(),
      () => {
        (cancelAnimationFrame(G),
          el.disconnect(),
          r.removeEventListener("pointermove", ea),
          r.removeEventListener("pointerleave", en),
          r.removeEventListener("pointerdown", ei));
      }
    );
  }, [e]);
  return (
    <canvas
      ref={d}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

/* ===================== section ===================== */

// Icons the train puffs out of its chimney (files live in /public/icons)
const ICONS = [
  "plud",
  "dbdock",
  "fontroom",
  "skillmd",
  "hushboard",
  "ballast",
].map((n) => ({ src: `/icons/${n}.png` }));

/** "Draw a line." section. The canvas listens on its parent, so keep `relative` + fixed height. */
export default function Train() {
  return (
    <>
      <style>{CSS}</style>
      <section id="play" className="draw-a-line">
        <div className="draw-box">
          <RailTrain tone="light" icons={ICONS} />
          <div className="draw-copy">
            <h2>
              Draw a <span>line.</span>
            </h2>
            <p>
              Lay track with your cursor. The train hauls our apps along it,
              puffing them out as it goes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
