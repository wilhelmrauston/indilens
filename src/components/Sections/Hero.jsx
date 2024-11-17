import Image from 'next/image'

export default function Hero() {
  return (
    <div className='relative isolate px-6 py-8 sm:py-12 lg:px-8'>
      <div className='flex flex-col gap-8 md:flex-row md:items-start md:gap-16'>
        <div className='bg-base-100 max-h-[28rem] overflow-hidden rounded-t-[3.5rem] border-l-[12px] border-r-[12px] border-t-[12px] border-black/75 md:order-first md:aspect-[9/18] md:max-h-none md:max-w-[24rem] lg:rounded-[4rem] lg:border-[14px]'>
          <Image width={850} height={1838} alt='thing' src={'/417032.jpg'} />
        </div>
        <div className='max-w-xl space-y-8 text-white md:space-y-12'>
          <div className='text-4xl font-black leading-tight tracking-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight'>
            <h1>Showcase and grow your startups </h1>
            <p className='py-8 text-lg font-normal leading-relaxed tracking-wide text-[#F6B17A]'>
              Create your own profile, populate it with your projects & startups
              and show your journey! Display your value and engage with possible
              business partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
