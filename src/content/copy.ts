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
    "SSH, RDP, VNC, web consoles and local shells in tabs, with an encrypted vault and shared folders for your team. Free and open source, for macOS and Windows.",
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
    connections: "The connection tree with coloured folders and icons, next to an open session",
    settings: "The Settings window with theme, colour theme and accent options",
    import: "The import preview listing hosts to bring in",
    sharing:
      "The Share info window of a subscribed shared folder, showing the owner, the fingerprint, the revision and the time of the last sync",
  },
};

export const nav = {
  brand: "Portolano",
  links: [
    { label: "Features", href: "#features" },
    { label: "Sharing", href: "#sharing" },
    { label: "Vault", href: "#vault" },
    { label: "Security", href: "#security" },
    { label: "Download", href: "#download" },
  ],
  github: "GitHub",
};

export const hero = {
  eyebrow: "OPEN SOURCE · MACOS AND WINDOWS",
  title: "One window for every remote connection.",
  subtitle:
    "SSH, RDP, VNC, web and local shells in tabs, with an encrypted vault and shared folders. Free, with no account and no subscription.",
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
  lead: "Every session gets the same slim toolbar: Reconnect, Duplicate and Close, Ctrl+Alt+Del for remote desktops, and a Home tab one click away.",
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
      text: "Windows desktops with Network Level Authentication, the remote cursor and an optional shared clipboard for text and files.",
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
      text: "Folders, tags, search and drag and drop, in alphabetical order or your own. Credentials are inherited from the parent folder.",
    },
    {
      icon: "folder-sync",
      title: "Shared folders.",
      text: "Publish a folder as a signed file on a network drive, OneDrive, Nextcloud or an internal web server. Colleagues subscribe and see it read-only, with their own credentials.",
      link: { label: "How sharing works →", href: "#sharing" },
    },
    {
      icon: "lock",
      title: "An encrypted vault, if you want one.",
      text: "With no credential assigned, Portolano simply asks when you connect. After the first unlock, Touch ID or Windows Hello opens it again.",
      link: { label: "Inside the vault →", href: "#vault" },
    },
    {
      icon: "palette",
      title: "Make it yours.",
      text: "An icon and a colour for any connection or folder. Light or dark, four colour themes, five accent colours and a compact list.",
    },
    {
      icon: "file-input",
      title: "Bring what you have.",
      text: "Import from OpenSSH config, .rdp files, MobaXterm, mRemoteNG and CSV. Export to JSON and .rdp.",
    },
    {
      icon: "refresh-cw",
      title: "Updates you approve.",
      text: "Portolano checks for new versions, shows what changed and asks before installing. Every update is verified with the project's signing key. Release candidates only if you ask for them.",
    },
  ] as Array<{ icon: string; title: string; text: string; link?: { label: string; href: string } }>,
};

export const showcase = {
  eyebrow: "A LOOK INSIDE",
  title: "Quiet until you need it.",
  subtitle: "The remote session is the point. Everything else gets out of the way.",
  screens: [
    {
      id: "connections",
      tab: "Connections",
      caption: "Icons, colours and your own order.",
      alt: service.screenAlt.connections,
    },
    {
      id: "sharing",
      tab: "Sharing",
      caption: "A shared folder shows who signed it, and when it last synced.",
      alt: service.screenAlt.sharing,
    },
    { id: "terminal", tab: "Terminal", caption: "SSH and local shells in a real terminal.", alt: service.screenAlt.terminal },
    {
      id: "connection-editor",
      tab: "Editor",
      caption: "One form per protocol, nothing you don't need.",
      alt: service.screenAlt.connectionEditor,
    },
    {
      id: "settings",
      tab: "Settings",
      caption: "Four colour themes, five accents, light or dark.",
      alt: service.screenAlt.settings,
    },
    {
      id: "import",
      tab: "Import",
      caption: "A preview of what comes in. Passwords are never imported.",
      alt: service.screenAlt.import,
    },
  ],
};

/**
 * Spotlight sections (shared folders, vault): four steps next to an SVG diagram.
 * `diagram.label` describes the whole SVG (role="img"); the other diagram strings are drawn inside it.
 */
export interface SpotlightStep {
  title: string;
  text: string;
}

