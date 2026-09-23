// Icon dạng outline, stroke 1.8, đầu nét bo tròn, viewBox 24x24 (theo tài liệu thiết kế)
const base = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
};

export const CalendarIcon = (p) => (
  <svg {...base} {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></svg>
);
export const CameraIcon = (p) => (
  <svg {...base} {...p}><path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.6A2 2 0 0 1 10.2 3.4h3.6a2 2 0 0 1 1.7 1l1 1.6H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><circle cx="12" cy="13" r="3.4" /></svg>
);
export const UserIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.3-3.7 4.2-5.6 7.5-5.6s6.2 1.9 7.5 5.6" /></svg>
);
export const FlipIcon = (p) => (
  <svg {...base} {...p}><path d="M17 2.1l4 4-4 4" /><path d="M21 6.1H8a5 5 0 0 0-5 5v1" /><path d="M7 21.9l-4-4 4-4" /><path d="M3 17.9h13a5 5 0 0 0 5-5v-1" /></svg>
);
export const PencilIcon = (p) => (
  <svg {...base} {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const CloseIcon = (p) => (
  <svg {...base} strokeWidth={2} {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
);
export const ChevronLeft = (p) => (
  <svg {...base} strokeWidth={2} {...p}><polyline points="15 6 9 12 15 18" /></svg>
);
export const ChevronRight = (p) => (
  <svg {...base} strokeWidth={2} {...p}><polyline points="9 6 15 12 9 18" /></svg>
);
