/*
 * Password visibility icon (Phase 08 Increment 1). Geometry from the Figma frame `Icon / Eye`
 * inside `Auth / Password Input` (`191:24`, and `2490:2293` with the `Hidden Slash`): a 20 × 20
 * eye outline with a 1.5 inside stroke (drawn here as the equivalent centred 1.5 stroke), a 2.5
 * pupil and, while the password is shown, a 1.6 diagonal slash. Auth-local: the frame is not one
 * of the official `Icon / *` components, so it is not added to the icon manifest. `currentColor`;
 * never mirrored.
 */
export function AuthEyeIcon({ slashed, className }: { slashed: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-icon={slashed ? "eye-slashed" : "eye"}
      className={className}
    >
      <ellipse cx="10" cy="10" rx="8.25" ry="4.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
      {slashed ? (
        <path d="M3 17L17 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}
