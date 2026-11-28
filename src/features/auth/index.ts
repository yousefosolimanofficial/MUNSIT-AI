/*
 * Authentication feature (Phase 08). UI only: "UI-complete, not functional" until Phase 21 and
 * gate D-02 (plan §12). Production keeps the Auth routes at 404 (`AUTHENTICATION_AVAILABLE`).
 */
export {
  AuthErrorBanner,
  AuthCardFooter,
  AuthCardHeader,
  AuthFormCard,
} from "./components/AuthFormCard";
export { AuthLayout, type AuthLayoutProps } from "./components/AuthLayout";
export type { AuthMarketingCopy } from "./components/AuthMarketingPanel";
export { AuthPasswordField } from "./components/AuthPasswordField";
export { AuthResultView, type AuthResultTone } from "./components/AuthResultView";
export { AuthButtonLink } from "./components/AuthButtonLink";
export { AuthStatusBanner } from "./components/AuthStatusBanner";
export { PasswordRule, PasswordRuleList, type PasswordRuleState } from "./components/PasswordRule";
export { AuthSubmitButton } from "./components/AuthSubmitButton";
export { AuthTextField } from "./components/AuthTextField";
export { AuthTextLink } from "./components/AuthTextLink";
export { LoginForm, type LoginFormCopy, type LoginFormProps } from "./components/LoginForm";
export { LoginScreen } from "./components/LoginScreen";
export {
  RegisterForm,
  type RegisterFormCopy,
  type RegisterFormProps,
} from "./components/RegisterForm";
export { RegisterScreen } from "./components/RegisterScreen";
export {
  ForgotPasswordForm,
  type ForgotPasswordFormCopy,
  type ForgotPasswordFormProps,
  type ForgotPasswordInitialState,
} from "./components/ForgotPasswordForm";
export { ForgotPasswordScreen } from "./components/ForgotPasswordScreen";
export {
  ResetPasswordForm,
  type ResetPasswordFormCopy,
  type ResetPasswordFormProps,
  type ResetPasswordInitialState,
} from "./components/ResetPasswordForm";
export { ResetPasswordScreen } from "./components/ResetPasswordScreen";
export { AuthFoundationPreview } from "./components/AuthFoundationPreview";
export { AUTH_IMAGES, type AuthFamily } from "./model/auth-images";
export { failureMessageKey, type AuthOperation } from "./model/messages";
export {
  evaluatePasswordRules,
  meetsAllPasswordRules,
  PASSWORD_RULE_IDS,
  type PasswordRuleId,
} from "./model/password-rules";
export {
  LOGIN_VALIDATION_KEYS,
  loginSchema,
  type LoginValidationKey,
  type LoginValues,
} from "./schemas/login";
export {
  REGISTER_VALIDATION_KEYS,
  registerSchema,
  type RegisterValidationKey,
  type RegisterValues,
} from "./schemas/register";
export {
  FORGOT_PASSWORD_VALIDATION_KEYS,
  forgotPasswordSchema,
  type ForgotPasswordOutput,
  type ForgotPasswordValidationKey,
  type ForgotPasswordValues,
} from "./schemas/forgot-password";
export {
  RESET_PASSWORD_VALIDATION_KEYS,
  resetPasswordSchema,
  type ResetPasswordOutput,
  type ResetPasswordValidationKey,
  type ResetPasswordValues,
} from "./schemas/reset-password";
