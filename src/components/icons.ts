// Single-stroke icons on a 24-unit grid. Interface icons come from the Lucide set (ISC licence),
// protocol icons are the app's own KindIcon drawings. The GitHub mark is filled (16-unit grid).

type Node = [tag: "path" | "rect" | "circle", attrs: Record<string, string>];

export interface IconDef {
  viewBox: string;
  filled?: boolean;
  nodes: Node[];
}

const p = (d: string): Node => ["path", { d }];

export const ICONS: Record<string, IconDef> = {
  ssh: {
    viewBox: "0 0 24 24",
    nodes: [
      ["rect", { x: "3", y: "4.5", width: "18", height: "15", rx: "3.5" }],
      p("M7.5 10l3 2.5-3 2.5M13 15h3.5"),
      ["circle", { cx: "17", cy: "9", r: "1.1", fill: "currentColor", stroke: "none" }],
    ],
  },
  localShell: {
    viewBox: "0 0 24 24",
    nodes: [["rect", { x: "3", y: "4.5", width: "18", height: "15", rx: "3.5" }], p("M7.5 10l3 2.5-3 2.5M13 15h3.5")],
  },
  rdp: {
    viewBox: "0 0 24 24",
    nodes: [["rect", { x: "3", y: "4", width: "18", height: "12", rx: "2.5" }], p("M3 8.5h18M9 20h6M12 16v4")],
  },
  vnc: {
    viewBox: "0 0 24 24",
    nodes: [
      ["rect", { x: "3", y: "4", width: "18", height: "12", rx: "2.5" }],
      ["path", { d: "M10 7.5l4.6 2-2 .8-.8 2z", fill: "currentColor" }],
      p("M9 20h6M12 16v4"),
    ],
  },
  web: {
    viewBox: "0 0 24 24",
    nodes: [
      ["circle", { cx: "12", cy: "12", r: "9" }],
      p("M3 12h18M12 3c2.6 2.4 2.6 15.6 0 18M12 3c-2.6 2.4-2.6 15.6 0 18"),
    ],
  },
  "folder-tree": {
    viewBox: "0 0 24 24",
    nodes: [
      p("M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"),
      p("M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"),
      p("M3 5a2 2 0 0 0 2 2h3"),
      p("M3 3v13a2 2 0 0 0 2 2h3"),
    ],
  },
  lock: {
    viewBox: "0 0 24 24",
    nodes: [["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }], p("M7 11V7a5 5 0 0 1 10 0v4")],
  },
  "file-input": {
    viewBox: "0 0 24 24",
    nodes: [
      p("M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1"),
      p("M14 2v5a1 1 0 0 0 1 1h5"),
      p("M2 15h10"),
      p("m9 18 3-3-3-3"),
    ],
  },
  "sun-moon": {
    viewBox: "0 0 24 24",
    nodes: [
      p("M12 2v2"),
      p("M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"),
      p("M16 12a4 4 0 0 0-4-4"),
      p("m19 5-1.256 1.256"),
      p("M20 12h2"),
    ],
  },
  sun: {
    viewBox: "0 0 24 24",
    nodes: [
      ["circle", { cx: "12", cy: "12", r: "4" }],
      p("M12 2v2"),
      p("M12 20v2"),
      p("m4.93 4.93 1.41 1.41"),
      p("m17.66 17.66 1.41 1.41"),
      p("M2 12h2"),
      p("M20 12h2"),
      p("m6.34 17.66-1.41 1.41"),
      p("m19.07 4.93-1.41 1.41"),
    ],
  },
  moon: {
    viewBox: "0 0 24 24",
    nodes: [p("M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401")],
  },
  github: {
    viewBox: "0 0 16 16",
    filled: true,
    nodes: [
      p(
        "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z",
      ),
    ],
  },
};
