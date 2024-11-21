import Image from 'next/image'

export default function Hero() {
  return (
    <div className='relative isolate px-6 py-8 sm:py-12 lg:px-8'>
      <div className='flex flex-col gap-8 md:flex-row md:items-start md:gap-16'>
        <div className='max-w-xl space-y-8 md:space-y-12'>
          <h1 className='text-4xl font-black leading-tight tracking-tight text-white md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight'>
            Showcase and grow your startups{' '}
          </h1>
          <p className='py-8 text-lg font-normal leading-relaxed tracking-wide text-[#F6B17A]'>
            Create your own profile, populate it with your projects & startups
            and show your journey! Display your value and engage with possible
            business partners.
          </p>
          <form className='flex flex-wrap gap-2'>
            <div className='flex-1'>
              <div className='flex flex-col rounded-md border border-gray-500'>
                <label className='flex w-full items-stretch'>
                  <div className='inline-flex min-w-fit items-center rounded-s-md bg-[#2D3250] pl-4'>
                    <span className='text-sm text-white'>indilens.com/</span>
                  </div>
                  <input
                    type='text'
                    className='block w-full rounded-e-md bg-[#2D3250] py-3 pe-11 pl-0.5 pr-4 text-sm text-white shadow-sm focus:outline-none'
                    placeholder='yourname'
                  ></input>
                </label>
              </div>
            </div>
            <button
              className='w-64 rounded-md bg-[#F6B17A] px-4 font-semibold text-gray-700 shadow-sm ring-1 ring-[#f8a765] transition-all duration-150 ease-in-out hover:bg-[#f0a467]'
              type='submit'
            >
              Claim your showcase
            </button>
          </form>
        </div>
        <div className='bg-base-100 max-h-[28rem] overflow-hidden rounded-t-[3.5rem] border-l-[12px] border-r-[12px] border-t-[12px] border-black/75 md:order-first md:aspect-[9/18] md:max-h-none md:max-w-[24rem] lg:rounded-[4rem] lg:border-[14px]'>
          <Image width={850} height={1838} alt='thing' src={'/417032.jpg'} />
        </div>
      </div>
    </div>
  )
}
