import { Container } from '@/components/utils/Container'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Leaderboard() {
  const [data, setData] = useState({ last30Days: [], allTime: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/v1/leaderboard')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])
  return (
    <Container>
      <header className='mt-14 flex justify-between gap-4 max-lg:flex-col'>
        <div className='space-y-4'>
          <h1 className='text-3xl font-extrabold text-white md:text-4xl'>
            Can you make $1,000?
          </h1>
          <div className='max-w-xl leading-relaxed text-gray-300/80'>
            Join Indilens to compete with other entrepreneurs and climb the
            leaderboard!
          </div>
        </div>
      </header>
      <div className='relative mt-12 w-full flex-1'>
        <div className='flex gap-12 max-lg:flex-col'>
          <section className='flex min-w-0 flex-1 flex-col gap-4'>
            <h2 className='flex items-center gap-4 text-lg font-extrabold text-gray-200 md:text-xl'>
              Last 30 days
            </h2>
            <div className='h-full min-w-0 overflow-x-auto rounded-xl border-0 border-gray-200/10 bg-gray-700 lg:p-4'>
              <table className='max-lg:table-sm table text-left'>
                <thead className='text-sm'>
                  <tr className='!border-gray-200/10 text-gray-200/60'>
                    <th className='p-4'>RANK</th>
                    <th className='p-4'>STARTUP</th>
                    <th className='p-4'>REVENUE</th>
                    <th className='p-4'>MAKER</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <tbody>
                    <tr>
                      <td colSpan='4' className='text-center'>
                        Loading...
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <LeaderboardTable companies={data.last30Days} />
                )}
              </table>
            </div>
          </section>
          <section className='flex min-w-0 flex-1 flex-col gap-4'>
            <h2 className='flex items-center gap-4 text-lg font-extrabold md:text-xl'>
              All-time
            </h2>
            <div className='h-full min-w-0 overflow-x-auto rounded-xl border-0 border-gray-200/10 bg-gray-700 lg:p-4'>
              <table className='max-lg:table-sm text-left'>
                <thead className='text-sm'>
                  <tr className='!border-gray-200/10 text-gray-200/60'>
                    <th className='p-4'>RANK</th>
                    <th className='p-4'>STARTUP</th>
                    <th className='p-4'>REVENUE</th>
                    <th className='p-4'>MAKER</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <tbody>
                    <tr>
                      <td colSpan='4' className='text-center'>
                        Loading...
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <LeaderboardTable companies={data.allTime} />
                )}
              </table>
            </div>
          </section>
        </div>
        <div className='mt-2 text-xs text-gray-300/60'></div>
      </div>
    </Container>
  )
}

const LeaderboardTable = ({ companies }) => (
  <tbody>
    {companies.map(company => (
      <tr key={company.id} className='!border-gray-200/10'>
        <td className='!border-0 p-4 text-left text-3xl text-[#F6B17A]'>
          <span className='text-3xl'>{company.rank}</span>
        </td>
        <td className='!border-0 p-4'>
          <div className='flex items-center gap-2'>
            <div className='relative inline-flex'>
              <GlobeAltIcon className='h-8 w-8' />
            </div>
            <div className='max-w-[130px] truncate'>
              <a className='cursor-pointer font-medium no-underline'>
                {company.name}
              </a>
            </div>
          </div>
        </td>
        <td className='!border-0 p-4'>
          <span className='text-primary whitespace-nowrap font-bold'>
            <span className='mr-0.5'>$</span>
            {company.revenue}
          </span>
        </td>
        <td className='!border-0 p-4'>
          <div className='flex items-center gap-2'>
            <div className='max-w-[130px]'>
              <div className='truncate whitespace-nowrap font-medium'>
                <a className='cursor-pointer no-underline'>
                  {company.maker && (
                    <Link
                      href={`/${company.maker.slug}`}
                      className='flex items-center gap-2 hover:text-blue-400'
                    >
                      {company.maker.avatarUrl ? (
                        <Image
                          src={company.maker.avatarUrl}
                          alt={company.maker.name}
                          width={24}
                          height={24}
                          className='rounded-full'
                        />
                      ) : (
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-600'>
                          <span className='text-xs'>
                            {company.maker.name[0]}
                          </span>
                        </div>
                      )}
                      <span>{company.maker.name}</span>
                    </Link>
                  )}
                </a>
              </div>
            </div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
)
