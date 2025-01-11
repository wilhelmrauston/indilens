import {
  defaultHandler,
  invalidRequest,
  successWithJson
} from '@/utils/server/api-helpers'

const getPost = async (req, res, session, prisma) => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        authorId: session.user.id
      }
    })

    return successWithJson(res, { hasPost: !!post })
  } catch (error) {
    console.error('Check post error:', error)
    throw error
  }
}

const createPost = async (req, res, session, prisma) => {
  const { title, content, type, companyId } = req.body

  // Validate required fields
  if (!title || !content || !type || !companyId) {
    return invalidRequest(res, 'Missing required fields')
  }

  // Validate post type
  const validTypes = ['UPDATE', 'MILESTONE', 'QUESTION', 'SHOWCASE']
  if (!validTypes.includes(type)) {
    return invalidRequest(res, 'Invalid post type')
  }

  try {
    // Check if user already has a post
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: session.user.id
      }
    })

    if (existingPost) {
      const updatedPost = await prisma.post.update({
        where: {
          id: existingPost.id
        },
        data: {
          title,
          content,
          type,
          company: {
            connect: { id: parseInt(companyId) }
          }
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          company: true
        }
      })

      // Get all companies associated with the user
      const userCompanies = await prisma.userCompany.findMany({
        where: {
          userId: session.user.id,
          isActive: true
        },
        include: {
          company: true
        }
      })

      return successWithJson(res, {
        ...updatedPost,
        allCompanies: userCompanies.map(uc => uc.company)
      })
    }

    const userCompanies = await prisma.userCompany.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        company: true
      }
    })

    const hasAccess = userCompanies.some(
      uc => uc.companyId === parseInt(companyId)
    )

    if (!hasAccess) {
      return invalidRequest(res, 'You do not have access to this company')
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        type,
        author: {
          connect: { id: session.user.id }
        },
        company: {
          connect: { id: parseInt(companyId) }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true
      }
    })

    return successWithJson(res, {
      ...post,
      allCompanies: userCompanies.map(uc => uc.company)
    })
  } catch (error) {
    console.error('Post creation error:', error)
    throw error
  }
}

const removePost = async (req, res, session, prisma) => {
  try {
    // Find the user's post
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: session.user.id
      }
    })

    if (!existingPost) {
      return invalidRequest(res, 'No post found to remove')
    }

    // Delete all comments associated with the post first
    await prisma.comment.deleteMany({
      where: {
        postId: existingPost.id
      }
    })

    // Delete all likes associated with the post
    await prisma.like.deleteMany({
      where: {
        postId: existingPost.id
      }
    })

    // Delete the post
    await prisma.post.delete({
      where: {
        id: existingPost.id
      }
    })

    return successWithJson(res, { message: 'Post successfully removed' })
  } catch (error) {
    console.error('Remove post error:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getPost,
      DELETE: removePost,
      POST: createPost
    },
    {
      requiresAuth: true
    }
  )

export default handler
