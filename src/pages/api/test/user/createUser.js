import {
  defaultHandler,
  invalidRequest
} from '../../../../utils/server/api-helpers'
import { hashPassword } from '@/utils/server/auth'
import { validateEmail } from '@/utils/server/helpers'

const createUser = async (req, res, prisma) => {
  const { email, password, name } = req.body

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
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return invalidRequest(res, 'User with this email already exists')
    }

    const hashedPassword = await hashPassword(password)

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

    return res.status(200).json({
      success: true,
      message: 'Test user created',
      user
    })
  } catch (error) {
    console.error('Test user creation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create test user'
    })
  }
}

export default function handler(req, res) {
  console.log('Handler started')

  return defaultHandler(
    req,
    res,
    {
      POST: createUser
    },
    {
      requiresAuth: false // Set to false for testing
    }
  )
}
