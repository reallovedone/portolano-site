// Section motion entry point (package S4): scroll reveal, count-up, pilot sheet, corner rose,
// route line, the terminal demo and the showcase tabs. Hidden pre-animation states are CSS under html.motion-ready; when a
// part fails, `motion-off` on <html> switches them all off so the page stays complete.
import { initShowcase } from "../../components/showcase/tabs";
import { initCountUp } from "./count";
import { whenStylesReady } from "./css";
import { initReveal } from "./reveal";
import { initRouteLine } from "./routeline";
import { initTerminal } from "./terminal";
import { initCornerRose, initPilotSheet } from "./trace";

function guard(name: string, run: () => void): void {
  try {
    run();
  } catch (error) {
    document.documentElement.classList.add("motion-off");
    console.error(`Motion part disabled: ${name}`, error);
  }
}

// Hidden pre-animation states and the tab layout apply only once the parts actually start, after the
// stylesheets are applied (the parts read CSS tokens), so a blocked or failed script leaves the page
// fully visible.
function run(): void {
  document.documentElement.classList.add("motion-ready");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced) {
    guard("reveal", initReveal);
    guard("count-up", initCountUp);
    guard("pilot sheet", initPilotSheet);
    guard("corner rose", initCornerRose);
    guard("terminal", initTerminal);
  }
  guard("showcase", () => initShowcase(reduced));
  guard("route line", initRouteLine);
}

whenStylesReady(run);
