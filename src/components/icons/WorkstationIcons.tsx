"use client";

/* ============================================================
   WORKSTATION ICONS — clean 90s scientific workstation set.
   No emojis. 24x24 viewBox, 1.5px stroke, crispEdges.
   Monochrome, phosphor accent on active.
   ============================================================ */

import React from "react";

type IconProps = {
  size?: number;
  className?: string;
  active?: boolean;
};

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor" as const,
  strokeWidth: 1.6,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  shapeRendering: "crispEdges" as const,
};

export function IconFiles({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <path d="M4 7 H10 L11.5 9 H20 V18 H4 Z" />
      <path d="M4 9 H20" opacity={0.35} />
      <path d="M7 12 H13" opacity={0.9} />
      <path d="M7 15 H11" opacity={0.55} />
    </svg>
  );
}
export function IconMail({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={4.5} y={7} width={15} height={10} rx={0.8} />
      <path d="M4.5 7 L12 12.2 L19.5 7" />
      <path d="M6 16 L10 12.5" opacity={0.6} />
      <path d="M18 16 L14 12.5" opacity={0.6} />
    </svg>
  );
}
export function IconPhotos({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={3.5} y={6} width={17} height={12} rx={1} />
      <circle cx={9} cy={10} r={1.7} />
      <path d="M3.5 15.2 L8.2 10.8 L11.2 13.5 L14.8 9.8 L20.5 14.6" />
      {/* viewfinder corners */}
      <path d="M4.5 7 V9 H6.5" opacity={0.5} strokeWidth={1.2} />
      <path d="M17.5 7 V9 H19.5" opacity={0.5} strokeWidth={1.2} />
    </svg>
  );
}
export function IconBrowser({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <circle cx={12} cy={12} r={7.2} />
      <path d="M12 4.8 V19.2" />
      <path d="M4.8 12 H19.2" />
      <path d="M6.4 8.2 C8.2 9.4 15.8 9.4 17.6 8.2" />
      <path d="M6.4 15.8 C8.2 14.6 15.8 14.6 17.6 15.8" />
      <path d="M8.2 5.6 C9.4 8 9.4 16 8.2 18.4" opacity={0.5} />
      <path d="M15.8 5.6 C14.6 8 14.6 16 15.8 18.4" opacity={0.5} />
    </svg>
  );
}
export function IconTerminal({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={3.5} y={5.5} width={17} height={13} rx={1} />
      <path d="M7 10 L10 12 L7 14" />
      <path d="M11.2 15.2 H14.8" strokeWidth={1.9} />
      <rect x={15.6} y={14.4} width={2.2} height={1.4} fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconSystemLog({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={4.5} y={5.5} width={15} height={13} rx={0.8} />
      <path d="M7.5 9 H16.5" />
      <path d="M7.5 12 H16.5" />
      <path d="M7.5 15 H12.2" />
      <path d="M15.2 5.5 V8.2 H17.8" opacity={0.45} />
    </svg>
  );
}
export function IconEvidence({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={4.5} y={8.2} width={12} height={9.2} rx={0.8} />
      <circle cx={15.2} cy={7} r={2.4} />
      <path d="M15.2 9.4 L16.4 17.2" />
      <path d="M7 12 H12.5" opacity={0.9} />
      <path d="M7 14.8 H11" opacity={0.55} />
      <circle cx={5.2} cy={8.6} r={0.9} fill="currentColor" stroke="none" opacity={0.9} />
    </svg>
  );
}
export function IconFieldGuide({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={5} y={5.5} width={14} height={13} rx={0.9} />
      <circle cx={12} cy={11.8} r={3.4} />
      <path d="M12 8.4 V15.2" />
      <path d="M8.6 11.8 H15.4" />
      {/* crosshair */}
      <path d="M12 5.5 V7.2" opacity={0.45} />
      <path d="M12 16.4 V18.5" opacity={0.45} />
      <path d="M5 11.8 H6.7" opacity={0.45} />
      <path d="M17.3 11.8 H19" opacity={0.45} />
    </svg>
  );
}
export function IconPrivate({ size = 18, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden>
      <rect x={6.5} y={11} width={11} height={7} rx={0.9} />
      <circle cx={12} cy={8.2} r={2.8} />
      <path d="M12 11 V13.2" />
      <circle cx={12} cy={14.6} r={0.9} fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconSoundOn({ size = 14, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden viewBox="0 0 24 24">
      <path d="M6 9 H9 L14 6 V18 L9 15 H6 Z" />
      <path d="M16 8.5 C17.2 10 17.2 14 16 15.5" />
      <path d="M17.8 7 C19 9.2 19 14.8 17.8 17" opacity={0.6} />
    </svg>
  );
}
export function IconSoundOff({ size = 14, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden viewBox="0 0 24 24">
      <path d="M6 9 H9 L14 6 V18 L9 15 H6 Z" />
      <path d="M16 8.5 L18.5 11 L16 13.5" />
      <path d="M18.5 8.5 L16 11 L18.5 13.5" />
      <path d="M18.5 7 C19 9.2 19 14.8 18.5 17" opacity={0.35} />
    </svg>
  );
}
export function IconCrt({ size = 14, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden viewBox="0 0 24 24">
      <rect x={4} y={6} width={16} height={11} rx={1} />
      <path d="M8 17.5 H16" />
      <path d="M10 17.5 V19.5 H14" />
      <path d="M7 9 H17" opacity={0.35} />
      <path d="M7 12 H17" opacity={0.35} />
    </svg>
  );
}
export function IconLink({ size = 14, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden viewBox="0 0 24 24">
      <path d="M9.5 12.5 L7.2 14.8 C6 16 6 17.8 7.2 19 C8.4 20.2 10.2 20.2 11.4 19 L13.7 16.7" />
      <path d="M14.5 11.5 L16.8 9.2 C18 8 18 6.2 16.8 5 C15.6 3.8 13.8 3.8 12.6 5 L10.3 7.3" />
      <path d="M9 11 L15 13" opacity={0.5} />
    </svg>
  );
}

export const APP_ICONS: Record<string, React.FC<IconProps>> = {
  files: IconFiles,
  mail: IconMail,
  photos: IconPhotos,
  browser: IconBrowser,
  terminal: IconTerminal,
  systemlog: IconSystemLog,
  evidence: IconEvidence,
};
