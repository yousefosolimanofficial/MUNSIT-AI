/*
 * Pause icon (P07-D16): two vertical bars, drawn in the style of the official icon set (24 × 24
 * viewBox, outlined, 1.75 non-scaling stroke, round joins, `currentColor`), so it pairs with the
 * set's `play` (Figma `2205:83`). Landing-local: the official set is exported from Figma and this
 * icon is not in it. No icon dependency. Never mirrored.
 */
export function PauseIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-icon="pause"
      className={className}
    >
      {[6, 14].map((x) => (
        <rect
          key={x}
          x={x}
          y={4}
          width={4}
          height={16}
          rx={1}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
