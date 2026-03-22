import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { userRepository } from '@/lib/repositories/postgres/PostgresUserRepository'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) return isLoggedIn
      if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { role: string }).role = token.role as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }
        if (!email || !password) return null

        try {
          const user = await userRepository.getUserByEmail(email)
          if (!user) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (!passwordsMatch) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
}
