import { hash, compare } from 'bcrypt'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { withPrisma } from './db'

// Core password functions
export async function hashPassword(plaintextPassword) {
  const saltRounds = 10
  try {
    return await hash(plaintextPassword, saltRounds)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw error
  }
}

export async function verifyPassword(plaintextPassword, hashedPassword) {
  try {
    return await compare(plaintextPassword, hashedPassword)
  } catch (error) {
    console.error('Error verifying password:', error)
    throw error
  }
}

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const user = await withPrisma(async prisma => {
            return prisma.user.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
                slug: true
              }
            })
          })

          if (!user) {
            throw new Error('No user found with this email.')
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.password
          )

          if (!isValid) {
            throw new Error('Incorrect password.')
          }

          const { password, ...userWithoutPassword } = user
          return userWithoutPassword
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.slug = user.slug
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.email = token.email
      session.user.slug = token.slug
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signup',
    signOut: '/',
    error: '/signup'
  },
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions)
