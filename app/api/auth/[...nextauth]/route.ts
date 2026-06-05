import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// ── Hardened Admin Credentials ──
const ADMIN_EMAIL    = "pxl.dashboard.9x7k@pixelectro.com";
const ADMIN_PASSWORD = "Px!L3ctr0#9K@mZ7qR$nW2&jT8vS!2026";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: "Email",    type: "email",    placeholder: "admin@pixelectro.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const emailMatch    = credentials?.email    === ADMIN_EMAIL;
        const passwordMatch = credentials?.password === ADMIN_PASSWORD;

        // Both must match exactly — no partial match allowed
        if (emailMatch && passwordMatch) {
          return { id: "1", name: "Pixelectro Admin", email: ADMIN_EMAIL, role: "SUPER_ADMIN" };
        }

        // Deliberate delay to slow down brute-force attacks
        await new Promise(r => setTimeout(r, 1500));
        return null;
      }
    })
  ],
  pages: {
    signIn: '/pxl-studio-9x7k2/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // Session expires after 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) (session.user as any).role = token.role;
      return session;
    }
  }
}

const handler = NextAuth(authOptions as any)

export { handler as GET, handler as POST }
