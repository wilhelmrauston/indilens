// pages/api/companies/create.js
import {
  defaultHandler,
  invalidRequest,
  internalError
} from '@/lib/api-helpers'
import slugify from 'slugify' // Make sure to npm install slugify

const createCompany = async (req, res, session, prisma) => {
  const { name } = req.body

  if (!name) {
    return invalidRequest(res, 'Company name is required')
  }

  try {
    // Create slug from name
    const slug = slugify(name, {
      lower: true,
      strict: true
    })

    // Use transaction to ensure both company and relation are created
    const result = await prisma.$transaction(async tx => {
      // Create the company
      const company = await tx.company.create({
        data: {
          name,
          slug,
          // Connect founder through UserCompany relation
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
        // Include the relations in response
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

      return company
    })

    return successWithJson(res, result)
  } catch (error) {
    console.error('Company creation error:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return invalidRequest(res, 'A company with this name already exists')
    }

    return internalError(res)
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      POST: createCompany
    },
    {
      requiresAuth: true
    }
  )

export default handler
