import { useState, useEffect } from 'react'
import NavbarDashboard from '@/components/Layout/Dashboard/NavbarDashboard'
import { Container } from '@/components/utils/Container'
import {
  ArrowDownIcon,
  CameraIcon,
  ChartBarIcon,
  GlobeAltIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

const COMPANY_STATUS = [
  'IDEATION',
  'IN_PROGRESS',
  'LAUNCHED',
  'ACQUIRED',
  'CLOSED'
]

export default function Dashboard() {
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'update'
  const [editingCompanyId, setEditingCompanyId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [hasPost, setHasPost] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    website: '',
    industry: '',
    status: 'IDEATION',
    githubUrl: '',
    demoUrl: '',
    techStack: [],
    pricing: { free: false, plans: [] },
    revenue: null
  })
  const { data: session } = useSession()
  const [userSlug, setUserSlug] = useState('')

  const checkPostStatus = async () => {
    try {
      const response = await fetch('/api/v1/posts', {
        method: 'GET'
      })
      if (response.ok) {
        const data = await response.json()
        setHasPost(data.hasPost)
      }
    } catch (error) {
      console.error('Error checking post status:', error)
    }
  }

  useEffect(() => {
    if (session) {
      checkPostStatus()
    }
  }, [session])

  const handleRemovePost = async () => {
    try {
      const response = await fetch('/api/v1/posts', {
        method: 'DELETE'
      })

      if (response.ok) {
        setHasPost(false)
        // Refresh your page data or show a success message
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove post')
      }
    } catch (error) {
      console.error('Error removing post:', error)
      alert(error.message || 'Failed to remove post')
    }
  }

  // Fetch user slug when component mounts
  useEffect(() => {
    const fetchUserSlug = async () => {
      try {
        const response = await fetch('/api/v1/users/me')
        if (response.ok) {
          const data = await response.json()
          setUserSlug(data.slug)
        }
      } catch (error) {
        console.error('Error fetching user slug:', error)
      }
    }

    if (session) {
      fetchUserSlug()
    }
  }, [session])

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/v1/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTechStackChange = e => {
    const techs = e.target.value.split(',').map(tech => tech.trim())
    setFormData(prev => ({
      ...prev,
      techStack: techs
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    const dataToSend = {
      ...formData,
      techStack: Array.isArray(formData.techStack)
        ? formData.techStack
        : formData.techStack.length > 0
          ? formData.techStack.split(',').map(tech => tech.trim())
          : [],
      revenue: formData.revenue ? parseInt(formData.revenue) : null,
      pricing: { free: false, plans: [] }
    }

    try {
      const url =
        modalMode === 'create'
          ? '/api/v1/companies'
          : `/api/v1/companies/${editingCompanyId}`

      const method = modalMode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${modalMode} company`)
      }

      // Success handling
      setShowModal(false)
      setFormData({
        name: '',
        tagline: '',
        description: '',
        website: '',
        industry: '',
        status: 'IDEATION',
        githubUrl: '',
        demoUrl: '',
        techStack: [],
        pricing: { free: false, plans: [] },
        revenue: null
      })
      fetchCompanies() // Refresh the list
    } catch (error) {
      console.error(`${modalMode} error:`, error)
      alert(
        error.message ||
          `An error occurred while ${modalMode === 'create' ? 'creating' : 'updating'} the company`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCompany = () => {
    setModalMode('create')
    setEditingCompanyId(null)
    setFormData({
      name: '',
      tagline: '',
      description: '',
      website: '',
      industry: '',
      status: 'IDEATION',
      githubUrl: '',
      demoUrl: '',
      techStack: [],
      pricing: { free: false, plans: [] },
      revenue: null
    })
    setShowModal(true)
  }

  // Update the input handlers
  const handleNameChange = e => {
    setName(e.target.value)
  }

  const handleContentChange = e => {
    setContent(e.target.value)
  }

  // Update the handleDeploy function
  const handleDeploy = async () => {
    if (!companies.length) {
      alert('Add some startups before deploying!')
      return
    }

    setIsDeploying(true)
    try {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: name || 'My Indie Page',
          content: content || 'Check out my startups and projects!',
          type: 'SHOWCASE',
          companyId: companies[0].id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to deploy')
      }

      // Clear inputs after successful deploy
      setName('')
      setContent('')
      alert('Successfully deployed!')
    } catch (error) {
      console.error('Deploy error:', error)
      alert(error.message || 'Failed to deploy')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleEditCompany = company => {
    setModalMode('update')
    setEditingCompanyId(company.id)
    setFormData({
      name: company.name,
      tagline: company.tagline || '',
      description: company.description || '',
      website: company.website || '',
      industry: company.industry || '',
      status: company.status,
      githubUrl: company.githubUrl || '',
      demoUrl: company.demoUrl || '',
      techStack: company.techStack || [],
      pricing: company.pricing || { free: false, plans: [] },
      revenue: company.revenue || null
    })
    setShowModal(true)
  }

  const handleDeleteCompany = async companyId => {
    try {
      const response = await fetch(`/api/v1/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete company')
      }

      // Refresh the companies list
      fetchCompanies()
    } catch (error) {
      console.error('Delete error:', error)
      alert(error.message || 'Failed to delete company')
    }
  }

  return (
    <>
      <NavbarDashboard
        onDeploy={handleDeploy}
        onRemovePost={handleRemovePost}
        hasCompanies={companies.length > 0}
        hasPost={hasPost}
        isDeploying={isDeploying}
      />
      <Container>
        <div className='mx-auto h-full max-w-7xl overflow-scroll p-4 md:flex'>
          <div className='mx-auto max-w-3xl space-y-4 overflow-y-auto pb-44 md:basis-3/5'>
            {/* Profile Section */}
            <div className='hover:bg-base-300 relative cursor-pointer select-none rounded-3xl bg-gray-800 p-4 duration-200'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex gap-4'>
                    <div className='group relative inline-flex'>
                      <Image
                        className='inline-block h-12 w-12 rounded-full object-cover'
                        alt='User Profile'
                        src='/robert.png'
                        width={48}
                        height={48}
                      />
                      <div className='absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-transparent duration-200'>
                        <button className='inline-flex h-8 w-8 items-center justify-center rounded-md border-gray-200 bg-gray-500/50 transition-all duration-200 ease-in-out hover:border-gray-200 hover:bg-gray-700/70'>
                          <CameraIcon stroke='white' className='h-5 w-5' />
                        </button>
                      </div>
                    </div>
                    <div className='flex-1'>
                      <span className='relative w-full font-semibold'>
                        <input
                          className='input h-12 w-full bg-transparent px-4 ring-1 ring-gray-400 placeholder:opacity-50'
                          type='text'
                          placeholder='Your Name'
                          value={name}
                          onChange={handleNameChange}
                        />
                      </span>
                    </div>
                  </div>
                  <div className='w-full'>
                    <span className='relative inline-block w-full'>
                      <input
                        className='input h-12 w-full bg-transparent px-4 ring-1 ring-gray-400 placeholder:opacity-50'
                        type='text'
                        placeholder='I work with....'
                        value={content}
                        onChange={handleContentChange}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-center gap-1 text-sm'>
              <ArrowDownIcon className='h-5 w-5' />
              <p>Your failures, successes, and everything in between</p>
            </div>

            {/* Companies List */}
            <div className='space-y-4'>
              {isLoading ? (
                <div className='text-center text-gray-400'>
                  Loading your startups...
                </div>
              ) : companies.length > 0 ? (
                companies.map(company => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onEdit={handleEditCompany}
                    onDelete={handleDeleteCompany}
                  />
                ))
              ) : (
                <div className='text-center text-gray-400'>
                  No startups yet. Add your first one!
                </div>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#F6B17A] px-4 font-semibold text-gray-700 shadow-sm ring-1 ring-[#f8a765] transition-all duration-150 ease-in-out hover:bg-[#f0a467]'
            >
              <PlusIcon className='h-5 w-5' />
              <span>Add Startup</span>
            </button>
          </div>
          <div className='hidden md:block md:basis-2/5'>
            <div className='relative mx-auto aspect-[9/19] w-64 max-w-sm overflow-hidden rounded-3xl border-[8px] border-black lg:w-80 lg:rounded-[3.5rem] lg:border-[14px] xl:w-96'>
              <div className='absolute inset-0 z-10'>
                {!userSlug ? (
                  <div className='flex h-full items-center justify-center bg-gray-800 text-gray-400'>
                    Loading preview...
                  </div>
                ) : (
                  <iframe
                    className='h-full w-full'
                    src={`http://localhost:3000/showcase/${userSlug}`}
                    title='User Profile Preview'
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Modal Overlay */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4'>
          <div className='relative w-full max-w-2xl rounded-xl bg-gray-800 p-6 shadow-lg'>
            <button
              onClick={() => {
                setShowModal(false)
                setModalMode('create')
                setEditingCompanyId(null)
              }}
              className='absolute right-4 top-4 text-gray-400 hover:text-gray-300'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>

            <h2 className='mb-6 text-xl font-semibold text-white'>
              {modalMode === 'create' ? 'Add New Startup' : 'Update Startup'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Company Name*
                  </label>
                  <input
                    type='text'
                    name='name'
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Tagline
                  </label>
                  <input
                    type='text'
                    name='tagline'
                    value={formData.tagline}
                    onChange={handleInputChange}
                    className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-300'>
                      Website
                    </label>
                    <input
                      type='url'
                      name='website'
                      value={formData.website}
                      onChange={handleInputChange}
                      className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-300'>
                      Industry
                    </label>
                    <input
                      type='text'
                      name='industry'
                      value={formData.industry}
                      onChange={handleInputChange}
                      className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Status
                  </label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                  >
                    {COMPANY_STATUS.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-300'>
                      GitHub URL
                    </label>
                    <input
                      type='url'
                      name='githubUrl'
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-300'>
                      Demo URL
                    </label>
                    <input
                      type='url'
                      name='demoUrl'
                      value={formData.demoUrl}
                      onChange={handleInputChange}
                      className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type='text'
                    value={formData.techStack.join(', ')}
                    onChange={handleTechStackChange}
                    placeholder='React, Node.js, PostgreSQL'
                    className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Monthly Revenue (optional)
                  </label>
                  <input
                    type='number'
                    name='revenue'
                    value={formData.revenue || ''}
                    onChange={handleInputChange}
                    className='mt-1 block w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
                  />
                </div>
              </div>

              <div className='mt-6 flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={() => {
                    setShowModal(false)
                    setModalMode('create')
                    setEditingCompanyId(null)
                  }}
                  className='rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting || !formData.name}
                  className='rounded-md bg-[#F6B17A] px-4 py-2 font-semibold text-gray-700 hover:bg-[#f0a467] disabled:opacity-50'
                >
                  {isSubmitting
                    ? modalMode === 'create'
                      ? 'Creating...'
                      : 'Updating...'
                    : modalMode === 'create'
                      ? 'Create Startup'
                      : 'Update Startup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const CompanyCard = ({ company, onEdit, onDelete }) => (
  <div className='hover:bg-gray-750 rounded-xl bg-gray-800 p-4'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        {company.logo ? (
          <Image
            src={company.logo}
            alt={company.name}
            width={48}
            height={48}
            className='h-12 w-12 rounded-lg object-cover'
          />
        ) : (
          <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700'>
            <GlobeAltIcon className='h-6 w-6 text-gray-400' />
          </div>
        )}
        <div>
          <h3 className='font-semibold text-white'>{company.name}</h3>
          {company.tagline && (
            <p className='text-sm text-gray-400'>{company.tagline}</p>
          )}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        {company.status && (
          <span className='rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300'>
            {company.status.toLowerCase()}
          </span>
        )}
        {company.revenue && (
          <div className='flex items-center gap-1 rounded-lg bg-gray-700 px-2 py-1'>
            <ChartBarIcon className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-300'>${company.revenue}/mo</span>
          </div>
        )}
        <div className='ml-4 flex items-center gap-2'>
          <button
            onClick={e => {
              e.stopPropagation()
              onEdit(company)
            }}
            className='rounded-md p-1 text-gray-400 hover:bg-gray-700 hover:text-white'
          >
            <PencilIcon className='h-4 w-4' />
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              if (
                window.confirm('Are you sure you want to delete this company?')
              ) {
                onDelete(company.id)
              }
            }}
            className='rounded-md p-1 text-gray-400 hover:bg-gray-700 hover:text-red-400'
          >
            <TrashIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  </div>
)
