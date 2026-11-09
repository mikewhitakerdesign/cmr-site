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
 * back of the shank. It is a technical outline, not a dissection.
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
const hip = P(300, 300);
const knee = P(262, 396);
const ankle = P(224, 480);
const farKnee = P(390, 282);
const farAnkle = P(372, 376);
const shoulder = P(344, 180);
const elbow = P(378, 244);
const hand = P(422, 212);
const farElbow = P(300, 238);
const farHand = P(300, 286);

const THIGH: Profile = [[-0.12, 24, 30], [0.1, 30, 29], [0.38, 28, 23], [0.62, 23.5, 19], [0.84, 18, 15], [0.97, 16, 13], [1.06, 14, 12]];
const SHANK: Profile = [[-0.06, 13.5, 13], [0.1, 11, 19], [0.28, 10, 22.5], [0.5, 8.5, 16], [0.75, 7, 9], [1.04, 7, 7.5]];
const UPPER_ARM: Profile = [[-0.08, 13, 12], [0.35, 11.5, 11], [0.8, 9, 9], [1.04, 8, 8]];
const FOREARM: Profile = [[-0.04, 8.5, 8.5], [0.3, 9, 8.5], [0.8, 6.5, 6], [1.0, 6, 5.5]];
const TORSO: Profile = [[-0.06, 25, 26], [0.15, 25, 25], [0.4, 22, 21], [0.62, 27, 23], [0.82, 28, 25], [0.97, 22, 22], [1.07, 11, 12]];

const thigh = limb(hip, knee, THIGH, -1);
const shank = limb(knee, ankle, SHANK, -1);
const farThigh = limb(hip, farKnee, THIGH, -1);
const farShank = limb(farKnee, farAnkle, SHANK, -1);
const upperArm = limb(shoulder, elbow, UPPER_ARM, 1);
const forearm = limb(elbow, hand, FOREARM, 1);
const farUpperArm = limb(shoulder, farElbow, UPPER_ARM, 1);
const farForearm = limb(farElbow, farHand, FOREARM, 1);
const torso = limb(hip, shoulder, TORSO, 1);

const buttock = smooth([P(296, 268), P(275, 276), P(262, 298), P(262, 322), P(275, 337), P(293, 336), P(305, 318), P(307, 290)]);
const foot = smooth([P(210, 488), P(216, 472), P(234, 470), P(252, 488), P(276, 500), P(279, 508), P(256, 510), P(230, 501)]);
const farFoot = smooth([P(358, 388), P(364, 368), P(382, 372), P(410, 384), P(412, 393), P(390, 395), P(368, 395)]);
// Head in profile, facing right: crown, brow, nose, lips, chin, jaw, nape.
const head = smooth([P(354, 90), P(372, 84), P(390, 94), P(396, 108), P(400, 120), P(396, 124), P(397, 132), P(392, 140), P(380, 147), P(366, 146), P(354, 138), P(347, 122), P(347, 104)]);
const neck = smooth([P(352, 132), P(372, 142), P(372, 166), P(356, 176), P(338, 168)]);

export const RUNNER = {
  /** Near side of the body, drawn as one silhouette (stroke under, fill over). */
  body: [outline(torso), buttock, neck, head, outline(thigh), outline(shank), foot],
  /** The far leg and far arm, drawn in gray behind the body. */
  farLeg: [outline(farThigh), outline(farShank), farFoot],
  farArm: [outline(farUpperArm), outline(farForearm)],
  /** The near arm, drawn over the trunk as its own silhouette. */
  nearArm: [outline(upperArm), outline(forearm)],
  ear: "M366 116 C370 112 375 116 373 122 C372 127 367 127 365 124",
  muscles: {
    gluteus: smooth([P(296, 275), P(279, 283), P(269, 301), P(270, 320), P(281, 331), P(296, 325), P(303, 303)]),
    quadriceps: belly(thigh, "anterior", 0.06, 0.93, -0.15, 0.9),
    calf: belly(shank, "posterior", 0.04, 0.66, -0.2, 0.92),
  },
  /** Leader-line anchors (on each muscle) for the labels. */
  anchors: { gluteus: P(278, 302), quadriceps: P(292, 352), calf: P(226, 420) },
  /** The ground: the 10° slope through the push-off foot. */
  ground: { x1: 30, y1: 509 + (262 - 30) * 0.176, x2: 530, y2: 509 - (530 - 262) * 0.176 },
};
