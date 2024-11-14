//CRUD api for user specific calls.
import {
  defaultHandler,
  invalidRequest,
  internalError
} from '@/utils/server/api-helpers'
import slugify from 'slugify'

const getCompanies = async (req, res, prisma) => {}

const createCompany = async (req, res, prisma) => {
  const { name, userid } = req.body

  if (!name) {
    return invalidRequest(res, 'Company name is required')
  }

  if (!userid) {
    return invalidRequest(res, 'User ID is required')
  }

  try {
    // First verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userid }
    })

    const companyExists = await prisma.company.findUnique({
      where: { name: name }
    })

    if (!userExists) {
      return invalidRequest(res, 'User not found')
    }

    if (companyExists) {
      return invalidRequest(res, 'Company already exists')
    }

    const slug = slugify(name, {
      lower: true,
      strict: true
    })

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        users: {
          create: {
            user: {
              connect: { id: userid }
            },
            role: 'FOUNDER',
            isActive: true
          }
        }
      }
    })

    res.status(200).json({
      success: true,
      message: 'Company created successfully',
      data: company
    })
  } catch (error) {
    console.error('Company creation error:', error)
    if (error.code === 'P2002') {
      return invalidRequest(res, 'A company with this name already exists')
    }
    return internalError(res)
  }
}

const updateCompany = async (req, res, prisma) => {
  const {
    id,
    tagline,
    description,
    logo,
    website,
    industry,
    status,
    githubUrl,
    demoUrl,
    techStack,
    launched
  } = req.body

  try {
    const companyExists = await prisma.company.findUnique({
      where: { id: id }
    })

    console.log(companyExists)

    if (!companyExists) {
      return invalidRequest(res, "Company doesn't exist!")
    }

    const updateData = {}
    if (tagline) updateData.tagline = tagline
    if (description) updateData.description = description
    if (logo) updateData.logo = logo
    if (website) updateData.website = website
    if (industry) updateData.industry = industry
    if (status) updateData.status = status
    if (githubUrl) updateData.githubUrl = githubUrl
    if (demoUrl) updateData.demoUrl = demoUrl
    if (techStack) updateData.techStack = techStack
    if (launched) updateData.launched = new Date(launched)

    const updateCompany = await prisma.company.update({
      where: { id: id },
      data: updateData
    })

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updateCompany
    })
  } catch (error) {
    console.error('Company update error:', error)
    if (error.code === 'P2003') {
      return invalidRequest(res, 'A company with this name already exists')
    }
    return internalError(res, 'Internal Error')
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getCompanies,
      POST: createCompany,
      PUT: updateCompany
    },
    {
      requiresAuth: false
    }
  )

export default handler
