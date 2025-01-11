import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { withPrisma } from './db'

export const DEFAULT_AUTHORIZER = async (options, req, session) => {
  if (options.requiresAuth || options.requiresAdmin) {
    if (!session || !session.user) return false
    if (options.requiresAdmin && session.user.role !== 'ADMIN') return false
  }
  return true
}

const DEFAULT_GLOBAL_OPTIONS = {
  requiresAuth: true,
  requiresAdmin: false,
  authorizer: DEFAULT_AUTHORIZER
}

// Response helpers
export const successWithMessage = (res, message = '') => {
  return res.status(200).json({
    success: true,
    message: message
  })
}

export const successWithJson = (res, jsonResponse) => {
  return res.status(200).json(jsonResponse)
}

export const failure = (res, code, errorMessage, errors = []) => {
  return res.status(code).json({
    success: false,
    message: errorMessage,
    errors: errors
  })
}

export const invalidRequest = (res, message = 'Invalid request') => {
  return failure(res, 400, message)
}

export const unauthorized = (res, message = 'Unauthorized') => {
  return failure(res, 401, message)
}

export const forbidden = (res, message = 'Forbidden') => {
  return failure(res, 403, message)
}

export const notFound = (res, message = 'Not Found') => {
  return failure(res, 404, message)
}

export const internalError = (res, message = 'Internal Server Error') => {
  return failure(res, 500, message)
}

export const defaultHandler = async (
  req,
  res,
  handlers = { GET: null, POST: null, DELETE: null, OPTIONS: null },
  options = DEFAULT_GLOBAL_OPTIONS
) => {
  console.log('1. defaultHandler started')
  console.log('Method:', req.method)
  console.log('Handlers:', Object.keys(handlers))

  const allowedMethods = Object.entries(handlers)
    .filter(([_, v]) => v != null)
    .map(([k]) => k)

  const method = req.method
  if (!allowedMethods.includes(method)) {
    console.log('Method not allowed')
    return methodNotAllowed(req, res, allowedMethods)
  }

  try {
    const handler = handlers[method]
    let session = null

    if (options.requiresAuth) {
      console.log('Getting session')
      session = await getServerSession(req, res, authOptions)
      console.log('Session retrieved:', !!session)

      if (!session && options.requiresAuth) {
        console.log('Authorization required but no session found')
        return unauthorized(res)
      }
    }

    if (
      options.authorizer &&
      !(await options.authorizer(options, req, session))
    ) {
      console.log('Authorization failed')
      return unauthorized(res)
    }

    console.log('About to call handler with Prisma')

    // Modified Prisma handling while keeping the structure
    return await withPrisma(async prisma => {
      if (!prisma) {
        console.error('Prisma instance not available')
        return internalError(res, 'Database connection error')
      }

      const result = await handler(req, res, session, prisma)

      // If handler has already sent response, don't try to send again
      if (!res.writableEnded && result) {
        return result
      }
    })
  } catch (err) {
    console.error('Error in defaultHandler:', err)

    // Don't send multiple responses
    if (!res.writableEnded) {
      return internalError(res, 'An unexpected error occurred')
    }
  }
}
