"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import { ROUTES } from "@/i18n/routes";
import type { AuthFailure } from "@/types/auth";

import { evaluatePasswordRules, type PasswordRuleId } from "../model/password-rules";
import {
  resetPasswordSchema,
  type ResetPasswordOutput,
  type ResetPasswordValidationKey,
  type ResetPasswordValues,
} from "../schemas/reset-password";
import { AuthButtonLink } from "./AuthButtonLink";
import { AuthFormCard } from "./AuthFormCard";
import { AuthPasswordField } from "./AuthPasswordField";
import { AuthResultView, type AuthResultTone } from "./AuthResultView";
import { AuthStatusBanner } from "./AuthStatusBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthTextLink } from "./AuthTextLink";
import { PasswordRuleList, type PasswordRuleState } from "./PasswordRule";

/*
 * Reset Password (Phase 08 Recovery UI, START_HERE §2.2 / §2.3 / §5; Figma Default `2480:345`,
 * Shown both `2480:403`, new only `2550:2872`, confirm only `2550:2927`, Required `2480:461`,
 * Mismatch `2480:535`, Loading `2480:601`, Error `2480:659`, Invalid link `2480:724`, Expired link
 * `2480:770`, Updated `2480:816`, each at 1440 / 768 / 390). "UI-complete, not functional": the
 * adapter receives `{ token, password }` and never the confirmation. In production code the
 * adapter is always the fail-closed `placeholderAuthAdapter`, so a valid submit shows Loading, then
 * "إعادة تعيين كلمة المرور غير متاحة حاليًا." in the status banner with the button label unchanged
 * (RC-1). Nothing navigates, stores or logs a value.
 *
 * RC-4 (owner, 2026-11-26): no reset-token handling yet. The route reads nothing from the URL; the
 * optional `token` prop is passed through as `token ?? ""` and is never parsed, shown, logged or
 * stored.
 *
 * Card (gap 28): header, the status banner (above the fields), Fields (gap 14: new password, the
 * rules row, confirm), the button ("إعادة المحاولة" after `rejected`), the centred "back to
 * login" link. The Updated, Invalid link and Expired link views replace the card and are reachable
 * only with preview adapter fixtures (RC-2); each heading takes focus.
 *
 * Rules (Register R-2): all Neutral while the field is empty; met rules turn Valid while typing;
 * unmet rules stay Neutral until the field has been checked (blur or submit), then turn Error. The
 * Figma drawing of the length rule as Valid while empty is ignored (RC-5).
 */

export interface ResetPasswordFormCopy {
  heading: string;
  description: string;
  password: string;
  confirm: string;
  /** Placeholder while a password is hidden ("••••••••") and shown ("اكتب كلمة المرور"). */
  passwordPlaceholderHidden: string;
  passwordPlaceholderShown: string;
  /** Constant toggle name; `aria-pressed` gives the state, the field label describes it. */
  showPassword: string;
  submit: string;
  submitting: string;
  retry: string;
  back: string;
  rules: Readonly<Record<PasswordRuleId, ReactNode>>;
  ruleStatus: { met: string; notMet: string };
  updated: { heading: string; body: string };
  invalidLink: { heading: string; body: string; request: string };
  expiredLink: { heading: string; body: string; request: string };
  validation: Record<ResetPasswordValidationKey, string>;
  /** Status-banner message per adapter failure (resolved by the screen). */
  failures: Record<AuthFailure, string>;
}

/** Development preview only: start values, visibility and an immediate check. */
export interface ResetPasswordInitialState {
  values?: Partial<ResetPasswordValues>;
  visible?: { newPassword?: boolean; confirmPassword?: boolean };
  validate?: boolean;
}

export interface ResetPasswordFormProps {
  copy: ResetPasswordFormCopy;
  /** Opaque reset token (RC-4): passed to the adapter as `token ?? ""`, never read otherwise. */
  token?: string;
  /** Defaults to the fail-closed placeholder. Only the development preview passes a fixture. */
  adapter?: AuthAdapter;
  /** Development preview only; the route passes none. */
  initialState?: ResetPasswordInitialState;
}

type ResultView = "updated" | "invalid-link" | "expired-link";

function isValidationKey(
  key: string | undefined,
  copy: ResetPasswordFormCopy,
): key is ResetPasswordValidationKey {
  return key !== undefined && Object.hasOwn(copy.validation, key);
}

