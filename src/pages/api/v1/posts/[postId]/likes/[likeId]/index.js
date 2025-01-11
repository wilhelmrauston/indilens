import {
  defaultHandler,
  invalidRequest,
  successWithJson
} from '@/utils/server/api-helpers'

const deleteLike = async (req, res, session, prisma) => {
  const { postId } = req.query

  try {
    // Find user's like
    const like = await prisma.like.findFirst({
      where: {
        postId: parseInt(postId),
        userId: session.user.id
      }
    })

    if (!like) {
      return invalidRequest(res, 'Like not found')
    }

    // Delete the like
    await prisma.like.delete({
      where: {
        id: like.id
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
      hasLiked: false
    })
  } catch (error) {
    console.error('Delete like error:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      DELETE: deleteLike
    },
    {
      requiresAuth: true
    }
  )

export default handler
