// Shake and fall detection over accelerometer samples in g (expo-sensors
// reports g on every platform). Pure and clock-free: the caller passes each
// sample's time, so the detectors are tested without a device.
//
// Both only ever START the countdown, so a false positive costs a cancel,
// never an alert. Thresholds are deliberately conservative.

export type Sample = { x: number; y: number; z: number; t: number };

const magnitude = (s: Sample) => Math.hypot(s.x, s.y, s.z);

/** Three hard jolts (over 2.2 g, at least 150 ms apart) inside 1.5 s.
 *  Walking and running stay under about 2 g. */
export function shakeDetector({ threshold = 2.2, peaks = 3, windowMs = 1500, gapMs = 150 } = {}) {
  let hits: number[] = [];
  return (s: Sample): boolean => {
    if (magnitude(s) < threshold) return false;
    const last = hits[hits.length - 1];
    if (last !== undefined && s.t - last < gapMs) return false;
    hits = [...hits.filter((t) => s.t - t <= windowMs), s.t];
    if (hits.length < peaks) return false;
    hits = [];
    return true;
  };
}

/** Free fall (under 0.35 g for at least 80 ms, roughly a 3 cm drop or more)
 *  followed within a second by an impact over 2.8 g. A hard bump without
 *  the free fall, or a drop onto a sofa, does not count. */
export function fallDetector({ freeFall = 0.35, freeFallMs = 80, impact = 2.8, withinMs = 1000 } = {}) {
  let fallStart: number | null = null;
  let fellAt: number | null = null;
  return (s: Sample): boolean => {
    const m = magnitude(s);
    if (m < freeFall) {
      fallStart ??= s.t;
      if (s.t - fallStart >= freeFallMs) fellAt = s.t;
      return false;
    }
    fallStart = null;
    if (fellAt !== null && s.t - fellAt > withinMs) fellAt = null;
    if (fellAt === null || m < impact) return false;
    fellAt = null;
    return true;
  };
}
