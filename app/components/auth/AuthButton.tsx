/**
 * @module AuthButton
 * Component responsible for managing user authentication via MSAL.
 *
 * @remarks
 * Implements a conditional authentication button that changes its
 * behavior based on the user's session state.
 *
 * Responsibilities:
 *
 * - Check the active session via {@link useMsal}.
 * - Show a welcome message when the user is signed in.
 * - Allow sign-out via {@link logout}.
 * - Allow corporate sign-in via {@link ensureLogin}.
 */

"use client";

import { useMsal }              from "@azure/msal-react";
import { logout, ensureLogin }  from "@/app/api/auth/msal";

/**
 * Client component that renders a dynamic authentication button.
 *
 * @returns Authentication UI based on the current session state.
 *
 * @remarks
 * Execution flow:
 *
 * 1. Reads the active accounts from {@link useMsal}.
 * 2. If an account exists, shows a personalized greeting and a sign-out button.
 * 3. If no account exists, shows a button to start the corporate login flow.
 */
export default function AuthButton() {
  const { accounts } = useMsal();
  const account      = accounts[0];

  if (account) {
    return (
      <>
        <p>Bienvenido {account.name}</p>
        <button onClick={() => logout()}>
          Logout
        </button>
      </>
    );
  }

  return (
    <button onClick={() => ensureLogin("redirect")}>
      Login corporativo
    </button>
  );
}