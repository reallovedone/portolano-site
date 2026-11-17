// All page copy lives here, word for word from the site plan (sections 3.0-3.8 and 3.10).
// Components read text only from this file.

export const REPO_URL = "https://github.com/reallovedone/portolano";
export const SECURITY_URL = `${REPO_URL}/blob/main/SECURITY.md`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const LICENSE_NAME = "MIT";

/** A run of text, optionally emphasised. */
export type TextPart = string | { em: string };

export const meta = {
  title: "Portolano — One window for every remote connection",
  description:
    "SSH, RDP, VNC, web consoles and local shells in tabs, with an encrypted vault. Free and open source, for macOS and Windows.",
};

export const service = {
  skipLink: "Skip to content",
  notFound: {
    title: "Off the chart.",
    text: "This page does not exist.",
    link: "Back to the home port →",
  },
  themeToggle: {
    toDark: "Switch to dark theme",
    toLight: "Switch to light theme",
  },
  githubLabel: (stars: number | null): string =>
    stars === null ? "Portolano on GitHub" : `Portolano on GitHub, ${stars} stars`,
  // The hero button's visible text is "View on GitHub": its accessible name must contain it (WCAG 2.5.3).
  heroGithubLabel: (stars: number | null): string =>
    stars === null ? "View on GitHub" : `View on GitHub, ${stars} stars`,
  navLabels: {
    header: "Sections",
    footer: "Footer",
  },
  screenAlt: {
    welcome: "Portolano welcome screen with the connection tree and protocol shortcuts",
    terminal: "An SSH session in a Portolano terminal tab",
    connectionEditor: "The connection editor for an SSH host",
    import: "The import preview listing hosts to bring in",
  },
};

export const nav = {
  brand: "Portolano",
  links: [
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "Download", href: "#download" },
  ],
  github: "GitHub",
};

export const hero = {
  eyebrow: "OPEN SOURCE · MACOS AND WINDOWS",
  title: "One window for every remote connection.",
  subtitle:
    "SSH, RDP, VNC, web consoles and local shells — in tabs, with an encrypted vault. Free, with no account and no subscription.",
  primary: "View on GitHub",
  downloadMac: "Download for macOS",
  downloadWindows: "Download for Windows",
  /** Small line under the buttons. */
  meta: (version: string | null): string =>
    version === null ? "alpha · MIT" : `v${version} · alpha · MIT`,
};

export const githubBand = {
  title: "Free and open source. The whole chart is on GitHub.",
  statLabels: { stars: "stars", downloads: "downloads", version: "latest release" },
  primary: "Star on GitHub",
  secondary: "Read the source →",
};

export const name = {
  eyebrow: "THE NAME",
  title: "A pilot book for your servers.",
  paragraphs: [
    [
      "A ",
      { em: "portolano" },
      " was the pilot book of medieval Mediterranean sailors: a list of ports, the routes between them, and what you needed to know to reach each one safely. The charts drawn from those books are covered in straight lines radiating from compass points.",
    ],
    [
      "This is that book for system administrators: every host you look after, and the shortest route to each one.",
    ],
  ] as TextPart[][],
  note: "Porte are also network ports.",
};

export type ProtocolKind = "ssh" | "rdp" | "vnc" | "web" | "localShell";

export const features = {
  eyebrow: "PORTS OF CALL",
  title: "Five kinds of connection, one set of tabs.",
  protocols: [
    {
      kind: "ssh",
      name: "SSH",
      port: "22",
      text: "A real terminal. Password or key authentication, jump hosts, host-key verification.",
    },
    {
      kind: "rdp",
      name: "RDP",
      port: "3389",
      text: "Windows desktops with Network Level Authentication and the remote cursor.",
    },
    {
      kind: "vnc",
      name: "VNC",
      port: "5900",
      text: "Password authentication, and TLS encryption when the server offers a certificate.",
    },
    {
      kind: "web",
      name: "Web",
      port: "443",
      text: "Admin consoles in tabs, each with its own isolated cookie store if you want.",
    },
    {
      kind: "localShell",
      name: "Local shell",
      port: "local",
      text: "Your own machine, one tab away from the others.",
    },
  ] as Array<{ kind: ProtocolKind; name: string; port: string; text: string }>,
  extras: [
    {
      icon: "folder-tree",
      title: "A tree, not a list.",
      text: "Folders, tags, search and drag and drop. Credentials are inherited from the parent folder.",
    },
    {
      icon: "lock",
      title: "An encrypted vault, if you want one.",
      text: "With no credential assigned, Portolano simply asks when you connect.",
    },
    {
      icon: "file-input",
      title: "Bring what you have.",
      text: "Import from OpenSSH config, .rdp files, MobaXterm, mRemoteNG and CSV. Export to JSON and .rdp.",
    },
    {
      icon: "sun-moon",
      title: "Light and dark.",
      text: "Both themes, following the system.",
    },
  ] as Array<{ icon: string; title: string; text: string }>,
};

