// pages/api/v1/leaderboard/index.js
import { defaultHandler, successWithJson } from '@/utils/server/api-helpers'

const getLeaderboards = async (req, res, session, prisma) => {
  try {
    // Get the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get companies for last 30 days
    const last30Days = await prisma.company.findMany({
      where: {
        revenue: {
          not: null
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        revenue: 'desc'
      },
      take: 10,
      include: {
        users: {
          where: {
            role: 'FOUNDER'
          },
          include: {
            user: {
              select: {
                name: true,
                slug: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    // Get all-time top companies
    const allTime = await prisma.company.findMany({
      where: {
        revenue: {
          not: null
        }
      },
      orderBy: {
        revenue: 'desc'
      },
      take: 10,
      include: {
        users: {
          where: {
            role: 'FOUNDER'
          },
          include: {
            user: {
              select: {
                name: true,
                slug: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    // Format the data
    const formatCompanies = companies =>
      companies.map((company, index) => ({
        rank: index + 1,
        id: company.id,
        name: company.name,
        slug: company.slug,
        revenue: company.revenue,
        maker: company.users[0]?.user || null
      }))

    return successWithJson(res, {
      last30Days: formatCompanies(last30Days),
      allTime: formatCompanies(allTime)
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getLeaderboards
    },
    {
      requiresAuth: false // Public endpoint
    }
  )

export default handler
