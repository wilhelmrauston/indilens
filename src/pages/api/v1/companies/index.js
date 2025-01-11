import slugify from 'slugify'
import {
  defaultHandler,
  invalidRequest,
  internalError,
  successWithJson
} from '@/utils/server/api-helpers'

const getCompanies = async (req, res, session, prisma) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        users: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return successWithJson(res, companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    throw error
  }
}

const createCompany = async (req, res, session, prisma) => {
  console.log('Request body:', JSON.stringify(req.body, null, 2))
  console.log('Session:', session)
  console.log('Request body:', req.body)

  if (!session?.user?.id) {
    return invalidRequest(res, 'User not authenticated')
  }

  const {
    name,
    tagline,
    description,
    website,
    industry,
    status,
    githubUrl,
    demoUrl,
    techStack,
    pricing,
    revenue
  } = req.body

  if (!name) {
    return invalidRequest(res, 'Company name is required')
  }

  try {
    // Create slug from name
    const slug = slugify(name, {
      lower: true,
      strict: true
    })

    // Create the company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        tagline: tagline || '',
        description: description || '',
        website: website || '',
        industry: industry || '',
        status: status || 'IDEATION',
        githubUrl: githubUrl || '',
        demoUrl: demoUrl || '',
        techStack: techStack || [],
        pricing: pricing || {},
        revenue: revenue || null,
        users: {
          create: {
            user: {
              connect: { id: session.user.id }
            },
            role: 'FOUNDER',
            isActive: true
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return res.status(200).json({ success: true, data: company })
  } catch (error) {
    console.error('Company creation error:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'A company with this name already exists'
      })
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to create company',
      details: error.message
    })
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getCompanies,
      POST: createCompany
    },
    {
      requiresAuth: true
    }
  )

export default handler
