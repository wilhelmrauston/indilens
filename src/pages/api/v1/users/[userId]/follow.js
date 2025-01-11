import {
  defaultHandler,
  invalidRequest,
  successWithJson
} from '@/utils/server/api-helpers'

const createFollow = async (req, res, session, prisma) => {
  const { userId } = req.query // This is the user to follow

  if (userId === session.user.id.toString()) {
    return invalidRequest(res, 'Cannot follow yourself')
  }

  try {
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: parseInt(userId)
        }
      }
    })

    if (existingFollow) {
      return invalidRequest(res, 'Already following this user')
    }

    // Create new follow
    await prisma.follow.create({
      data: {
        follower: {
          connect: { id: session.user.id }
        },
        following: {
          connect: { id: parseInt(userId) }
        }
      }
    })

    return successWithJson(res, { isFollowing: true })
  } catch (error) {
    console.error('Follow error:', error)
    throw error
  }
}

const deleteFollow = async (req, res, session, prisma) => {
  const { userId } = req.query

  try {
    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: parseInt(userId)
        }
      }
    })

    return successWithJson(res, { isFollowing: false })
  } catch (error) {
    console.error('Unfollow error:', error)
    throw error
  }
}

const getFollowStatus = async (req, res, session, prisma) => {
  const { userId } = req.query

  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: parseInt(userId)
        }
      }
    })

    return successWithJson(res, { isFollowing: !!follow })
  } catch (error) {
    console.error('Get follow status error:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getFollowStatus,
      POST: createFollow,
      DELETE: deleteFollow
    },
    {
      requiresAuth: true
    }
  )

export default handler
