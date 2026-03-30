"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {

  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <p>Bienvenido {session.user?.name}</p>
        <button onClick={() => signOut()}>
          Logout
        </button>
      </>
    );
  }

  return (
    <button onClick={() => signIn("azure-ad")}>
      Login corporativo
    </button>
  );
}