export const showcase = {
  eyebrow: "A LOOK INSIDE",
  title: "Quiet until you need it.",
  subtitle: "The remote session is the point. Everything else gets out of the way.",
  screens: [
    { id: "welcome", tab: "Welcome", caption: "Every host is a port of call.", alt: service.screenAlt.welcome },
    { id: "terminal", tab: "Terminal", caption: "SSH and local shells in a real terminal.", alt: service.screenAlt.terminal },
    {
      id: "connection-editor",
      tab: "Connection editor",
      caption: "One form per protocol, nothing you don't need.",
      alt: service.screenAlt.connectionEditor,
    },
    {
      id: "import",
      tab: "Import",
      caption: "A preview of what comes in. Passwords are never imported.",
      alt: service.screenAlt.import,
    },
  ],
};

export const security = {
  eyebrow: "SECURITY",
  title: "A tool that holds the keys to your servers has to earn trust.",
  subtitle:
    "Written in Rust on established open-source implementations. No home-made cryptography.",
  cards: [
    {
      title: "The vault.",
      text: "Argon2id stretches your master password into a key that only ever exists in memory. Credentials are encrypted with XChaCha20-Poly1305: a vault file altered by a single bit is rejected, not decrypted.",
    },
    {
      title: 'No "connect anyway".',
      text: "SSH host keys and RDP and VNC certificates are confirmed on first use. If one changes, Portolano refuses until you remove the stored one.",
    },
    {
      title: "Secrets stay in the core.",
      text: "The interface asks the Rust core to connect and never receives a stored password unless you reveal one. Imports and exports never carry passwords.",
    },
    {
      title: "Nothing phones home.",
      text: "No telemetry, no account, no cloud. Besides your own hosts, the app only contacts GitHub to look for updates — and you can turn that off.",
    },
  ],
  foundations: "russh · IronRDP · rustls · RustCrypto",
  limits: {
    title: "Honest limits.",
    text: "Portolano is in alpha and has not had an independent security audit. A weak master password makes a weak vault. Plain VNC is not encrypted. The builds are not code-signed.",
    link: "Read SECURITY.md →",
  },
};

export const download = {
  eyebrow: "DOWNLOAD",
  title: "Chart a course.",
  subtitle: (version: string | null): string =>
    version === null
      ? "For macOS 14 or later and Windows 10 and 11."
      : `Version ${version} for macOS 14 or later and Windows 10 and 11.`,
  installers: {
    macosArm: "macOS · Apple silicon",
    macosIntel: "macOS · Intel",
    windows: "Windows · 64-bit",
  },
  intelMac: "Intel Mac?",
  otherSystems: "Available for macOS and Windows",
  allReleases: "All releases →",
  checksums: "SHA256SUMS.txt →",
  note: "The builds are not signed, so macOS and Windows warn you the first time. On macOS, right-click the app and choose Open. On Windows, press More info, then Run anyway.",
  buildTitle: "Prefer to build it yourself?",
  buildCode: `git clone https://github.com/reallovedone/portolano.git
cd portolano && pnpm install && pnpm ui:install && pnpm build`,
};

export const footer = {
  brand: "Portolano",
  license: "MIT © Simone Amato",
  links: [
    { label: "GitHub", href: REPO_URL },
    { label: "Releases", href: `${REPO_URL}/releases` },
    { label: "Security", href: SECURITY_URL },
    { label: "Report an issue", href: ISSUES_URL },
  ],
  privacy: "This page sets no cookies and loads nothing from third parties.",
};

/** Pilot sheet rows (plan 4.3): generic names, never real hosts. */
export const pilotSheet = [
  { port: "22", proto: "ssh", host: "bastion", kind: "ssh" },
  { port: "3389", proto: "rdp", host: "file server", kind: "rdp" },
  { port: "5900", proto: "vnc", host: "lab console", kind: "vnc" },
  { port: "443", proto: "web", host: "firewall", kind: "web" },
] as Array<{ port: string; proto: string; host: string; kind: ProtocolKind }>;
