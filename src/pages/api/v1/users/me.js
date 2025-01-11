// pages/api/v1/users/me.js
import {
  defaultHandler,
  successWithJson,
  invalidRequest
} from '@/utils/server/api-helpers'

const getMe = async (req, res, session, prisma) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        slug: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      return invalidRequest(res, 'User not found')
    }

    return successWithJson(res, user)
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getMe
    },
    {
      requiresAuth: true
    }
  )

export default handler
