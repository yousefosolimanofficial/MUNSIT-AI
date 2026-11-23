"use client";

import { useState } from "react";

import { AuthPasswordField } from "./AuthPasswordField";

/*
 * Development preview only (`/dev/auth`, D-08-4): a password field with local visibility state, so
 * the toggle can be tried. Holds no form, submits nothing and stores nothing.
 */
export function PasswordFieldDemo({
  label,
  toggleLabel,
  error,
  disabled,
  initiallyVisible = false,
}: {
  label: string;
  toggleLabel: string;
  error?: string;
  disabled?: boolean;
  initiallyVisible?: boolean;
}) {
  const [visible, setVisible] = useState(initiallyVisible);
  return (
    <AuthPasswordField
      label={label}
      toggleLabel={toggleLabel}
      visible={visible}
      onVisibleChange={setVisible}
      error={error}
      disabled={disabled}
      placeholder="••••••••"
      autoComplete="off"
    />
  );
}
