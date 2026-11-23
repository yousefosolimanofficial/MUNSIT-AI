/*
 * Password rules (Phase 08 Increment 1): the single source for the Zod schema and for the
 * on-screen rule list (`PasswordRule`), so the two cannot drift.
 *
 * The three rules are the ones Figma shows on Register and Reset Password (frames `67:14`,
 * `2480:345`), in reading order: the list is right-aligned in RTL and "8 أحرف على الأقل" is the
 * rightmost item, then "حرف كبير وحرف صغير", then "رقم واحد على الأقل". They are UI rules only: the real policy belongs to the backend
 * (gate D-02, risk R08-2) and is aligned in Phase 21.
 */

export const PASSWORD_RULE_IDS = ["length", "case", "digit"] as const;
export type PasswordRuleId = (typeof PASSWORD_RULE_IDS)[number];

/** Minimum length shown in Figma: "8 أحرف على الأقل". */
export const PASSWORD_MIN_LENGTH = 8;

const TESTS: Readonly<Record<PasswordRuleId, (value: string) => boolean>> = {
  /** "رقم واحد على الأقل" — at least one digit (ASCII or Arabic-Indic). */
  digit: (value) => /[0-9٠-٩]/.test(value),
  /** "حرف كبير وحرف صغير" — at least one upper-case and one lower-case letter. */
  case: (value) => /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value),
  /** "8 أحرف على الأقل" — at least 8 characters. */
  length: (value) => [...value].length >= PASSWORD_MIN_LENGTH,
};

/** Whether `value` meets one rule. */
export function meetsPasswordRule(id: PasswordRuleId, value: string): boolean {
  return TESTS[id](value);
}

/** Every rule with its result, in display order. */
export function evaluatePasswordRules(
  value: string,
): readonly { id: PasswordRuleId; met: boolean }[] {
  return PASSWORD_RULE_IDS.map((id) => ({ id, met: TESTS[id](value) }));
}

/** Whether `value` meets every rule. */
export function meetsAllPasswordRules(value: string): boolean {
  return PASSWORD_RULE_IDS.every((id) => TESTS[id](value));
}
