interface GlrLogoProps {
  size?: number
  color?: string
  textColor?: string
  showText?: boolean
}

export default function GlrLogo({
  size = 40,
  color = '#8DC63F',
  textColor = '#ffffff',
  showText = true,
}: GlrLogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Lightbulb with house SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lightbulb body */}
        <path
          d="M24 4C15.163 4 8 11.163 8 20c0 5.523 2.667 10.416 6.77 13.527L16 36v4a2 2 0 002 2h12a2 2 0 002-2v-4l1.23-2.473C37.333 30.416 40 25.523 40 20c0-8.837-7.163-16-16-16z"
          fill={color}
          opacity="0.15"
        />
        <path
          d="M24 4C15.163 4 8 11.163 8 20c0 5.523 2.667 10.416 6.77 13.527L16 36v4a2 2 0 002 2h12a2 2 0 002-2v-4l1.23-2.473C37.333 30.416 40 25.523 40 20c0-8.837-7.163-16-16-16z"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        {/* Screw threads / base lines */}
        <line x1="18" y1="38" x2="30" y2="38" stroke={color} strokeWidth="1.5" />
        <line x1="19" y1="41" x2="29" y2="41" stroke={color} strokeWidth="1.5" />
        {/* House inside lightbulb */}
        <path
          d="M24 13L15 21h3v8h5v-5h2v5h5v-8h3L24 13z"
          fill={color}
          stroke={color}
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        {/* Glow lines */}
        <line x1="8" y1="10" x2="5" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="10" x2="43" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="20" x2="2" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="43" y1="20" x2="46" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-heading font-bold tracking-widest text-xs"
            style={{ color: textColor, letterSpacing: '0.15em' }}
          >
            GREEN LIGHT
          </span>
          <div className="flex items-center gap-1">
            <span
              className="font-light tracking-widest text-xs"
              style={{ color: textColor, letterSpacing: '0.15em' }}
            >
              REALTY
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