export function ResetPasswordForm({
  copy,
  token,
  adapter = placeholderAuthAdapter,
  initialState,
}: ResetPasswordFormProps) {
  const [newVisible, setNewVisible] = useState(initialState?.visible?.newPassword ?? false);
  const [confirmVisible, setConfirmVisible] = useState(
    initialState?.visible?.confirmPassword ?? false,
  );
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [view, setView] = useState<ResultView | null>(null);
  const inFlight = useRef(false);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const resultHeadingId = `${baseId}-result-heading`;
  const bannerId = `${baseId}-banner`;
  const rulesId = `${baseId}-rules`;

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getFieldState,
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { newPassword: "", confirmPassword: "", ...initialState?.values },
  });

  const newPassword = useWatch({ control, name: "newPassword" });

  const validateOnMount = initialState?.validate === true;
  useEffect(() => {
    if (validateOnMount) void trigger();
  }, [validateOnMount, trigger]);

  // Each result view moves focus to its heading (START_HERE §5).
  useEffect(() => {
    if (view) document.getElementById(resultHeadingId)?.focus();
  }, [view, resultHeadingId]);

  const errorText = (key: string | undefined) =>
    isValidationKey(key, copy) ? copy.validation[key] : undefined;

  // Unmet rules turn Error once the field has been checked: blurred, submitted, or validated.
  const rulesChecked =
    Boolean(touchedFields.newPassword) || isSubmitted || Boolean(errors.newPassword);
  const rules = evaluatePasswordRules(newPassword).map(({ id, met }) => {
    const state: PasswordRuleState =
      newPassword === "" ? "neutral" : met ? "valid" : rulesChecked ? "error" : "neutral";
    return {
      id,
      label: copy.rules[id],
      state,
      statusLabel: met ? copy.ruleStatus.met : copy.ruleStatus.notMet,
    };
  });

  const resetPassword = async ({ newPassword: password }: ResetPasswordOutput) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFailure(null);
    try {
      // Only the token and the new password: the confirmation never leaves the form (§5).
      const result = await adapter.resetPassword({ token: token ?? "", password });
      if (result.ok) setView("updated");
      else if (result.failure === "invalid-link" || result.failure === "expired-link")
        setView(result.failure);
      else setFailure(result.failure);
    } catch {
      // Fail closed: an unexpected adapter error is shown as "unavailable", never as success.
      setFailure("unavailable");
    } finally {
      inFlight.current = false;
    }
  };

  if (view) {
    const backLink = (
      <p className="flex justify-center">
        <AuthTextLink href={ROUTES["auth.login"]}>{copy.back}</AuthTextLink>
      </p>
    );
    const views: Record<
      ResultView,
      {
        tone: AuthResultTone;
        heading: string;
        body: string;
        actions: ReactNode;
        footer?: ReactNode;
      }
    > = {
      updated: {
        tone: "success",
        heading: copy.updated.heading,
        body: copy.updated.body,
        actions: <AuthButtonLink href={ROUTES["auth.login"]}>{copy.back}</AuthButtonLink>,
      },
      "invalid-link": {
        tone: "danger",
        heading: copy.invalidLink.heading,
        body: copy.invalidLink.body,
        actions: (
          <AuthButtonLink href={ROUTES["auth.forgotPassword"]}>
            {copy.invalidLink.request}
          </AuthButtonLink>
        ),
        footer: backLink,
      },
      "expired-link": {
        tone: "warning",
        heading: copy.expiredLink.heading,
        body: copy.expiredLink.body,
        actions: (
          <AuthButtonLink href={ROUTES["auth.forgotPassword"]}>
            {copy.expiredLink.request}
          </AuthButtonLink>
        ),
        footer: backLink,
      },
    };
    const current = views[view];
    return (
      <AuthResultView
        tone={current.tone}
        heading={current.heading}
        body={current.body}
        headingId={resultHeadingId}
        actions={current.actions}
        footer={current.footer}
      />
    );
  }

  const message = failure ? copy.failures[failure] : null;

  return (
    <AuthFormCard
      heading={copy.heading}
      description={copy.description}
      headingId={headingId}
      footer={
        <p className="flex justify-center">
          <AuthTextLink href={ROUTES["auth.login"]}>{copy.back}</AuthTextLink>
        </p>
      }
    >
      <form
        noValidate
        aria-labelledby={headingId}
        onSubmit={(event) => void handleSubmit(resetPassword, () => setFailure(null))(event)}
        data-reset-form=""
        className="flex flex-col gap-7"
      >
        <AuthStatusBanner id={bannerId} message={message} />
        {/* Fields gap 14, as drawn in Figma (rules at y 95 = 81 + 14; owner decision 2026-11-28,
            design-values.md §17). Keeps the Reset card at the Figma 434. */}
        <div className="flex flex-col gap-3.5">
          <AuthPasswordField
            {...register("newPassword", {
              // Register R-9: once the confirmation has been touched, a change to the new
              // password re-checks the match.
              onChange: () => {
                if (getFieldState("confirmPassword").isTouched) void trigger("confirmPassword");
              },
            })}
            label={copy.password}
            autoComplete="new-password"
            placeholder={
              newVisible ? copy.passwordPlaceholderShown : copy.passwordPlaceholderHidden
            }
            visible={newVisible}
            onVisibleChange={setNewVisible}
            toggleLabel={copy.showPassword}
            aria-describedby={rulesId}
            error={errorText(errors.newPassword?.message)}
          />
          <PasswordRuleList id={rulesId} rules={rules} />
          <AuthPasswordField
            {...register("confirmPassword")}
            label={copy.confirm}
            autoComplete="new-password"
            placeholder={
              confirmVisible ? copy.passwordPlaceholderShown : copy.passwordPlaceholderHidden
            }
            visible={confirmVisible}
            onVisibleChange={setConfirmVisible}
            toggleLabel={copy.showPassword}
            error={errorText(errors.confirmPassword?.message)}
          />
        </div>
        <AuthSubmitButton loading={isSubmitting} loadingLabel={copy.submitting}>
          {failure === "rejected" ? copy.retry : copy.submit}
        </AuthSubmitButton>
      </form>
    </AuthFormCard>
  );
}
