import React from "react";

const paths = {
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></>,
  save: <><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <path d="M20.5 14.8A8.5 8.5 0 0 1 9.2 3.5 8.5 8.5 0 1 0 20.5 14.8Z"/>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9s-1.1 6.5-3.3 9c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.5a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.5v2.6h-.5a1.7 1.7 0 0 0-1.1 1Z"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  warning: <><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v4M12 16h.01"/></>,
  inbox: <><path d="M4 5h16v14H4z"/><path d="M4 13h4l2 2h4l2-2h4"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  arrowLeft: <><path d="M19 12H5M11 6l-6 6 6 6"/></>,
  arrowRight: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  document: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
  documentCheck: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h3M9 16l2 2 4-4"/></>,
  graduation: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11v5c3 2 7 2 10 0v-5M21 9v7"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.6 2.6 0 1 1 4.7 1.5c-.9 1.1-2.3 1.3-2.3 3"/><path d="M12 17h.01"/></>,
  shield: <><path d="M12 3 19 6v5c0 4.5-2.7 8.1-7 10-4.3-1.9-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  payment: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
  archive: <><path d="M4 5h16v15H4z"/><path d="M4 9h16M9 13h6"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M16 14a5 5 0 0 1 5 5"/></>,
  route: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h4a6 6 0 0 1 6 6v4"/></>,
  print: <><path d="M6 9V4h12v5M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></>,
  dashboard: <><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></>,
  reports: <><path d="M5 20V10M12 20V4M19 20v-7"/><path d="M3 20h18"/></>,
};

export default function Icon({ name, size=20, strokeWidth=1.8, className="", title, ...props }) {
  const content = paths[name] || paths.info;
  return <svg className={`ui-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>{title && <title>{title}</title>}{content}</svg>;
}