/** Shared folders spotlight (README: "Shared folders", "Security"). */
export const sharingSpotlight = {
  id: "sharing" as const,
  eyebrow: "SHARED FOLDERS",
  title: "One folder, the whole team.",
  lead: "One person keeps a folder of connections up to date and the others subscribe to it. No Git, no server software, no account.",
  steps: [
    {
      title: "Publish.",
      text: "Right-click a folder and choose Share. Portolano writes one .portolano-share file, signed with your identity: a name and a short fingerprint you can compare on the phone.",
    },
    {
      title: "Put it where the team looks.",
      text: "A network drive, a OneDrive or Nextcloud folder, or the folder an internal web server publishes. When you change the folder, publish again.",
    },
    {
      title: "Subscribe.",
      text: "Colleagues choose Add Remote Folder. It appears read-only in their tree and is checked at startup, every 15 minutes and with Sync now.",
    },
    {
      title: "What never comes in.",
      text: "No credentials, no disabled certificate or NLA checks, no local shells or programs. Everyone connects with their own credentials.",
    },
  ] as SpotlightStep[],
  diagram: {
    label:
      "A folder named Production is published as one signed .portolano-share file with the owner's fingerprint, placed on a network drive, OneDrive, Nextcloud or a web server, and read by three colleagues as a read-only folder. Credentials, disabled checks and local programs are stopped on the way.",
    folder: "Production",
    file: ".portolano-share",
    fingerprint: "7F3A-91C2-0B4D-E6A8",
    places: ["Network drive", "OneDrive", "Nextcloud", "Web server"],
    people: ["Colleague", "Colleague", "Colleague"],
    blocked: ["Credentials", "Checks off", "Local programs"],
    readOnly: "read-only",
  },
};

/** Vault spotlight (README: "Security", "How the vault is encrypted"). */
export const vaultSpotlight = {
  id: "vault" as const,
  eyebrow: "THE VAULT",
  title: "Locked by design.",
  lead: "Credentials live in an encrypted vault on your computer. Your master password is never stored.",
  steps: [
    {
      title: "Stretch the password.",
      text: "Argon2id (64 MiB of memory, 3 passes) turns your master password into a key that exists only in memory.",
    },
    {
      title: "Wrap the data key.",
      text: "A random 256-bit data key encrypts the vault. The password-derived key wraps it, so changing the master password creates a new one.",
    },
    {
      title: "Seal the credentials.",
      text: "XChaCha20-Poly1305 is an authenticated cipher: a vault file changed by a single bit is rejected, not decrypted.",
    },
    {
      title: "Lock and reopen.",
      text: "The vault locks after 15 minutes of inactivity by default (5, 30, 60 or never) and keys are zeroed. Touch ID or Windows Hello reopens it after the first unlock.",
    },
  ] as SpotlightStep[],
  diagram: {
    label:
      "The master password goes through Argon2id with 64 MiB and 3 passes and becomes a key held only in memory. That key wraps a 256-bit data key, which seals the credentials with XChaCha20-Poly1305 into the vault file. A file with one bit changed is rejected. After 15 minutes the vault locks, and Touch ID or Windows Hello unlocks it again.",
    password: "••••••••••",
    kdf: "Argon2id",
    kdfParams: "64 MiB · 3 passes",
    memoryKey: "key · memory only",
    dataKey: "data key · 256-bit",
    cipher: "XChaCha20-Poly1305",
    file: "vault file",
    tampered: "1 bit changed",
    rejected: "rejected",
    lock: "15 min",
    unlock: "Touch ID · Windows Hello",
  },
};

/** Both spotlights, keyed by section anchor id. */
export const spotlights = { sharing: sharingSpotlight, vault: vaultSpotlight };

