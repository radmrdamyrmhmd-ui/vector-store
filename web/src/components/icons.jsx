const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...base} {...rest}>
      {children}
    </svg>
  );
}

export const ArrowUpRight = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Svg>
);

export const ArrowLeft = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Svg>
);

export const ChevronDown = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const SearchIcon = ({ size = 19 }) => (
  <Svg size={size}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const UserIcon = ({ size = 19 }) => (
  <Svg size={size}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </Svg>
);

export const BagIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Svg>
);

export const MenuIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);

export const CloseIcon = ({ size = 20 }) => (
  <Svg size={size}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const PlusIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MinusIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="M5 12h14" />
  </Svg>
);

export const TrashIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </Svg>
);

export const EditIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="M4 20h4l10-10-4-4L4 16v4Z" />
    <path d="m14 6 4 4" />
  </Svg>
);

export const CheckIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="m5 12 5 5L19 7" />
  </Svg>
);

export const TruckIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="M3 7h10v9H3zM13 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Svg>
);

export const ShieldIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="M12 3l7 3v6c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const HeadsetIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
    <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
  </Svg>
);

export const RefreshIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="M20 12a8 8 0 1 1-2.4-5.7" />
    <path d="M20 4v5h-5" />
  </Svg>
);

export const LayersIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="m12 4 8 4-8 4-8-4 8-4Z" />
    <path d="m4 12 8 4 8-4" />
    <path d="m4 16 8 4 8-4" />
  </Svg>
);

export const FeatherIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <path d="M19 5c-2 0-4 .8-5.4 2.2L6 15v3h3l7.8-7.6C18.2 9 19 7 19 5Z" />
    <path d="M5 19 15 9" />
  </Svg>
);

export const CompassIcon = ({ size = 22 }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.5 9.5-1.6 4.4-4.4 1.6 1.6-4.4 4.4-1.6Z" />
  </Svg>
);

export const InstagramIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.6" />
    <path d="M16.6 7.6h.01" />
  </Svg>
);

export const TelegramIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="M20 5 4.5 11l4.2 1.4L20 5Z" />
    <path d="m20 5-3.4 14-5.8-5.6" />
    <path d="m8.7 12.4 2.1 4.4.9-3.4" />
  </Svg>
);

export const YoutubeIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <rect x="3" y="6" width="18" height="12" rx="4" />
    <path d="m11 9.5 4 2.5-4 2.5v-5Z" />
  </Svg>
);

export const WhatsappIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12Z" />
    <path d="M9.2 9.4c0 3 2.4 5.4 5.4 5.4.5 0 1-.4 1-1v-.6l-1.9-.8-.8.9a4.6 4.6 0 0 1-2.1-2.1l.9-.8-.8-1.9h-.6c-.6 0-1.1.4-1.1 1Z" />
  </Svg>
);

export const LogoutIcon = ({ size = 17 }) => (
  <Svg size={size}>
    <path d="M15 5H6v14h9" />
    <path d="M14 12h7M18 9l3 3-3 3" />
  </Svg>
);
