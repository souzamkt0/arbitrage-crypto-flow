interface AvatarSVGProps {
  type: string;
  className?: string;
}

const AvatarSVG = ({ type, className = "w-full h-full" }: AvatarSVGProps) => {
  const avatars = {
    avatar1: ( // Homem Executivo
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBCB4" />
            <stop offset="100%" stopColor="#F8AFA6" />
          </linearGradient>
          <linearGradient id="suit1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#F3F4F6" />
        {/* Terno */}
        <path d="M25 70 Q35 65 50 65 Q65 65 75 70 L75 95 L25 95 Z" fill="url(#suit1)" />
        <path d="M45 65 L55 65 L55 80 L45 80 Z" fill="#FFFFFF" />
        <path d="M48 68 L52 68 L52 78 L48 78 Z" fill="#DC2626" />
        {/* Cabeça */}
        <circle cx="50" cy="40" r="18" fill="url(#skin1)" />
        {/* Cabelo */}
        <path d="M32 32 Q50 25 68 32 Q68 40 65 45 Q50 42 35 45 Q32 40 32 32" fill="#4B5563" />
        {/* Olhos */}
        <circle cx="44" cy="38" r="2" fill="#1F2937" />
        <circle cx="56" cy="38" r="2" fill="#1F2937" />
        <circle cx="44" cy="37.5" r="0.5" fill="#FFFFFF" />
        <circle cx="56" cy="37.5" r="0.5" fill="#FFFFFF" />
        {/* Nariz */}
        <path d="M50 42 L48 45 L50 46 L52 45 Z" fill="#F87171" opacity="0.3" />
        {/* Boca */}
        <path d="M46 48 Q50 52 54 48" stroke="#DC2626" strokeWidth="1.5" fill="none" />
        {/* Óculos */}
        <circle cx="44" cy="38" r="6" fill="none" stroke="#374151" strokeWidth="1" />
        <circle cx="56" cy="38" r="6" fill="none" stroke="#374151" strokeWidth="1" />
        <path d="M50 38 L52 38" stroke="#374151" strokeWidth="1" />
      </svg>
    ),
    avatar2: ( // Mulher Executiva
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE0BD" />
            <stop offset="100%" stopColor="#FFCBA4" />
          </linearGradient>
          <linearGradient id="blazer2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#F9FAFB" />
        {/* Blazer */}
        <path d="M28 68 Q38 63 50 63 Q62 63 72 68 L72 95 L28 95 Z" fill="url(#blazer2)" />
        <path d="M46 63 L54 63 L54 78 L46 78 Z" fill="#FFFFFF" />
        {/* Cabeça */}
        <circle cx="50" cy="38" r="16" fill="url(#skin2)" />
        {/* Cabelo longo */}
        <path d="M30 30 Q50 22 70 30 Q72 50 68 65 Q60 68 50 65 Q40 68 32 65 Q28 50 30 30" fill="#F59E0B" />
        <path d="M35 28 Q50 20 65 28 Q65 45 60 55 Q50 52 40 55 Q35 45 35 28" fill="#FBBF24" />
        {/* Olhos com cílios */}
        <ellipse cx="44" cy="36" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="56" cy="36" rx="2.5" ry="2" fill="#1F2937" />
        <circle cx="44" cy="35.5" r="0.5" fill="#FFFFFF" />
        <circle cx="56" cy="35.5" r="0.5" fill="#FFFFFF" />
        {/* Cílios */}
        <path d="M42 33 L42 31" stroke="#1F2937" strokeWidth="0.5" />
        <path d="M44 32.5 L44 30.5" stroke="#1F2937" strokeWidth="0.5" />
        <path d="M46 33 L46 31" stroke="#1F2937" strokeWidth="0.5" />
        <path d="M54 33 L54 31" stroke="#1F2937" strokeWidth="0.5" />
        <path d="M56 32.5 L56 30.5" stroke="#1F2937" strokeWidth="0.5" />
        <path d="M58 33 L58 31" stroke="#1F2937" strokeWidth="0.5" />
        {/* Nariz */}
        <path d="M50 40 L49 42 L50 43 L51 42 Z" fill="#F87171" opacity="0.2" />
        {/* Batom */}
        <path d="M46 45 Q50 48 54 45" stroke="#DC2626" strokeWidth="2" fill="none" />
        {/* Brincos */}
        <circle cx="36" cy="42" r="2" fill="#FCD34D" />
        <circle cx="64" cy="42" r="2" fill="#FCD34D" />
      </svg>
    ),
    avatar3: ( // Homem Jovem Casual
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5DEB3" />
            <stop offset="100%" stopColor="#DEB887" />
          </linearGradient>
          <linearGradient id="hoodie3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#ECFDF5" />
        {/* Moletom */}
        <path d="M22 75 Q30 65 50 65 Q70 65 78 75 L78 95 L22 95 Z" fill="url(#hoodie3)" />
        <path d="M40 65 Q50 60 60 65 L60 72 L40 72 Z" fill="#047857" />
        {/* Cabeça */}
        <circle cx="50" cy="42" r="17" fill="url(#skin3)" />
        {/* Cabelo estiloso */}
        <path d="M33 32 Q40 28 50 28 Q60 28 67 32 Q68 38 65 42 Q60 45 50 42 Q40 45 35 42 Q32 38 33 32" fill="#8B4513" />
        <path d="M35 30 Q45 25 55 25 Q65 28 67 32 Q65 35 60 38 Q50 35 40 38 Q35 35 35 30" fill="#A0522D" />
        {/* Olhos */}
        <circle cx="45" cy="40" r="2.5" fill="#1F2937" />
        <circle cx="55" cy="40" r="2.5" fill="#1F2937" />
        <circle cx="45" cy="39" r="0.8" fill="#FFFFFF" />
        <circle cx="55" cy="39" r="0.8" fill="#FFFFFF" />
        {/* Sobrancelhas */}
        <path d="M42 36 L48 36" stroke="#8B4513" strokeWidth="1.5" />
        <path d="M52 36 L58 36" stroke="#8B4513" strokeWidth="1.5" />
        {/* Nariz */}
        <path d="M50 44 L49 46 L50 47 L51 46 Z" fill="#F87171" opacity="0.3" />
        {/* Sorriso */}
        <path d="M45 50 Q50 54 55 50" stroke="#DC2626" strokeWidth="2" fill="none" />
        {/* Fones de ouvido */}
        <path d="M30 35 Q35 30 40 35" stroke="#1F2937" strokeWidth="3" fill="none" />
        <path d="M60 35 Q65 30 70 35" stroke="#1F2937" strokeWidth="3" fill="none" />
        <path d="M40 35 Q50 28 60 35" stroke="#1F2937" strokeWidth="2" fill="none" />
      </svg>
    ),
    avatar4: ( // Mulher Jovem Casual
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBCB4" />
            <stop offset="100%" stopColor="#F8AFA6" />
          </linearGradient>
          <linearGradient id="top4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#FDF2F8" />
        {/* Blusa */}
        <path d="M25 70 Q35 65 50 65 Q65 65 75 70 L75 95 L25 95 Z" fill="url(#top4)" />
        {/* Cabeça */}
        <circle cx="50" cy="40" r="16" fill="url(#skin4)" />
        {/* Cabelo com rabo de cavalo */}
        <path d="M32 28 Q50 20 68 28 Q70 40 65 48 Q50 45 35 48 Q30 40 32 28" fill="#7C2D12" />
        <ellipse cx="72" cy="35" rx="8" ry="15" fill="#7C2D12" />
        <path d="M35 25 Q50 18 65 25 Q65 35 60 42 Q50 40 40 42 Q35 35 35 25" fill="#A16207" />
        {/* Olhos grandes */}
        <ellipse cx="44" cy="38" rx="3" ry="3.5" fill="#1F2937" />
        <ellipse cx="56" cy="38" rx="3" ry="3.5" fill="#1F2937" />
        <circle cx="44" cy="37" r="1" fill="#FFFFFF" />
        <circle cx="56" cy="37" r="1" fill="#FFFFFF" />
        {/* Cílios longos */}
        <path d="M41 34 L40 32" stroke="#1F2937" strokeWidth="0.8" />
        <path d="M44 33.5 L44 31.5" stroke="#1F2937" strokeWidth="0.8" />
        <path d="M47 34 L48 32" stroke="#1F2937" strokeWidth="0.8" />
        <path d="M53 34 L52 32" stroke="#1F2937" strokeWidth="0.8" />
        <path d="M56 33.5 L56 31.5" stroke="#1F2937" strokeWidth="0.8" />
        <path d="M59 34 L60 32" stroke="#1F2937" strokeWidth="0.8" />
        {/* Nariz pequeno */}
        <path d="M50 42 L49.5 43.5 L50 44 L50.5 43.5 Z" fill="#F87171" opacity="0.2" />
        {/* Sorriso */}
        <path d="M46 47 Q50 50 54 47" stroke="#DC2626" strokeWidth="2" fill="none" />
        {/* Laço no cabelo */}
        <path d="M65 25 Q68 22 71 25 Q68 28 65 25" fill="#EC4899" />
        <path d="M71 25 Q74 22 77 25 Q74 28 71 25" fill="#EC4899" />
        <circle cx="71" cy="25" r="1.5" fill="#BE185D" />
      </svg>
    ),
    avatar5: ( // Homem Maduro Barbudo
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2B48C" />
            <stop offset="100%" stopColor="#BC9A6A" />
          </linearGradient>
          <linearGradient id="shirt5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#F3F4F6" />
        {/* Camisa */}
        <path d="M25 72 Q35 67 50 67 Q65 67 75 72 L75 95 L25 95 Z" fill="url(#shirt5)" />
        {/* Cabeça */}
        <circle cx="50" cy="42" r="18" fill="url(#skin5)" />
        {/* Cabelo com calvície */}
        <path d="M35 28 Q50 22 65 28 Q65 35 62 40 Q50 38 38 40 Q35 35 35 28" fill="#6B7280" />
        <path d="M40 26 Q50 20 60 26 Q60 32 58 36 Q50 34 42 36 Q40 32 40 26" fill="#9CA3AF" />
        {/* Barba */}
        <path d="M38 48 Q45 52 50 52 Q55 52 62 48 Q65 55 62 62 Q50 65 38 62 Q35 55 38 48" fill="#4B5563" />
        <path d="M40 50 Q45 54 50 54 Q55 54 60 50 Q62 56 60 60 Q50 63 40 60 Q38 56 40 50" fill="#6B7280" />
        {/* Olhos */}
        <circle cx="44" cy="40" r="2" fill="#1F2937" />
        <circle cx="56" cy="40" r="2" fill="#1F2937" />
        <circle cx="44" cy="39.5" r="0.5" fill="#FFFFFF" />
        <circle cx="56" cy="39.5" r="0.5" fill="#FFFFFF" />
        {/* Rugas */}
        <path d="M42 45 L46 45" stroke="#A78BFA" strokeWidth="0.5" opacity="0.5" />
        <path d="M54 45 L58 45" stroke="#A78BFA" strokeWidth="0.5" opacity="0.5" />
        {/* Nariz */}
        <path d="M50 44 L48 47 L50 48 L52 47 Z" fill="#F87171" opacity="0.3" />
        {/* Boca (escondida pela barba) */}
        <path d="M47 50 Q50 52 53 50" stroke="#DC2626" strokeWidth="1" fill="none" opacity="0.7" />
      </svg>
    ),
    avatar6: ( // Mulher Madura Elegante
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5DEB3" />
            <stop offset="100%" stopColor="#DEB887" />
          </linearGradient>
          <linearGradient id="dress6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#FAF5FF" />
        {/* Vestido */}
        <path d="M26 70 Q36 65 50 65 Q64 65 74 70 L74 95 L26 95 Z" fill="url(#dress6)" />
        {/* Cabeça */}
        <circle cx="50" cy="40" r="16" fill="url(#skin6)" />
        {/* Cabelo elegante */}
        <path d="M30 30 Q50 20 70 30 Q72 45 68 55 Q50 52 32 55 Q28 45 30 30" fill="#92400E" />
        <path d="M32 28 Q50 18 68 28 Q70 40 66 48 Q50 46 34 48 Q30 40 32 28" fill="#B45309" />
        {/* Coque */}
        <ellipse cx="50" cy="25" rx="12" ry="8" fill="#B45309" />
        {/* Olhos elegantes */}
        <ellipse cx="44" cy="38" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="56" cy="38" rx="2.5" ry="2" fill="#1F2937" />
        <circle cx="44" cy="37.5" r="0.5" fill="#FFFFFF" />
        <circle cx="56" cy="37.5" r="0.5" fill="#FFFFFF" />
        {/* Delineador */}
        <path d="M41 36 L47 36" stroke="#1F2937" strokeWidth="1" />
        <path d="M53 36 L59 36" stroke="#1F2937" strokeWidth="1" />
        {/* Nariz refinado */}
        <path d="M50 42 L49.5 43.5 L50 44 L50.5 43.5 Z" fill="#F87171" opacity="0.2" />
        {/* Batom elegante */}
        <path d="M46 46 Q50 49 54 46" stroke="#B91C1C" strokeWidth="2" fill="none" />
        {/* Colar */}
        <circle cx="50" cy="58" r="3" fill="#FCD34D" />
        <path d="M40 56 Q50 52 60 56" stroke="#FCD34D" strokeWidth="2" fill="none" />
        {/* Brincos de pérola */}
        <circle cx="34" cy="42" r="2.5" fill="#F3F4F6" />
        <circle cx="66" cy="42" r="2.5" fill="#F3F4F6" />
      </svg>
    ),
    avatar7: ( // Homem Atlético
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#654321" />
          </linearGradient>
          <linearGradient id="tank7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#FEF2F2" />
        {/* Regata */}
        <path d="M30 70 Q40 65 50 65 Q60 65 70 70 L70 95 L30 95 Z" fill="url(#tank7)" />
        <path d="M35 65 Q40 62 50 62 Q60 62 65 65 L65 72 L35 72 Z" fill="#991B1B" />
        {/* Músculos */}
        <ellipse cx="40" cy="70" rx="6" ry="10" fill="#7F1D1D" opacity="0.3" />
        <ellipse cx="60" cy="70" rx="6" ry="10" fill="#7F1D1D" opacity="0.3" />
        {/* Cabeça */}
        <circle cx="50" cy="42" r="17" fill="url(#skin7)" />
        {/* Cabelo curto */}
        <path d="M33 30 Q50 25 67 30 Q67 38 64 42 Q50 40 36 42 Q33 38 33 30" fill="#1F2937" />
        {/* Olhos determinados */}
        <circle cx="44" cy="40" r="2" fill="#FFFFFF" />
        <circle cx="56" cy="40" r="2" fill="#FFFFFF" />
        <circle cx="44" cy="40" r="1.5" fill="#1F2937" />
        <circle cx="56" cy="40" r="1.5" fill="#1F2937" />
        <circle cx="44" cy="39.5" r="0.5" fill="#FFFFFF" />
        <circle cx="56" cy="39.5" r="0.5" fill="#FFFFFF" />
        {/* Sobrancelhas marcantes */}
        <path d="M41 37 L47 37" stroke="#1F2937" strokeWidth="2" />
        <path d="M53 37 L59 37" stroke="#1F2937" strokeWidth="2" />
        {/* Nariz */}
        <path d="M50 44 L48 47 L50 48 L52 47 Z" fill="#F87171" opacity="0.4" />
        {/* Sorriso confiante */}
        <path d="M45 49 Q50 53 55 49" stroke="#DC2626" strokeWidth="2" fill="none" />
        {/* Cicatriz */}
        <path d="M52 35 L54 37" stroke="#B45309" strokeWidth="1" />
      </svg>
    ),
    avatar8: ( // Mulher Artista
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="skin8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          <linearGradient id="top8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#FFFBEB" />
        {/* Blusa artística */}
        <path d="M24 72 Q34 67 50 67 Q66 67 76 72 L76 95 L24 95 Z" fill="url(#top8)" />
        {/* Padrão artístico */}
        <circle cx="35" cy="75" r="3" fill="#B45309" opacity="0.7" />
        <circle cx="50" cy="78" r="2" fill="#B45309" opacity="0.7" />
        <circle cx="65" cy="75" r="3" fill="#B45309" opacity="0.7" />
        {/* Cabeça */}
        <circle cx="50" cy="40" r="16" fill="url(#skin8)" />
        {/* Cabelo afro */}
        <circle cx="50" cy="32" r="22" fill="#2D1B69" />
        <circle cx="45" cy="28" r="8" fill="#3730A3" />
        <circle cx="55" cy="28" r="8" fill="#3730A3" />
        <circle cx="40" cy="35" r="6" fill="#3730A3" />
        <circle cx="60" cy="35" r="6" fill="#3730A3" />
        <circle cx="50" cy="24" r="6" fill="#3730A3" />
        {/* Olhos expressivos */}
        <ellipse cx="44" cy="38" rx="3" ry="2.5" fill="#FFFFFF" />
        <ellipse cx="56" cy="38" rx="3" ry="2.5" fill="#FFFFFF" />
        <circle cx="44" cy="38" r="2" fill="#1F2937" />
        <circle cx="56" cy="38" r="2" fill="#1F2937" />
        <circle cx="44" cy="37" r="0.8" fill="#FFFFFF" />
        <circle cx="56" cy="37" r="0.8" fill="#FFFFFF" />
        {/* Nariz */}
        <path d="M50 42 L49 44 L50 45 L51 44 Z" fill="#F87171" opacity="0.3" />
        {/* Sorriso criativo */}
        <path d="M45 47 Q50 51 55 47" stroke="#DC2626" strokeWidth="2" fill="none" />
        {/* Brincos criativos */}
        <path d="M32 42 L34 46 L36 42" stroke="#F59E0B" strokeWidth="2" fill="none" />
        <path d="M64 42 L66 46 L68 42" stroke="#F59E0B" strokeWidth="2" fill="none" />
        {/* Bandana */}
        <path d="M30 38 Q50 32 70 38" stroke="#F59E0B" strokeWidth="3" fill="none" />
        <circle cx="70" cy="38" r="2" fill="#F59E0B" />
      </svg>
    )
  };

  return avatars[type as keyof typeof avatars] || avatars.avatar1;
};

export default AvatarSVG;