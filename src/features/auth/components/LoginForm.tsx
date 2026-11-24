"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import { ROUTES } from "@/i18n/routes";
import type { AuthFailure } from "@/types/auth";

import { loginSchema, type LoginOutput, type LoginValidationKey } from "../schemas/login";
import { AuthErrorBanner } from "./AuthFormCard";
import { AuthPasswordField } from "./AuthPasswordField";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthTextField } from "./AuthTextField";
import { AuthTextLink } from "./AuthTextLink";

/*
 * Login form (Phase 08 Increment 2, contract §3; Figma Default `67:3`, Password shown `2541:2980`,
 * Loading `2480:2916`, Error `2467:75609`, each at 1440 / 768 / 390). "UI-complete, not
 * functional": the values go to the injected adapter and nowhere else. In production code the
 * adapter is always the fail-closed `placeholderAuthAdapter` (the default; the route passes none),
 * so a valid submit shows Loading, then "تسجيل الدخول غير متاح حاليًا.". Nothing navigates,
 * stores or logs a value.
 *
 * Order inside the card (gap 28): Fields (gap 20: email, password, "forgot" link at the inline
 * end), the error banner (only while there is a message), the submit button. Validation: first on
 * blur, then on every change, so an error clears as soon as the value is valid (L-2: the button
 * stays enabled; submitting with errors focuses the first invalid field). Loading uses the Figma
 * `Auth / Primary Button` State=Loading variant.
 */

export interface LoginFormCopy {
  email: string;
  emailPlaceholder: string;
  password: string;
  /** Placeholder while the password is hidden ("••••••••") and shown ("اكتب كلمة المرور"). */
  passwordPlaceholderHidden: string;
  passwordPlaceholderShown: string;
  /** Constant toggle name; `aria-pressed` gives the state (Increment 1). */
  showPassword: string;
  forgot: string;
  submit: string;
  submitting: string;
  validation: Record<LoginValidationKey, string>;
  /** Form-level message per adapter failure (resolved by the screen). */
  failures: Record<AuthFailure, string>;
}

export interface LoginFormProps {
  copy: LoginFormCopy;
  /** The page heading, which names the form. */
  headingId?: string;
  /** Defaults to the fail-closed placeholder. Only the development preview passes a fixture. */
  adapter?: AuthAdapter;
}

function isValidationKey(key: string | undefined, copy: LoginFormCopy): key is LoginValidationKey {
  return key !== undefined && Object.hasOwn(copy.validation, key);
}

export function LoginForm({ copy, headingId, adapter = placeholderAuthAdapter }: LoginFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const inFlight = useRef(false);
  const bannerId = useId();
  // Figma Error: rejected credentials mark both fields (Coral Pulse 70%, no helper) and describe
  // them with the banner. "unavailable" is not the user's mistake, so the fields stay Default.
  const rejected = failure === "invalid-credentials";
  const rejectedProps = {
    invalid: rejected,
    "aria-describedby": rejected ? bannerId : undefined,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { email: "", password: "" },
  });

  const errorText = (key: string | undefined) =>
    isValidationKey(key, copy) ? copy.validation[key] : undefined;

  const signIn = async ({ email, password }: LoginOutput) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFailure(null);
    try {
      const result = await adapter.signIn({ email, password });
      if (!result.ok) setFailure(result.failure);
    } catch {
      // Fail closed: an unexpected adapter error is shown as "unavailable", never as success.
      setFailure("unavailable");
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <form
      noValidate
      aria-labelledby={headingId}
      onSubmit={(event) => void handleSubmit(signIn, () => setFailure(null))(event)}
      data-login-form=""
      className="flex flex-col gap-7"
    >
      <div className="flex flex-col gap-5">
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
          {...rejectedProps}
        />
        <AuthPasswordField
          {...register("password")}
          label={copy.password}
          autoComplete="current-password"
          placeholder={
            passwordVisible ? copy.passwordPlaceholderShown : copy.passwordPlaceholderHidden
          }
          visible={passwordVisible}
          onVisibleChange={setPasswordVisible}
          toggleLabel={copy.showPassword}
          error={errorText(errors.password?.message)}
          {...rejectedProps}
        />
        <div className="flex justify-end">
          <AuthTextLink href={ROUTES["auth.forgotPassword"]}>{copy.forgot}</AuthTextLink>
        </div>
      </div>
      <AuthErrorBanner id={bannerId} message={failure ? copy.failures[failure] : null} />
      <AuthSubmitButton loading={isSubmitting} loadingLabel={copy.submitting}>
        {copy.submit}
      </AuthSubmitButton>
    </form>
  );
}
