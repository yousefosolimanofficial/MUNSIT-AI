"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import { ROUTES } from "@/i18n/routes";
import type { AuthFailure } from "@/types/auth";

import { evaluatePasswordRules, type PasswordRuleId } from "../model/password-rules";
import {
  registerSchema,
  type RegisterOutput,
  type RegisterValidationKey,
} from "../schemas/register";
import { AuthButtonLink } from "./AuthButtonLink";
import { AuthCardFooter, AuthFormCard } from "./AuthFormCard";
import { AuthPasswordField } from "./AuthPasswordField";
import { AuthResultView } from "./AuthResultView";
import { AuthStatusBanner } from "./AuthStatusBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthTextField } from "./AuthTextField";
import { AuthTextLink } from "./AuthTextLink";
import { PasswordRuleList, type PasswordRuleState } from "./PasswordRule";

/*
 * Register (Phase 08 Increment 3, contract §3–§6; Figma `67:14` and the states in §3.1, each at
 * 1440 / 768 / 390). "UI-complete, not functional": the values go to the injected adapter and
 * nowhere else. In production code the adapter is always the fail-closed `placeholderAuthAdapter`
 * (the default; the route passes none), so a valid submit shows Loading, then "إنشاء الحساب غير
 * متاح حاليًا." in the status banner (R-3). Nothing navigates, stores or logs a value.
 *
 * Card (gap 28): header, the status banner (only after a server-side result), Fields (gap 16: name,
 * email, password, the live rules row, confirm), the submit button, the footer link to Login.
 *
 * - Validation: first on blur, then on every change (errors clear as soon as the value is valid).
 *   Submitting with errors focuses the first invalid field; the button stays enabled (as L-2).
 * - Rules (R-2): all Neutral while the password is empty; met rules Valid and unmet rules Neutral
 *   while typing; once the password is checked with unmet rules, those turn Error.
 * - Confirm (R-9): once confirm has been touched, changing the password re-checks the match.
 * - Two independent toggles, each with the approved name and described by its field label (R-6
 *   interim).
 * - Results: `unavailable` (and any failure without Register copy) → the unavailable banner, button
 *   unchanged; `rejected` → "تعذر إنشاء الحساب. جرّب تاني." and "إعادة المحاولة"; `ok` → the Success
 *   view (only reachable with a preview fixture, R-4), with focus moved to its heading.
 */

export interface RegisterFormCopy {
  heading: string;
  description: string;
  name: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  confirm: string;
  passwordPlaceholderHidden: string;
  passwordPlaceholderShown: string;
  showPassword: string;
  submit: string;
  submitting: string;
  retry: string;
  hasAccount: string;
  login: string;
  rules: Readonly<Record<PasswordRuleId, ReactNode>>;
  ruleStatus: { met: string; notMet: string };
  validation: Record<RegisterValidationKey, string>;
  unavailable: string;
  failed: string;
  success: { heading: string; body: string };
}

export interface RegisterFormProps {
  copy: RegisterFormCopy;
  /** Defaults to the fail-closed placeholder. Only the development preview passes a fixture. */
  adapter?: AuthAdapter;
}

type Outcome = "idle" | "unavailable" | "rejected" | "success";

function outcomeOf(failure: AuthFailure): Outcome {
  return failure === "rejected" ? "rejected" : "unavailable";
}

export function RegisterForm({ copy, adapter = placeholderAuthAdapter }: RegisterFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const inFlight = useRef(false);
  const headingId = useId();
  const successHeadingId = useId();
  const rulesId = useId();

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const password = useWatch({ control, name: "password" });

  useEffect(() => {
    if (outcome === "success") document.getElementById(successHeadingId)?.focus();
  }, [outcome, successHeadingId]);

  const errorText = (key: string | undefined) =>
    key !== undefined && Object.hasOwn(copy.validation, key)
      ? copy.validation[key as RegisterValidationKey]
      : undefined;

  const passwordChecked = errors.password !== undefined;
  const rules = evaluatePasswordRules(password).map(({ id, met }) => {
    const state: PasswordRuleState =
      password === "" ? "neutral" : met ? "valid" : passwordChecked ? "error" : "neutral";
    return {
      id,
      label: copy.rules[id],
      state,
      statusLabel: met ? copy.ruleStatus.met : copy.ruleStatus.notMet,
    };
  });

  const submit = async ({ name, email, password: value }: RegisterOutput) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setOutcome("idle");
    try {
      const result = await adapter.register({ name, email, password: value });
      setOutcome(result.ok ? "success" : outcomeOf(result.failure));
    } catch {
      // Fail closed: an unexpected adapter error is shown as "unavailable", never as success.
      setOutcome("unavailable");
    } finally {
      inFlight.current = false;
    }
  };

  const footer = (
    <AuthCardFooter
      text={copy.hasAccount}
      link={<AuthTextLink href={ROUTES["auth.login"]}>{copy.login}</AuthTextLink>}
    />
  );

  if (outcome === "success") {
    return (
      <AuthResultView
        heading={copy.success.heading}
        body={copy.success.body}
        headingId={successHeadingId}
        actions={<AuthButtonLink href={ROUTES["auth.login"]}>{copy.login}</AuthButtonLink>}
        footer={footer}
      />
    );
  }

  // Registered in visual order: React Hook Form focuses the first invalid field in this order.
  const nameField = register("name");
  const emailField = register("email");
  const passwordField = register("password");
  const confirmField = register("confirm");
  const banner =
    outcome === "unavailable" ? copy.unavailable : outcome === "rejected" ? copy.failed : null;

  return (
    <AuthFormCard
      heading={copy.heading}
      description={copy.description}
      headingId={headingId}
      footer={footer}
    >
      <form
        noValidate
        aria-labelledby={headingId}
        onSubmit={(event) => void handleSubmit(submit, () => setOutcome("idle"))(event)}
        data-register-form=""
        className="flex flex-col gap-7"
      >
        <AuthStatusBanner message={banner} />
        <div className="flex flex-col gap-4">
          <AuthTextField
            {...nameField}
            label={copy.name}
            autoComplete="name"
            placeholder={copy.name}
            error={errorText(errors.name?.message)}
          />
          <AuthTextField
            {...emailField}
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
          <AuthPasswordField
            {...passwordField}
            onChange={(event) => {
              void passwordField.onChange(event);
              if (getFieldState("confirm").isTouched) void trigger("confirm");
            }}
            label={copy.password}
            autoComplete="new-password"
            placeholder={
              passwordVisible ? copy.passwordPlaceholderShown : copy.passwordPlaceholderHidden
            }
            visible={passwordVisible}
            onVisibleChange={setPasswordVisible}
            toggleLabel={copy.showPassword}
            aria-describedby={rulesId}
            error={errorText(errors.password?.message)}
          />
          <PasswordRuleList id={rulesId} rules={rules} />
          <AuthPasswordField
            {...confirmField}
            label={copy.confirm}
            autoComplete="new-password"
            placeholder={
              confirmVisible ? copy.passwordPlaceholderShown : copy.passwordPlaceholderHidden
            }
            visible={confirmVisible}
            onVisibleChange={setConfirmVisible}
            toggleLabel={copy.showPassword}
            error={errorText(errors.confirm?.message)}
          />
        </div>
        <AuthSubmitButton loading={isSubmitting} loadingLabel={copy.submitting}>
          {outcome === "rejected" ? copy.retry : copy.submit}
        </AuthSubmitButton>
      </form>
    </AuthFormCard>
  );
}
