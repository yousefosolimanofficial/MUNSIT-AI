"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import { ROUTES } from "@/i18n/routes";
import type { AuthFailure } from "@/types/auth";

import {
  forgotPasswordSchema,
  type ForgotPasswordOutput,
  type ForgotPasswordValidationKey,
  type ForgotPasswordValues,
} from "../schemas/forgot-password";
import { AuthButtonLink } from "./AuthButtonLink";
import { AuthFormCard } from "./AuthFormCard";
import { AuthResultView } from "./AuthResultView";
import { AuthStatusBanner } from "./AuthStatusBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthTextField } from "./AuthTextField";
import { AuthTextLink } from "./AuthTextLink";
import { FOCUS_RING } from "./auth-styles";

/*
 * Forgot Password (Phase 08 Recovery UI, START_HERE §2.1 / §2.3 / §5; Figma Default `67:25`,
 * Empty `2480:2741`, Invalid email `2480:2785`, Loading `2480:2829`, Failed `2480:2869`, Email sent
 * `2467:75582`, each at 1440 / 768 / 390). "UI-complete, not functional": the trimmed email goes
 * to the injected adapter and nowhere else. In production code the adapter is always the
 * fail-closed `placeholderAuthAdapter` (the default; the route passes none), so a valid submit
 * shows Loading, then "استعادة كلمة المرور غير متاحة حاليًا." in the status banner with the button
 * label unchanged (RC-1). Nothing navigates, stores or logs a value.
 *
 * Card (gap 28): header, the status banner (only while there is a message, above the field), the
 * email field, the button ("إعادة المحاولة" after a `rejected` result), the centred "back to login"
 * link. The Email sent view (`ok`) replaces the card and is reachable only with a preview adapter
 * fixture (RC-2); its heading takes focus.
 *
 * The form owns the card (unlike Login) because a result view replaces the whole card, header
 * included.
 */

export interface ForgotPasswordFormCopy {
  heading: string;
  description: string;
  email: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  retry: string;
  back: string;
  sent: { heading: string; body: string; resend: string };
  validation: Record<ForgotPasswordValidationKey, string>;
  /** Status-banner message per adapter failure (resolved by the screen). */
  failures: Record<AuthFailure, string>;
}

/** Development preview only: start values and an immediate check (the Empty / Invalid states). */
export interface ForgotPasswordInitialState {
  values?: Partial<ForgotPasswordValues>;
  validate?: boolean;
}

export interface ForgotPasswordFormProps {
  copy: ForgotPasswordFormCopy;
  /** Defaults to the fail-closed placeholder. Only the development preview passes a fixture. */
  adapter?: AuthAdapter;
  /** Development preview only; the route passes none. */
  initialState?: ForgotPasswordInitialState;
}

function isValidationKey(
  key: string | undefined,
  copy: ForgotPasswordFormCopy,
): key is ForgotPasswordValidationKey {
  return key !== undefined && Object.hasOwn(copy.validation, key);
}

export function ForgotPasswordForm({
  copy,
  adapter = placeholderAuthAdapter,
  initialState,
}: ForgotPasswordFormProps) {
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [sent, setSent] = useState(false);
  const inFlight = useRef(false);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const resultHeadingId = `${baseId}-result-heading`;
  const bannerId = `${baseId}-banner`;

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { email: "", ...initialState?.values },
  });

  const validateOnMount = initialState?.validate === true;
  useEffect(() => {
    if (validateOnMount) void trigger();
  }, [validateOnMount, trigger]);

  // Each result view moves focus to its heading (START_HERE §5).
  useEffect(() => {
    if (sent) document.getElementById(resultHeadingId)?.focus();
  }, [sent, resultHeadingId]);

  const errorText = (key: string | undefined) =>
    isValidationKey(key, copy) ? copy.validation[key] : undefined;

  const requestLink = async ({ email }: ForgotPasswordOutput) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFailure(null);
    try {
      const result = await adapter.requestPasswordReset({ email });
      if (result.ok) setSent(true);
      else setFailure(result.failure);
    } catch {
      // Fail closed: an unexpected adapter error is shown as "unavailable", never as success.
      setFailure("unavailable");
    } finally {
      inFlight.current = false;
    }
  };

  if (sent) {
    return (
      <AuthResultView
        tone={null}
        heading={copy.sent.heading}
        body={copy.sent.body}
        headingId={resultHeadingId}
        actions={<AuthButtonLink href={ROUTES["auth.login"]}>{copy.back}</AuthButtonLink>}
        footer={
          <p className="flex justify-center">
            {/*
             * RC-3 (owner, 2026-11-26): "إعادة إرسال الرابط" is displayed but stays inactive until
             * the backend provides a resend endpoint. It is focusable and announced as disabled,
             * and does nothing: no adapter call, no Loading, no message.
             */}
            <button
              type="button"
              aria-disabled="true"
              data-auth-resend=""
              className={`cursor-default rounded-sm py-0.5 text-auth-form-label text-accent-electric-sky ${FOCUS_RING}`}
            >
              {copy.sent.resend}
            </button>
          </p>
        }
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
        onSubmit={(event) => void handleSubmit(requestLink, () => setFailure(null))(event)}
        data-forgot-form=""
        className="flex flex-col gap-7"
      >
        <AuthStatusBanner id={bannerId} message={message} />
        <AuthTextField
          {...register("email")}
          label={copy.email}
          type="email"
          ltr
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={copy.emailPlaceholder}
          error={errorText(errors.email?.message)}
        />
        <AuthSubmitButton loading={isSubmitting} loadingLabel={copy.submitting}>
          {failure === "rejected" ? copy.retry : copy.submit}
        </AuthSubmitButton>
      </form>
    </AuthFormCard>
  );
}
