/**
 * Geometry for the Physiology figure: a runner in side view, pushing off up an
 * incline. Pure functions run once at module load; the component only prints
 * the resulting path strings (no client JS).
 *
 * Method: a skeleton (joint positions for a late-stance push-off with the other
 * knee driven forward and the trunk leaning into the slope, in adult
 * proportions: thigh ≈ shank ≈ ¼ of standing height) and, for each segment, a
 * profile of anterior and posterior half-widths along its length (the convex
 * front of the quadriceps, the hamstrings behind, the calf bulge high on the
 * back of the shank, the flatter shin). Outlines are smoothed with
 * Catmull-Rom splines. The muscle overlays are bands inside those same
 * profiles, so they sit where the muscles are: gluteus maximus behind the hip,
 * quadriceps along the front of the thigh, gastrocnemius and soleus on the
 * back of the shank. Rendered as a solid silhouette (Owner direction,
 * 2026-11-09: a simple, credible silhouette over a detailed drawing).
 */
type Pt = { x: number; y: number };
const P = (x: number, y: number): Pt => ({ x, y });
const sub = (a: Pt, b: Pt) => P(a.x - b.x, a.y - b.y);
const add = (a: Pt, b: Pt) => P(a.x + b.x, a.y + b.y);
const mul = (a: Pt, k: number) => P(a.x * k, a.y * k);
const len = (a: Pt) => Math.hypot(a.x, a.y);
const unit = (a: Pt) => mul(a, 1 / len(a));
const f = (n: number) => n.toFixed(1);

/** Closed Catmull-Rom spline through the points, as cubic Béziers. */
function smooth(pts: Pt[]): string {
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n];
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6));
    const c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return `${d} Z`;
}

/** [t along the segment, anterior half-width, posterior half-width] */
type Profile = [number, number, number][];
type Limb = { a: Pt; u: Pt; n: Pt; L: number; prof: Profile };

/** `front`: +1 when the anterior side is to the left of the a→b direction on screen, −1 when to the right. */
function limb(a: Pt, b: Pt, prof: Profile, front: 1 | -1): Limb {
  const u = unit(sub(b, a));
  return { a, u, n: mul(P(-u.y, u.x), front), L: len(sub(b, a)), prof };
}

function width(prof: Profile, t: number, side: 1 | 2): number {
  for (let i = 0; i < prof.length - 1; i++) {
    if (t >= prof[i][0] && t <= prof[i + 1][0]) {
      const k = (t - prof[i][0]) / (prof[i + 1][0] - prof[i][0]);
      return prof[i][side] + (prof[i + 1][side] - prof[i][side]) * k;
    }
  }
  return prof[prof.length - 1][side];
}

function outline(l: Limb): string {
  const front = l.prof.map(([t, wa]) => add(add(l.a, mul(l.u, t * l.L)), mul(l.n, wa)));
  const back = l.prof.map(([t, , wp]) => add(add(l.a, mul(l.u, t * l.L)), mul(l.n, -wp)));
  return smooth([...front, ...back.reverse()]);
}

/**
 * A muscle belly inside a limb on one side: from `inner` (fraction of that
 * side's width; negative crosses the midline) to `outer`, tapering at both ends.
 */
function belly(l: Limb, side: "anterior" | "posterior", t0: number, t1: number, inner: number, outer: number): string {
  const s = side === "anterior" ? 1 : -1;
  const k = side === "anterior" ? 1 : 2;
  const edge: Pt[] = [];
  const core: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = t0 + ((t1 - t0) * i) / 10;
    const w = width(l.prof, t, k as 1 | 2);
    const swell = Math.sin((Math.PI * i) / 10);
    const c = add(l.a, mul(l.u, t * l.L));
    edge.push(add(c, mul(l.n, s * w * (inner + (outer - inner) * (0.2 + 0.8 * swell)))));
    core.push(add(c, mul(l.n, s * w * inner)));
  }
  return smooth([...edge, ...core.reverse()]);
}

// Skeleton, in the figure's coordinates (facing right; the slope rises to the right at 10°).
// Late stance on an incline: the trailing leg nearly extended at push-off, the
// other thigh swung forward to about 15° below horizontal with the shank hanging
// under the knee, the trunk leaning ≈ 20° into the hill, arms bent ≈ 90° and
// swinging opposite the legs.
const hip = P(300, 300);
const knee = P(262, 396);
const ankle = P(226, 482);
const farKnee = P(398, 328);
const farAnkle = P(378, 420);
const shoulder = P(342, 182);
const elbow = P(366, 250);
const hand = P(414, 236);
const farElbow = P(302, 244);
const farHand = P(326, 290);

