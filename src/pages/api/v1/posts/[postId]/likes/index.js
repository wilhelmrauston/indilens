// pages/api/v1/posts/[postId]/like.js
import {
  defaultHandler,
  successWithJson,
  invalidRequest
} from '@/utils/server/api-helpers'

const getLikes = async (req, res, session, prisma) => {
  const { postId } = req.query

  try {
    const [count, userLike] = await Promise.all([
      // Get total count of likes
      prisma.like.count({
        where: {
          postId: parseInt(postId)
        }
      }),
      // Check if current user has liked
      prisma.like.findFirst({
        where: {
          postId: parseInt(postId),
          userId: session?.user?.id
        }
      })
    ])

    return successWithJson(res, {
      count,
      hasLiked: !!userLike
    })
  } catch (error) {
    console.error('Get likes error:', error)
    throw error
  }
}

const createLike = async (req, res, session, prisma) => {
  const { postId } = req.query

  try {
    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: parseInt(postId),
        userId: session.user.id
      }
    })

    if (existingLike) {
      return invalidRequest(res, 'Post already liked')
    }

    // Create new like
    await prisma.like.create({
      data: {
        post: {
          connect: { id: parseInt(postId) }
        },
        user: {
          connect: { id: session.user.id }
        }
      }
    })

    // Get updated count
    const count = await prisma.like.count({
      where: {
        postId: parseInt(postId)
      }
    })

    return successWithJson(res, {
      count,
      hasLiked: true
    })
  } catch (error) {
    console.error('Create like error:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getLikes,
      POST: createLike
    },
    {
      requiresAuth: true
    }
  )

export default handler
