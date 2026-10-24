import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, profile }) {
      // Ruaj GitHub login në token
      if (profile) {
        token.login = (profile as { login?: string }).login ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      // Kaloje login-in te sesioni
      (session.user as { login?: string }).login = (token.login as string) ?? "";
      return session;
    },
  },
});
