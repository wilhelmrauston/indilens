import {
  defaultHandler,
  invalidRequest,
  internalError,
  successWithJson
} from '@/lib/api-helpers'
import { hashPassword } from '@/utils/server/auth'
import { validateEmail } from '@/utils/server/helpers'

const createUser = async (req, res, session, prisma) => {
  const { name, email, password } = req.body

  if (!email || !password || !name) {
    return invalidRequest(res, 'Email, password, and name are required')
  }

  if (!validateEmail(email)) {
    return invalidRequest(res, 'Invalid email address')
  }

  if (password.length < 6) {
    return invalidRequest(res, 'Password must be at least 6 characters long')
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return invalidRequest(res, 'User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER' // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return successWithJson(res, {
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('User creation error:', error)

    if (error.code === 'P2002') {
      return invalidRequest(res, 'User with this email already exists')
    }

    return internalError(res)
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      POST: createUser
    },
    {
      requiresAuth: true
    }
  )

export default handler