const THIGH: Profile = [[-0.12, 26, 31], [0.1, 29, 29], [0.38, 27, 22.5], [0.62, 22.5, 18.5], [0.84, 17.5, 14.5], [0.97, 15.5, 12.5], [1.06, 13.5, 11.5]];
const SHANK: Profile = [[-0.06, 13, 12.5], [0.1, 11, 18.5], [0.28, 10, 21.5], [0.5, 8.5, 15.5], [0.75, 7, 8.5], [1.04, 6.5, 7]];
const UPPER_ARM: Profile = [[-0.1, 13, 12], [0.35, 11.5, 11], [0.8, 9, 8.5], [1.04, 8, 7.5]];
const FOREARM: Profile = [[-0.04, 8.5, 8], [0.3, 8.5, 8], [0.8, 6.5, 6], [1.06, 6.5, 6]];
const TORSO: Profile = [[0.0, 24, 25], [0.12, 25, 26], [0.4, 22.5, 22], [0.62, 26, 23], [0.82, 27.5, 25], [0.97, 22, 22], [1.08, 10, 11]];

const thigh = limb(hip, knee, THIGH, -1);
const shank = limb(knee, ankle, SHANK, -1);
const farThigh = limb(hip, farKnee, THIGH, -1);
const farShank = limb(farKnee, farAnkle, SHANK, -1);
const upperArm = limb(shoulder, elbow, UPPER_ARM, 1);
const forearm = limb(elbow, hand, FOREARM, 1);
const farUpperArm = limb(shoulder, farElbow, UPPER_ARM, 1);
const farForearm = limb(farElbow, farHand, FOREARM, 1);
const torso = limb(hip, shoulder, TORSO, 1);

// Pelvis and buttock (gluteus maximus mass), blending trunk and thighs at the hip.
const pelvis = smooth([P(276, 282), P(300, 270), P(326, 280), P(334, 304), P(322, 326), P(298, 332), P(278, 322), P(272, 302)]);
const buttock = smooth([P(301, 272), P(284, 280), P(269, 297), P(268, 318), P(280, 333), P(298, 332), P(308, 312), P(308, 288)]);
// Trailing foot at push-off: heel up, ball of the foot on the slope.
const foot = smooth([P(212, 492), P(216, 476), P(234, 474), P(254, 490), P(276, 500), P(280, 507), P(258, 510), P(232, 502)]);
// Swinging foot, toes up (dorsiflexed), under the knee.
const farFoot = smooth([P(364, 430), P(368, 412), P(386, 414), P(410, 424), P(412, 432), P(392, 436), P(372, 435)]);
// Head in profile, facing right, carried in line with the trunk; short neck.
const head = smooth([P(352, 100), P(370, 92), P(388, 100), P(396, 114), P(399, 126), P(396, 130), P(396, 138), P(390, 146), P(378, 152), P(364, 151), P(352, 143), P(346, 128), P(346, 112)]);
const neck = smooth([P(352, 140), P(368, 148), P(366, 172), P(352, 180), P(341, 172)]);
const hand1 = smooth([P(404, 228), P(418, 226), P(424, 236), P(418, 246), P(404, 244)]);
const hand2 = smooth([P(318, 284), P(332, 282), P(336, 292), P(328, 300), P(316, 296)]);

export const RUNNER = {
  /** The near side of the body: one solid silhouette. */
  body: [outline(torso), pelvis, buttock, neck, head, outline(thigh), outline(shank), foot, outline(upperArm), outline(forearm), hand1],
  /** The far leg and arm, in a lighter tone behind. */
  far: [outline(farUpperArm), outline(farForearm), hand2, outline(farThigh), outline(farShank), farFoot],
  /** Muscle groups on the pushing (near) leg, as patches inside the silhouette. */
  muscles: {
    gluteus: smooth([P(293, 279), P(281, 287), P(275, 302), P(278, 318), P(288, 325), P(298, 316), P(300, 296)]),
    quadriceps: belly(thigh, "anterior", 0.1, 0.9, 0.05, 0.82),
    calf: belly(shank, "posterior", 0.06, 0.62, 0.05, 0.85),
  },
  /** Where each numbered marker sits (on its patch). */
  markers: { gluteus: P(287, 303), quadriceps: P(292, 356), calf: P(233, 420) },
  /** The ground: the 10° slope through the push-off foot. */
  ground: { x1: 120, y1: 509 + (262 - 120) * 0.176, x2: 500, y2: 509 - (500 - 262) * 0.176 },
};
