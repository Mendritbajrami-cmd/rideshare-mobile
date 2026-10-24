"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function Hyrja() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Duke ngarkuar...</p>;
  }

  if (session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.9rem" }}>
          👤 {session.user?.name ?? session.user?.email}
        </span>
        <button type="button" className="action" onClick={() => signOut()}>
          Dil
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="action" onClick={() => signIn("github")}>
      Hyr me GitHub
    </button>
  );
}
