// Scene "The vault": password stretch, wrapped keys, sealed file, lock and reopen. VaultDiagram.astro
// draws the final picture; here every step's group (`data-part`) is hidden at start and revealed by
// `go(i)`: parts 0..i shown, the rest hidden, forward or backward. One-shot animations only (no loops),
// and only opacity, transform and stroke-dashoffset. Parts animate independently, so a later step can
// start while an earlier one is still finishing; going back fades the part out and puts it back to
// its hidden state.
import type { MotionApi, SceneFactory } from "./types";
import { cssMs } from "../motion/css";
import { parseBezier, planParts, timesOf, type PartState } from "./vault-pure";

type Fx = "fade" | "rise" | "drop" | "slide" | "trace" | "row";

/** One piece of a step: which `data-el`, how it appears, when (ms from the step start) and for how long. */
interface Beat {
  el: string;
  fx: Fx;
  at: number;
  dur: number;
  /** Delay between the elements sharing the same `data-el`. */
  each?: number;
}

interface PartPlan {
  name: string;
  beats: Beat[];
  /** Extra animations (keyframes on elements that also have a resting state in CSS). */
  extra?: (add: (controls: Controls) => void, delay: number) => void;
  /** Restores the resting state of the elements `extra` animates. */
  clear?: () => void;
}

type Controls = ReturnType<MotionApi["animate"]>;

const HIDDEN: Record<Fx, Record<string, string>> = {
  fade: { opacity: "0" },
  rise: { opacity: "0", transform: "translateY(12px)" },
  drop: { opacity: "0", transform: "translateY(-12px)" },
  slide: { opacity: "0", transform: "translateX(-12px)" },
  trace: { "stroke-dashoffset": "1" },
  row: { transform: "scaleX(0)" },
};

const SHOWN: Record<Fx, Record<string, number | string>> = {
  fade: { opacity: 1 },
  rise: { opacity: 1, transform: "translateY(0px)" },
  drop: { opacity: 1, transform: "translateY(0px)" },
  slide: { opacity: 1, transform: "translateX(0px)" },
  trace: { strokeDashoffset: 0 },
  row: { transform: "scaleX(1)" },
};

