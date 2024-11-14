import { defaultHandler } from '@utils/server/api-helpers'

const getCompany = async (req, res) => {}

const updateCompany = async (req, res) => {}

const deleteCompany = async (req, res) => {}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getCompany,
      PUT: updateCompany,
      DELETE: deleteCompany
    },
    {
      requiresAuth: true
    }
  )

export default handler
