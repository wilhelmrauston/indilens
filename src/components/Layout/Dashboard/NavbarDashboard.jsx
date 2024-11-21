import { Container } from '@/components/utils/Container'
import {
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentIcon,
  PaintBrushIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function NavbarDashboard(props) {
  return (
    <header className={clsx('z-[150]', props.navClassName)}>
      <nav className='p-3'>
        <Container>
          <div className='sticky top-0 mb-4 bg-[#2D3250] p-2 md:rounded-3xl md:p-4'>
            <div className='flex h-[52px] flex-row items-center justify-between text-white'>
              <div className='flex h-full flex-row items-center gap-4 font-semibold'>
                <button className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg px-4 uppercase leading-none transition-all ease-out hover:border-[#424769] hover:bg-[#424769] lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'>
                  <DocumentIcon className='h-5 w-5' />
                  <span>Page</span>
                </button>
                <button className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg px-4 uppercase leading-none transition-all ease-out hover:border-[#424769] hover:bg-[#424769] lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'>
                  <PaintBrushIcon className='h-5 w-5' />
                  <span>Style</span>
                </button>
                <button className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg px-4 uppercase leading-none transition-all ease-out hover:border-[#424769] hover:bg-[#424769] lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'>
                  <ChartBarIcon className='h-5 w-5' />
                  <span>Stats</span>
                </button>
                <button className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg px-4 uppercase leading-none transition-all ease-out hover:border-[#424769] hover:bg-[#424769] lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'>
                  <Cog6ToothIcon className='h-5 w-5' />
                  <span>Settings</span>
                </button>
              </div>
              <button className='duration-250 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-[#F6B17A] px-4 uppercase leading-none ring-[#f8a765] transition-all ease-out hover:bg-[#f0a467] hover:ring-[#f8a765] lg:h-12 lg:min-h-12 lg:px-4 lg:text-sm'>
                <SparklesIcon className='h-5 w-5' />
                <span>Deploy</span>
              </button>
            </div>
          </div>
        </Container>
      </nav>
    </header>
  )
}