const factory: SceneFactory = ({ stage, motion }) => {
  const { animate, stagger } = motion;

  // Durations and easing come from CSS tokens.
  const trace = Math.min(1400, Math.max(600, cssMs("--web-duration-trace")));
  const reveal = Math.min(700, Math.max(500, cssMs("--web-duration-reveal")));
  const micro = Math.min(200, Math.max(120, cssMs("--web-duration-fade")));
  const longTrace = Math.min(1400, trace * 1.4);
  const rootStyle = getComputedStyle(document.documentElement);
  const easeOut = parseBezier(rootStyle.getPropertyValue("--ease-out")) ?? "easeOut";
  const easeStandard = parseBezier(rootStyle.getPropertyValue("--ease-standard")) ?? "easeInOut";
  const lift = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--vault-lift")) || 4;
  const seconds = (ms: number): number => ms / 1000;

  const ring = stage.querySelector<SVGElement>('[data-el="ring"]');
  const shackle = stage.querySelector<SVGElement>('[data-el="shackle"]');

  // Lock step timeline (ms): appear, ring drains, shackle closes, unlock glyph appears, shackle lifts
  // while the ring refills.
  const lockAppear = 300;
  const drainFrom = lockAppear + reveal * 0.6;
  const drainTo = drainFrom + Math.min(1400, trace * 1.2);
  const unlockAt = drainTo + micro;
  const reopenAt = unlockAt + reveal * 0.5;
  const lockEnd = reopenAt + reveal;

  const plans: PartPlan[] = [
    {
      name: "stretch",
      beats: [
        { el: "field", fx: "rise", at: 0, dur: reveal },
        { el: "kdf", fx: "rise", at: 120, dur: reveal },
        { el: "loop", fx: "trace", at: 300, dur: longTrace },
        { el: "params", fx: "fade", at: 300 + longTrace * 0.7, dur: reveal },
        { el: "out", fx: "trace", at: 300 + longTrace - 100, dur: trace * 0.6 },
      ],
    },
    {
      name: "memory",
      beats: [
        { el: "outline", fx: "fade", at: 0, dur: reveal },
        { el: "mkey", fx: "fade", at: 150, dur: reveal },
        { el: "wrap", fx: "drop", at: 400, dur: reveal },
      ],
    },
    {
      name: "seal",
      beats: [
        { el: "feed", fx: "trace", at: 0, dur: trace * 0.6 },
        { el: "cipher", fx: "fade", at: 200, dur: reveal },
        { el: "file", fx: "rise", at: 300, dur: reveal },
        { el: "row", fx: "row", at: 600, dur: reveal * 0.8, each: 90 },
        { el: "ghost", fx: "slide", at: 1150, dur: reveal },
        { el: "reject", fx: "fade", at: 1150 + reveal * 0.6, dur: reveal },
      ],
    },
    {
      name: "lock",
      beats: [
        { el: "link", fx: "trace", at: 0, dur: trace * 0.5 },
        { el: "track", fx: "fade", at: 200, dur: micro },
        { el: "ring", fx: "fade", at: 200, dur: micro },
        { el: "lockglyph", fx: "fade", at: lockAppear, dur: reveal },
        { el: "lockLabel", fx: "fade", at: lockAppear + 100, dur: reveal },
        { el: "unlockglyph", fx: "fade", at: unlockAt, dur: reveal },
        { el: "unlockLabel", fx: "fade", at: unlockAt + 100, dur: reveal },
        { el: "reopen", fx: "fade", at: unlockAt + 200, dur: reveal },
      ],
      extra: (add, delay) => {
        const ease = (count: number) => Array.from({ length: count }, () => easeStandard) as never;
        if (ring) {
          // Full ring -> empty (inactivity timer) -> full again once reopened.
          add(
            animate(
              ring,
              { strokeDashoffset: [0, 0, 1, 1, 0] },
              {
                duration: seconds(lockEnd),
                delay: seconds(delay),
                times: timesOf([0, drainFrom, drainTo, reopenAt, lockEnd], lockEnd),
                ease: ease(4),
              },
            ),
          );
        }
        if (shackle) {
          const open = `translateY(${-lift}px)`;
          const closed = "translateY(0px)";
          add(
            animate(
              shackle,
              { transform: [open, open, closed, closed, open, open] },
              {
                duration: seconds(lockEnd),
                delay: seconds(delay),
                times: timesOf([0, drainTo, drainTo + micro, reopenAt, reopenAt + reveal * 0.4, lockEnd], lockEnd),
                ease: ease(5),
              },
            ),
          );
        }
      },
      clear: () => {
        ring?.style.removeProperty("stroke-dashoffset");
        shackle?.style.removeProperty("transform");
      },
    },
  ];

  const groups = plans.map((plan) => stage.querySelector<SVGGElement>(`[data-part="${plan.name}"]`));
  if (groups.some((group) => !group)) throw new Error("Vault diagram is incomplete");
  const elementsOf = (part: number, el: string): SVGElement[] =>
    Array.from(groups[part]?.querySelectorAll<SVGElement>(`[data-el="${el}"]`) ?? []);
  const lengthOf = (plan: PartPlan): number => Math.max(...plan.beats.map((beat) => beat.at + beat.dur));

  const state: PartState[] = plans.map(() => "hidden");
  const tokens: number[] = plans.map(() => 0);
  const running: Controls[][] = plans.map(() => []);

  const stopPart = (part: number): void => {
    running[part].forEach((controls) => controls.stop());
    running[part] = [];
  };

  /** Puts a part (and the group around it) back to its hidden state. */
  const resetPart = (part: number): void => {
    plans[part].clear?.();
    plans[part].beats.forEach((beat) => {
      elementsOf(part, beat.el).forEach((el) => {
        for (const [name, value] of Object.entries(HIDDEN[beat.fx])) el.style.setProperty(name, value);
      });
    });
    groups[part]?.style.removeProperty("opacity");
  };

  const setCurrent = (index: number): void => {
    groups.forEach((group, part) => {
      if (part === index) group?.setAttribute("data-current", "");
      else group?.removeAttribute("data-current");
    });
  };

  const revealPart = (part: number, delay: number): void => {
    const token = ++tokens[part];
    stopPart(part);
    resetPart(part);
    state[part] = "revealing";
    const add = (controls: Controls): void => {
      running[part].push(controls);
    };
    for (const beat of plans[part].beats) {
      const targets = elementsOf(part, beat.el);
      if (targets.length === 0) continue;
      const start = seconds(delay + beat.at);
      add(
        animate(targets, SHOWN[beat.fx], {
          duration: seconds(beat.dur),
          delay: beat.each ? stagger(seconds(beat.each), { startDelay: start }) : start,
          ease: easeOut,
        }),
      );
    }
    plans[part].extra?.(add, delay);
    void Promise.all(running[part].map((controls) => controls.finished))
      .then(() => {
        if (tokens[part] === token) state[part] = "shown";
      })
      .catch(() => {});
  };

  const hidePart = (part: number): void => {
    const token = ++tokens[part];
    stopPart(part);
    state[part] = "hiding";
    const group = groups[part];
    if (!group) return;
    const fade = animate(group, { opacity: 0 }, { duration: seconds(micro), ease: easeStandard });
    running[part].push(fade);
    void fade.finished
      .then(() => {
        if (tokens[part] !== token) return;
        running[part] = [];
        resetPart(part);
        state[part] = "hidden";
      })
      .catch(() => {});
  };

  plans.forEach((_, part) => resetPart(part));

  return {
    go(index) {
      const target = Math.min(Math.max(Math.floor(index), -1), plans.length - 1);
      const plan = planParts(state, target);
      plan.hide.forEach(hidePart);
      let delay = 0;
      for (const part of plan.show) {
        revealPart(part, delay);
        delay += lengthOf(plans[part]) * 0.5;
      }
      setCurrent(target);
    },
    destroy() {
      plans.forEach((_, part) => {
        tokens[part] += 1;
        stopPart(part);
        plans[part].clear?.();
        plans[part].beats.forEach((beat) => elementsOf(part, beat.el).forEach((el) => el.removeAttribute("style")));
        groups[part]?.removeAttribute("style");
        groups[part]?.removeAttribute("data-current");
        state[part] = "shown";
      });
    },
  };
};

export default factory;
