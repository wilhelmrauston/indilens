import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import SearchField from '../UI/Forms/SearchField'
import SearchResultCard from '../UI/global/SearchResultCard'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/v1/search?query=${searchTerm}`)
      const data = await response.json()
      setSearchResult(data)
    } catch (error) {
      console.error('Error fetching search results:', error)
      setSearchResult([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      handleSearch()
    } else {
      setSearchResult([])
    }
  }, [searchTerm])

  const handleInputChange = event => {
    setSearchTerm(event.target.value)
  }

  const filteredResults = searchResult.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.manufactured_by &&
        item.manufactured_by.owner_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      item.dpp_class.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='relative w-full md:w-[250px]'>
      <div className='relative w-full'>
        <div className='flex w-full items-center'>
          <SearchField
            className='w-full'
            placeholder={'Search for a product...'}
            id='searchBar'
            name='searchBar'
            type='text'
            defaultValue={''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {filteredResults.length > 0 && (
        <ul
          className={`absolute left-0 top-16 w-full cursor-pointer rounded-md border border-transparent bg-white text-blue-900 shadow-lg`}
        >
          {filteredResults.map((item, index) => {
            if (!item) {
              return null
            }

            const uniqueKey = item.id || item.name + item.dpp_class + index

            return (
              <li
                key={uniqueKey}
                className='flex flex-row items-center space-x-4 p-2 hover:bg-gray-100'
              >
                <SearchResultCard item={item} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
