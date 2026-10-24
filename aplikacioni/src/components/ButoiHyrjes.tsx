"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export function ButoiHyrjes() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.9rem" }}>
          👤 {session.user?.name ?? session.user?.email}
        </span>
        <button className="action" onClick={() => signOut()}>
          Dil
        </button>
      </div>
    );
  }

  return (
    <button className="action" onClick={() => signIn("github")}>
      Hyr me GitHub
    </button>
  );
}
