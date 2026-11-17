// The one scroll listener of the motion package. Subscribers run at most once per animation frame,
// after a scroll or a resize. The listeners are attached while at least one subscriber exists.
// (The hero keeps its own listener in src/scripts/hero/.)
type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let queued = false;
let attached = false;

function run(): void {
  queued = false;
  for (const subscriber of subscribers) {
    try {
      subscriber();
    } catch (error) {
      // A failing subscriber must not stop the others; drop it so it is not reported on every frame.
      subscribers.delete(subscriber);
      console.error("Motion subscriber removed after an error", error);
    }
  }
}

/** Asks for a run on the next frame. */
export function requestFrame(): void {
  if (queued) return;
  queued = true;
  window.requestAnimationFrame(run);
}

/** Runs `subscriber` once per frame while the page scrolls or resizes. Returns the unsubscribe function. */
export function subscribe(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  if (!attached) {
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame, { passive: true });
    attached = true;
  }
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && attached) {
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", requestFrame);
      attached = false;
    }
  };
}
