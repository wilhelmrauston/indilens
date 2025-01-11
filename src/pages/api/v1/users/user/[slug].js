import {
  defaultHandler,
  invalidRequest,
  successWithJson
} from '@/utils/server/api-helpers'

const getUser = async (req, res, session, prisma) => {
  const { slug } = req.query

  try {
    // Get user and their latest post
    const user = await prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        website: true,
        twitterHandle: true,
        githubHandle: true,
        posts: {
          where: {
            type: 'SHOWCASE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            company: true
          }
        }
      }
    })

    if (!user) {
      return invalidRequest(res, 'User not found')
    }

    // Get all companies associated with the user
    const userCompanies = await prisma.userCompany.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            tagline: true,
            description: true,
            logo: true,
            website: true,
            industry: true,
            status: true,
            githubUrl: true,
            demoUrl: true,
            techStack: true,
            revenue: true
          }
        }
      }
    })

    // Format the response
    const formattedPosts = user.posts.map(post => ({
      ...post,
      companies: userCompanies.map(uc => uc.company)
    }))

    return successWithJson(res, {
      user: {
        id: user.id,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        website: user.website,
        twitterHandle: user.twitterHandle,
        githubHandle: user.githubHandle
      },
      posts: formattedPosts
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getUser
    },
    {
      requiresAuth: false // Allow public access to profiles
    }
  )

export default handler
