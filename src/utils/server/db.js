import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error(
    'Please define the DATABASE_URL environment variable inside .env'
  )
}

// Configuration for Prisma logging, especially for development
const prismaConfig = {
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error']
}

// Initialize PrismaClient and assign it to the global object to avoid re-creation in development or serverless environments
const globalForPrisma = global

const prisma = globalForPrisma.prisma || new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Utility to use Prisma with enhanced error handling
export const withPrisma = async operation => {
  try {
    // Pass prisma directly and let operation handle response
    return await operation(prisma)
  } catch (error) {
    if (error.code?.startsWith('P')) {
      console.error('Database error:', {
        code: error.code,
        message: error.message
      })
    } else {
      console.error('Non-Prisma error:', error)
    }
    throw error // Let defaultHandler catch and handle the error
  }
}

// Utility to check database connection health
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Disconnect Prisma on Vercel to avoid open connections
if (process.env.VERCEL) {
  prisma.$on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

export default prisma
