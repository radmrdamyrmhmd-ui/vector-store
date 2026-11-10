export default function BrandMark({ className = 'brand-mark' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 4h5.6L16 12.4 22.4 4H28l-8.9 13.1V28h-6.2V17.1L4 4Z" fill="currentColor" />
      <rect x="2.4" y="2.4" width="27.2" height="27.2" rx="6" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.1" />
    </svg>
  );
}
