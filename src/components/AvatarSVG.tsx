interface AvatarSVGProps {
  type: string;
  className?: string;
}

const AvatarSVG = ({ type, className = "w-full h-full" }: AvatarSVGProps) => {
  const avatars = {
    avatar1: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4A261" />
            <stop offset="100%" stopColor="#E76F51" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#2A9D8F" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin1)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin1)" />
        <circle cx="45" cy="32" r="2" fill="#264653" />
        <circle cx="55" cy="32" r="2" fill="#264653" />
        <path d="M45 38 Q50 42 55 38" stroke="#264653" strokeWidth="2" fill="none" />
        <path d="M40 28 Q50 25 60 28" stroke="#8B4513" strokeWidth="3" fill="none" />
      </svg>
    ),
    avatar2: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE0BD" />
            <stop offset="100%" stopColor="#FFCBA4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#E9C46A" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin2)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin2)" />
        <circle cx="45" cy="32" r="2" fill="#2F4F4F" />
        <circle cx="55" cy="32" r="2" fill="#2F4F4F" />
        <path d="M45 38 Q50 42 55 38" stroke="#2F4F4F" strokeWidth="2" fill="none" />
        <path d="M35 25 Q50 20 65 25" stroke="#F4A261" strokeWidth="4" fill="none" />
      </svg>
    ),
    avatar3: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="100%" stopColor="#F5DEB3" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#264653" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin3)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin3)" />
        <circle cx="45" cy="32" r="2" fill="#1A1A1A" />
        <circle cx="55" cy="32" r="2" fill="#1A1A1A" />
        <path d="M45 38 Q50 42 55 38" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        <path d="M42 28 Q50 26 58 28" stroke="#2F4F4F" strokeWidth="3" fill="none" />
      </svg>
    ),
    avatar4: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2B48C" />
            <stop offset="100%" stopColor="#BC9A6A" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#E76F51" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin4)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin4)" />
        <circle cx="45" cy="32" r="2" fill="#4A4A4A" />
        <circle cx="55" cy="32" r="2" fill="#4A4A4A" />
        <path d="M45 38 Q50 42 55 38" stroke="#4A4A4A" strokeWidth="2" fill="none" />
        <path d="M38 25 Q50 22 62 25" stroke="#8B4513" strokeWidth="4" fill="none" />
      </svg>
    ),
    avatar5: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBCB4" />
            <stop offset="100%" stopColor="#F8AFA6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#F4A261" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin5)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin5)" />
        <circle cx="45" cy="32" r="2" fill="#2E8B57" />
        <circle cx="55" cy="32" r="2" fill="#2E8B57" />
        <path d="M45 38 Q50 42 55 38" stroke="#2E8B57" strokeWidth="2" fill="none" />
        <path d="M40 28 Q50 25 60 28" stroke="#CD853F" strokeWidth="3" fill="none" />
      </svg>
    ),
    avatar6: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5DEB3" />
            <stop offset="100%" stopColor="#DEB887" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#2A9D8F" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin6)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin6)" />
        <circle cx="45" cy="32" r="2" fill="#2F4F4F" />
        <circle cx="55" cy="32" r="2" fill="#2F4F4F" />
        <path d="M45 38 Q50 42 55 38" stroke="#2F4F4F" strokeWidth="2" fill="none" />
        <path d="M36 24 Q50 20 64 24" stroke="#1A1A1A" strokeWidth="4" fill="none" />
      </svg>
    ),
    avatar7: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#654321" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#E9C46A" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin7)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin7)" />
        <circle cx="45" cy="32" r="2" fill="#F5F5F5" />
        <circle cx="55" cy="32" r="2" fill="#F5F5F5" />
        <circle cx="45" cy="32" r="1" fill="#1A1A1A" />
        <circle cx="55" cy="32" r="1" fill="#1A1A1A" />
        <path d="M45 38 Q50 42 55 38" stroke="#F5F5F5" strokeWidth="2" fill="none" />
        <path d="M42 28 Q50 26 58 28" stroke="#2F4F4F" strokeWidth="3" fill="none" />
      </svg>
    ),
    avatar8: (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#264653" opacity="0.1" />
        <circle cx="50" cy="35" r="15" fill="url(#skin8)" />
        <circle cx="50" cy="65" r="20" fill="url(#skin8)" />
        <circle cx="45" cy="32" r="2" fill="#FFFAF0" />
        <circle cx="55" cy="32" r="2" fill="#FFFAF0" />
        <circle cx="45" cy="32" r="1" fill="#2F4F4F" />
        <circle cx="55" cy="32" r="1" fill="#2F4F4F" />
        <path d="M45 38 Q50 42 55 38" stroke="#FFFAF0" strokeWidth="2" fill="none" />
        <path d="M38 25 Q50 22 62 25" stroke="#8B4513" strokeWidth="4" fill="none" />
      </svg>
    )
  };

  return avatars[type as keyof typeof avatars] || avatars.avatar1;
};

export default AvatarSVG;