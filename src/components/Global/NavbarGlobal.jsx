import { useRouter } from 'next/router'
import { useState } from 'react'
import clsx from 'clsx'
import { Container } from '../utils/Container'
import { HomeIcon } from '@heroicons/react/24/outline'
import Avatar from '../UI/Forms/UserDropdown'
import SearchBar from './SearchBar'
import Link from 'next/link'

export function Header(props) {
  const router = useRouter()
  const [isElementVisible, setElementVisibility] = useState(false)

  return (
    <header className={clsx('z-[150]', props.navClassName)}>
      <nav className='p-3'>
        <Container>
          <div className='flex h-[52px] flex-row justify-between'>
            <div className='flex h-full flex-row items-center gap-12 text-white'>
              <a href='#' className='h-full'>
                <HomeIcon className='h-full cursor-pointer rounded-full p-2 transition duration-200 ease-in-out hover:text-teal-600' />
              </a>
              <div className='hidden flex-1 items-center gap-12 px-16 md:inline-flex'>
                <a className='cursor-pointer'>Pricing</a>
                <Link href={'/signup'} className='cursor-pointer'>
                  Join Us!
                </Link>
              </div>

              {/* <SearchBar /> */}
            </div>
            <Avatar />
          </div>
        </Container>
      </nav>
    </header>
  )
}

function Hero() {
  return <div>icon</div>
}
