// Terminal demo playback: when the demo first enters view, its lines appear one after another and
// commands are typed character by character; then the cursor blinks (CSS, `is-idle`).
// The final state is already in the HTML. Hidden states (`is-pending`) are CSS under html.motion-ready;
// every line keeps its place, so nothing moves. Not started with reduced motion.
import { cssMs } from "../css";

type Wait = (ms: number) => Promise<void>;

const wait: Wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function play(root: HTMLElement, cursor: HTMLElement | null): Promise<void> {
  const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-term-line]"));
  const start = cssMs("--web-terminal-start");
  const step = cssMs("--web-terminal-type-step");
  const pause = cssMs("--web-terminal-line-pause");
  const home = cursor?.parentElement ?? null;

  const commands = lines
    .map((line) => line.querySelector<HTMLElement>("[data-text]"))
    .filter((el): el is HTMLElement => el !== null);

  try {
    cursor?.remove();
    for (const el of commands) el.textContent = "";

    await wait(start);
    for (const line of lines) {
      line.classList.add("is-shown");
      const target = line.querySelector<HTMLElement>("[data-text]");
      if (target) {
        if (cursor) line.append(cursor);
        const text = target.dataset.text ?? "";
        for (const char of text) {
          await wait(step);
          target.textContent += char;
        }
        if (text.length > 0) await wait(pause);
        // The command is "sent": the cursor leaves the line, except on the final prompt.
        if (cursor && line !== home) cursor.remove();
      } else {
        await wait(pause);
      }
    }
    if (cursor && home) home.append(cursor);
    root.classList.add("is-idle");
  } catch (error) {
    // Leave the complete final state behind, then let the guard in index.ts switch the motion off.
    for (const el of commands) el.textContent = el.dataset.text ?? "";
    if (cursor && home) home.append(cursor);
    throw error;
  }
}

export function initTerminal(): void {
  for (const root of document.querySelectorAll<HTMLElement>("[data-terminal]")) {
    const cursor = root.querySelector<HTMLElement>("[data-cursor]");
    root.classList.add("is-pending");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        play(root, cursor).catch((error: unknown) => {
          document.documentElement.classList.add("motion-off");
          console.error("Motion part disabled: terminal", error);
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(root);
  }
}
