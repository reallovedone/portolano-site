// The slice of `motion` the scenes may use. Importing only these names (instead of the whole package)
// lets the bundler drop the rest, so the lazily loaded chunk stays small.
export { animate, scroll, spring, stagger } from "motion";