export const security = {
  eyebrow: "SECURITY",
  title: "A tool that holds the keys to your servers has to earn trust.",
  subtitle:
    "Written in Rust on established open-source implementations. No home-made cryptography.",
  cards: [
    {
      title: "The vault.",
      text: "Argon2id stretches your master password into a key that only ever exists in memory. Credentials are encrypted with XChaCha20-Poly1305: a vault file altered by a single bit is rejected, not decrypted.",
      link: { label: "Inside the vault →", href: "#vault" },
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
    {
      title: "Shared, not trusted.",
      text: "Shared folders are signed by whoever publishes them and read-only for everyone else. What comes in never carries credentials, never turns off certificate or NLA checks and never runs a local program.",
      link: { label: "How sharing works →", href: "#sharing" },
    },
  ],
  foundations: "russh · IronRDP · rustls · RustCrypto",
  limits: {
    title: "Honest limits.",
    text: "Portolano is in alpha and has not had an independent security audit. A weak master password makes a weak vault. Plain VNC is not encrypted. The builds are not code-signed.",
    link: "Read SECURITY.md →",
  },
};

/** Terminal demo in the features section: a scripted SSH session, generic names only. */
export const terminalDemo = {
  tab: "bastion",
  caption: "A real terminal, one click away from the tree.",
  srText: "An SSH session to a host named bastion: the uptime and disk usage commands and their output.",
  lines: [
    { kind: "status", text: "Connected to bastion · host key verified" },
    { kind: "command", prompt: "deploy@bastion:~$", text: "uptime" },
    { kind: "output", text: " 10:42:07 up 41 days,  3:12,  2 users,  load average: 0.12, 0.08, 0.05" },
    { kind: "command", prompt: "deploy@bastion:~$", text: "df -h /srv" },
    { kind: "output", text: "Filesystem      Size  Used Avail Use% Mounted on" },
    { kind: "output", text: "/dev/sda2       200G   61G  139G  31% /srv" },
    { kind: "command", prompt: "deploy@bastion:~$", text: "" },
  ] as Array<{ kind: "status" | "command" | "output"; text: string; prompt?: string }>,
};

export const roadmap = {
  eyebrow: "THE ROUTE AHEAD",
  title: "Where the route goes next.",
  stops: [
    {
      title: "Signed builds.",
      text: "No more warnings from macOS and Windows the first time you open Portolano.",
    },
    {
      title: "Sync.",
      text: "Shared folders were the first step. Next: your own connection tree, the same on every computer you use.",
    },
  ],
  last: {
    title: "Stay connected.",
    text: "Watch the repository on GitHub to hear about every new release.",
    link: "Watch on GitHub →",
  },
};

/** A word of an FAQ answer that is rendered as a link (first occurrence only). */
export interface FaqLink {
  text: string;
  href: string;
}

export interface FaqItem {
  q: string;
  a: string;
  links?: FaqLink[];
}

export const faq: { eyebrow: string; title: string; items: FaqItem[] } = {
  eyebrow: "QUESTIONS",
  title: "Before you set sail.",
  items: [
    {
      q: "Is Portolano really free?",
      a: "Yes. It is open source under the MIT license, with no account and no subscription.",
    },
    {
      q: "Where are my passwords stored?",
      a: "Only on your computer, in an encrypted vault file in the system's application-data folder. Your master password is never stored. The vault locks after 15 minutes of inactivity, or after the time you choose, and can be reopened with Touch ID or Windows Hello.",
    },
    {
      q: "Why does my system warn me when I open it?",
      a: "The builds are not code-signed yet, so macOS and Windows warn you the first time. Every release comes with SHA-256 checksums, and signed builds are on the route ahead.",
    },
    {
      q: "How do updates work?",
      a: "From version 0.2.0, Portolano checks GitHub for a new release and installs it only if you agree, after verifying it with the project's signing key. The automatic check can be turned off, and in Settings you can choose to be offered release candidates too. The release notes of every version are inside the app.",
    },
    {
      q: "Can I bring my connections from another tool?",
      a: "Yes: from OpenSSH config, .rdp files, MobaXterm, mRemoteNG and CSV. You see a preview first, and passwords are never imported.",
    },
    {
      q: "Can my team share connections?",
      a: "Yes, from version 0.4.0: publish a folder as a signed file on a network drive, a cloud folder or an internal web server, and colleagues subscribe to it. Shared folders are read-only and never carry passwords: everyone uses their own credentials.",
    },
    {
      q: "Is it ready for production servers?",
      a: "Portolano is in alpha and has not had an independent security audit. It is developed and tested mainly on macOS; the Windows build has had less testing.",
    },
    {
      q: "How can I report a bug or help?",
      a: "Open an issue on GitHub; ideas and pull requests are welcome. Report security problems privately, as described in SECURITY.md.",
      links: [
        { text: "GitHub", href: ISSUES_URL },
        { text: "SECURITY.md", href: SECURITY_URL },
      ],
    },
  ],
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
  updateNote: "Version 0.1.0 has no updater: install the new version by hand once. After that, updates are offered inside the app.",
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
