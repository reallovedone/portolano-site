// Contract between the spotlight loader (index.ts) and the scene modules (sharing.ts, vault.ts).

/** The `motion` functions scenes may use (a slice of the package, to keep the lazy chunk small). */
export type MotionApi = typeof import("./motion-api");

export interface SceneContext {
  /** The `<section data-spotlight="...">` element. */
  root: HTMLElement;
  /** The scene's inline SVG (inside `figure.stage`). Complete (final state) until the scene hides parts. */
  stage: SVGSVGElement;
  /** The lazily imported `motion` API (vanilla): `animate`, `scroll`, `spring`, `stagger` only, see motion-api.ts. */
  motion: MotionApi;
  /** Number of steps (`li[data-step]`). */
  stepCount: number;
}

export interface Scene {
  /**
   * Animate the diagram to show steps 0..index, going forward or backward. May be called again
   * before the previous call finished (cancel or retarget running animations). `go(0)` after a
   * higher index must return to the step 0 picture.
   */
  go(index: number): void;
  /** Stop animations and release listeners. The SVG is left in a valid (ideally final) state. */
  destroy(): void;
}

/** Each scene module default-exports one of these. It runs once, when the section nears the viewport. */
export type SceneFactory = (ctx: SceneContext) => Scene;
