import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

function githubId() {
  return (
    process.env.GITHUB_ID ??
    process.env.GITHUB_CLIENT_ID ??
    process.env.AUTH_GITHUB_ID ??
    ""
  );
}

function githubSecret() {
  return (
    process.env.GITHUB_SECRET ??
    process.env.GITHUB_CLIENT_SECRET ??
    process.env.AUTH_GITHUB_SECRET ??
    ""
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: githubId(),
      clientSecret: githubSecret(),
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && "login" in profile) {
        token.login = (profile as { login?: string }).login ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { login?: string }).login =
          (token.login as string) ?? "";
      }
      return session;
    },
  },
};
