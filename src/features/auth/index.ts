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
export { AuthResultView } from "./components/AuthResultView";
export { PasswordRule, PasswordRuleList, type PasswordRuleState } from "./components/PasswordRule";
export { AuthSubmitButton } from "./components/AuthSubmitButton";
export { AuthTextField } from "./components/AuthTextField";
export { AuthTextLink } from "./components/AuthTextLink";
export { AuthFoundationPreview } from "./components/AuthFoundationPreview";
export { AUTH_IMAGES, type AuthFamily } from "./model/auth-images";
export { failureMessageKey, type AuthOperation } from "./model/messages";
export {
  evaluatePasswordRules,
  meetsAllPasswordRules,
  PASSWORD_RULE_IDS,
  type PasswordRuleId,
} from "./model/password-rules";
