// pages/api/v1/companies/[id].js
import {
  defaultHandler,
  invalidRequest,
  successWithJson
} from '@/utils/server/api-helpers'

const updateCompany = async (req, res, session, prisma) => {
  console.log(req.query)
  console.log(req.body)
  const { id } = req.query
  const updateData = req.body

  try {
    // Verify ownership
    const company = await prisma.company.findFirst({
      where: {
        id: parseInt(id),
        users: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!company) {
      return invalidRequest(res, 'Company not found or access denied')
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
      data: {
        name: updateData.name,
        tagline: updateData.tagline,
        description: updateData.description,
        website: updateData.website,
        industry: updateData.industry,
        status: updateData.status,
        githubUrl: updateData.githubUrl,
        demoUrl: updateData.demoUrl,
        techStack: updateData.techStack || [],
        pricing: updateData.pricing || {},
        revenue: updateData.revenue
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

    return successWithJson(res, updatedCompany)
  } catch (error) {
    console.error('Update company error:', error)
    throw error
  }
}

const deleteCompany = async (req, res, session, prisma) => {
  const { id } = req.query

  try {
    // Verify ownership
    const company = await prisma.company.findFirst({
      where: {
        id: parseInt(id),
        users: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!company) {
      return invalidRequest(res, 'Company not found or access denied')
    }

    // Delete company
    await prisma.$transaction(async tx => {
      // Delete related records first
      await tx.userCompany.deleteMany({
        where: { companyId: parseInt(id) }
      })

      await tx.post.deleteMany({
        where: { companyId: parseInt(id) }
      })

      // Finally delete the company
      await tx.company.delete({
        where: { id: parseInt(id) }
      })
    })

    return successWithJson(res, { message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Delete company error:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      PUT: updateCompany,
      DELETE: deleteCompany
    },
    {
      requiresAuth: true
    }
  )

export default handler
