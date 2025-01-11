import { Container } from '@/components/utils/Container'
import {
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentIcon,
  PaintBrushIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useState } from 'react'

export default function NavbarDashboard({
  onDeploy,
  onRemovePost,
  hasCompanies,
  hasPost,
  isDeploying
}) {
  const [activeTab, setActiveTab] = useState('Page')

  const navItems = [
    { name: 'Page', icon: DocumentIcon },
    { name: 'Style', icon: PaintBrushIcon },
    { name: 'Stats', icon: ChartBarIcon },
    { name: 'Settings', icon: Cog6ToothIcon }
  ]

  const handleTabClick = tabName => {
    setActiveTab(tabName)
    window.location.hash = tabName.toLowerCase()
  }

  const handleDeploy = () => {
    if (!hasCompanies) {
      alert('Add some startups before deploying!')
      return
    }
    onDeploy?.()
  }

  const handleRemovePost = async () => {
    if (confirm('Are you sure you want to remove your post?')) {
      onRemovePost?.()
    }
  }

  return (
    <header className={clsx('z-[150]')}>
      <nav className='p-3'>
        <Container>
          <div className='sticky top-0 mb-4 bg-[#2D3250] p-2 md:rounded-3xl md:p-4'>
            <div className='flex h-[52px] flex-row items-center justify-between text-white'>
              <div className='flex h-full flex-row items-center gap-4 font-semibold'>
                {navItems.map(item => (
                  <button
                    key={item.name}
                    onClick={() => handleTabClick(item.name)}
                    className={clsx(
                      'duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg px-4 uppercase leading-none transition-all ease-out lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm',
                      activeTab === item.name
                        ? 'bg-[#4d5788]'
                        : 'hover:bg-[#424769]'
                    )}
                  >
                    <item.icon className='h-5 w-5' />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
              {hasPost && (
                <button
                  className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-red-500 px-4 uppercase leading-none transition-all ease-out hover:bg-red-600 lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'
                  onClick={handleRemovePost}
                >
                  <TrashIcon className='h-5 w-5' />
                  <span>Remove Post</span>
                </button>
              )}
              <button
                className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-[#F6B17A] px-4 uppercase leading-none ring-[#f8a765] transition-all ease-out hover:bg-[#f0a467] hover:ring-[#f8a765] lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'
                onClick={handleDeploy}
                disabled={!hasCompanies || isDeploying}
              >
                <SparklesIcon className='h-5 w-5' />
                <span>
                  {isDeploying
                    ? 'Deploying...'
                    : !hasCompanies
                      ? 'Add Startup First'
                      : 'Deploy'}
                </span>
              </button>
            </div>
          </div>
        </Container>
      </nav>
    </header>
  )
}
