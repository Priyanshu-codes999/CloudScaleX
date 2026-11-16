export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="CloudScale X logo">
      <defs>
        <linearGradient id="csx-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4D9BFF" />
          <stop offset="100%" stopColor="#2FD8F0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0B1424" stroke="#1E3451" strokeWidth="1.4" />
      <path
        d="M12.5 26.5h14.8c2.2 0 4-1.8 4-4 0-2.1-1.6-3.8-3.7-4-.5-3.3-3.3-5.8-6.7-5.8-3.1 0-5.8 2.2-6.5 5.1-2.4.2-4.3 2.2-4.3 4.6 0 2.3 1.8 4.1 4.1 4.1h-1.7z"
        fill="url(#csx-mark)"
        fillOpacity="0.18"
        stroke="url(#csx-mark)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M20 22.6V13.4" stroke="#2FD8F0" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16.8 16.4 20 13.2l3.2 3.2" stroke="#2FD8F0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
