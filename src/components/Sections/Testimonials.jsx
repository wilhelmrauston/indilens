import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { UserIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    rating: 4.9,
    text: 'Pagedone has made it possible for me to stay on top of my portfolio and make informed decisions quickly and easily.',
    name: 'Jane D',
    role: 'CEO'
  },
  {
    id: 2,
    text: 'Thanks to pagedone, I feel more informed and confident about my investment decisions than ever before.',
    rating: 4.9,
    name: 'Harsh P.',
    role: 'Product Designer'
  },
  {
    id: 3,
    text: 'The customer service team at pagedone went above and beyond to help me resolve a billing issue.',
    rating: 4.9,
    name: 'Alex K.',
    role: 'Design Lead'
  }
]

const AvatarFallback = () => (
  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
    <UserIcon className='h-6 w-6 text-gray-400' />
  </div>
)

export default function Testimonials() {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imgError, setImgError] = useState({})
  const [isHovered, setIsHovered] = useState(false)

  const scroll = direction => {
    const element = scrollRef.current
    if (!element) return

    const cardWidth = 400 + 32
    const newPosition =
      direction === 'left'
        ? element.scrollLeft - cardWidth
        : element.scrollLeft + cardWidth

    element.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })

    const newIndex =
      direction === 'left'
        ? Math.max(0, activeIndex - 1)
        : Math.min(testimonials.length - 1, activeIndex + 1)
    setActiveIndex(newIndex)
  }

  useEffect(() => {
    let interval
    if (!isHovered) {
      interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % testimonials.length
        setActiveIndex(nextIndex)
        const element = scrollRef.current
        if (element) {
          const cardWidth = 400 + 32
          element.scrollTo({
            left: cardWidth * nextIndex,
            behavior: 'smooth'
          })
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [activeIndex, isHovered])

  const handleImageError = id => {
    setImgError(prev => ({ ...prev, [id]: true }))
  }

  return (
    <>
      <div className='mx-auto max-w-4xl text-center'>
        <h2 className='text-base/7 font-semibold text-[#F6B17A]'>
          Testimonials
        </h2>
        <p className='mt-2 text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl'>
          What our happy users say!
        </p>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div
          className='relative'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollRef}
            className='no-scrollbar flex gap-8 overflow-x-auto scroll-smooth'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[...testimonials, ...testimonials].map((item, index) => (
              <div key={`${item.id}-${index}`} className='w-[400px] flex-none'>
                <div className='h-full rounded-xl border border-[#7077A1] bg-[#2D3250] p-6 transition-all hover:border-[#F6B17A] hover:shadow-sm'>
                  <div className='mb-7 flex items-center gap-2 text-[#F6B17A]'>
                    <svg
                      className='h-5 w-5'
                      viewBox='0 0 18 17'
                      fill='currentColor'
                    >
                      <path d='M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z' />
                    </svg>
                    <span className='text-base font-semibold text-white'>
                      {item.rating}
                    </span>
                  </div>
                  <p className='pb-8 text-base leading-6 text-white'>
                    {item.text}
                  </p>
                  <div className='flex items-center gap-5 border-t border-gray-200 pt-5'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                      <UserIcon className='h-6 w-6 text-gray-400' />
                    </div>
                    {/* {imgError[item.id] ? (
                      <AvatarFallback />
                    ) : (
                      <Image
                        className='h-10 w-10 rounded-full object-cover'
                        src={item.image}
                        alt={`${item.name} avatar`}
                        onError={() => handleImageError(item.id)}
                      />
                    )} */}
                    <div>
                      <h5 className='mb-1 font-medium text-[#F6B17A]'>
                        {item.name}
                      </h5>
                      <span className='text-sm leading-4 text-gray-400'>
                        {item.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* <button
            onClick={() => scroll('left')}
            disabled={activeIndex === 0}
            className='absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg disabled:opacity-50'
          >
            <ChevronLeftIcon className='h-6 w-6' />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={activeIndex === testimonials.length - 1}
            className='absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg disabled:opacity-50'
          >
            <ChevronRightIcon className='h-6 w-6' />
          </button> */}

          <div className='mt-8 flex justify-center gap-2'>
            {testimonials.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-4 rounded-full transition-all ${
                  index === activeIndex ? 'bg-[#F6B17A]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
