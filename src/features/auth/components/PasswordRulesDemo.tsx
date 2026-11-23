"use client";

import { useId, useState, type ReactNode } from "react";

import { evaluatePasswordRules, type PasswordRuleId } from "../model/password-rules";
import { AuthPasswordField } from "./AuthPasswordField";
import { PasswordRuleList, type PasswordRuleState } from "./PasswordRule";

/*
 * Development preview only (`/dev/auth`, D-08-4): a password field with the live rule list, so the
 * Neutral, Valid and Error states can be tried. Neutral while empty; after that each rule is Valid
 * or Error. Holds no form, submits nothing and stores nothing.
 */
export function PasswordRulesDemo({
  label,
  toggleLabel,
  ruleLabels,
  statusLabels,
}: {
  label: string;
  toggleLabel: string;
  ruleLabels: Readonly<Record<PasswordRuleId, ReactNode>>;
  statusLabels: { met: string; notMet: string };
}) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const rulesId = useId();

  const rules = evaluatePasswordRules(value).map(({ id, met }) => {
    const state: PasswordRuleState = value === "" ? "neutral" : met ? "valid" : "error";
    return {
      id,
      label: ruleLabels[id],
      state,
      statusLabel: met ? statusLabels.met : statusLabels.notMet,
    };
  });

  return (
    <div className="flex flex-col gap-sm">
      <AuthPasswordField
        label={label}
        toggleLabel={toggleLabel}
        visible={visible}
        onVisibleChange={setVisible}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-describedby={rulesId}
        autoComplete="off"
      />
      <PasswordRuleList id={rulesId} rules={rules} />
    </div>
  );
}
