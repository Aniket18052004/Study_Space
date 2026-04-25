import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/axiosInstance'
import CourseCard from '../components/CourseCard'

const CATEGORIES = ['All', 'Math', 'Physics', 'Biology',
                    'Chemistry', 'CS', 'English', 'Other']
const LEVELS     = ['All', 'Beginner', 'Intermediate', 'Advanced']
const PRICES     = [
  { label: 'All Prices', value: 'all'  },
  { label: 'Free',       value: 'free' },
  { label: 'Paid',       value: 'paid' },
]

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial values from URL query params
  const [search,   setSearch]   = useState(searchParams.get('search')   || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [level,    setLevel]    = useState(searchParams.get('level')    || 'All')
  const [price,    setPrice]    = useState(searchParams.get('price')    || 'all')
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1)

  const [courses,    setCourses]    = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  // Fetch courses when filters change
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }

      if (search)           params.search   = search
      if (category !== 'All') params.category = category
      if (level    !== 'All') params.level    = level
      if (price === 'free') params.maxPrice = 0
      if (price === 'paid') params.minPrice = 1

      const { data } = await api.get('/courses', { params })
      setCourses(data.courses)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoading(false)
    }
  }, [search, category, level, price, page])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Update URL params when filters change
  useEffect(() => {
    const params = {}
    if (search)             params.search   = search
    if (category !== 'All') params.category = category
    if (level    !== 'All') params.level    = level
    if (price    !== 'all') params.price    = price
    if (page     > 1)       params.page     = page
    setSearchParams(params)
  }, [search, category, level, price, page])

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  // Search with debounce
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setCategory('All')
    setLevel('All')
    setPrice('all')
    setPage(1)
  }

  const hasActiveFilters = search || category !== 'All' ||
                           level !== 'All' || price !== 'all'

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>

      {/* ── Page header ──────────────────────────────────── */}
      <div className='mb-8'>
        <p className='text-xs font-bold text-emerald-600
                      uppercase tracking-widest mb-1'>
          All Courses
        </p>
        <h1 className='text-3xl font-extrabold text-indigo-900
                       tracking-tight mb-2'>
          Find Your Perfect Course
        </h1>
        <p className='text-indigo-400 text-sm'>
          {total > 0
            ? `${total} course${total > 1 ? 's' : ''} available`
            : 'Browse our collection of expert-led courses'
          }
        </p>
      </div>

      {/* ── Search bar ───────────────────────────────────── */}
      <div className='relative mb-6'>
        <div className='absolute left-4 top-1/2 -translate-y-1/2
                        text-indigo-400'>
          <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24'
               stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round'
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
        </div>
        <input
          type='text'
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder='Search courses by title, topic or keyword...'
          className='w-full border border-indigo-200 rounded-xl
                     pl-10 pr-4 py-3 text-sm text-indigo-900
                     placeholder-indigo-300 outline-none
                     focus:border-indigo-500 focus:ring-2
                     focus:ring-indigo-100 bg-white transition-all'
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className='absolute right-4 top-1/2 -translate-y-1/2
                       text-indigo-300 hover:text-indigo-600
                       font-bold text-sm'
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Filters row ──────────────────────────────────── */}
      <div className='flex flex-wrap gap-3 mb-8 items-center'>

        {/* Category filter */}
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilterChange(setCategory)(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold
                          border transition-all
                          ${category === cat
                            ? 'bg-indigo-700 text-white border-indigo-700'
                            : 'bg-white text-indigo-500 border-indigo-200 hover:border-indigo-400'
                          }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className='w-px h-6 bg-indigo-200 hidden md:block' />

        {/* Level filter */}
        <select
          value={level}
          onChange={e => handleFilterChange(setLevel)(e.target.value)}
          className='border border-indigo-200 rounded-xl px-3 py-1.5
                     text-xs font-bold text-indigo-600 bg-white
                     outline-none focus:border-indigo-500 cursor-pointer'
        >
          {LEVELS.map(l => (
            <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>
          ))}
        </select>

        {/* Price filter */}
        <select
          value={price}
          onChange={e => handleFilterChange(setPrice)(e.target.value)}
          className='border border-indigo-200 rounded-xl px-3 py-1.5
                     text-xs font-bold text-indigo-600 bg-white
                     outline-none focus:border-indigo-500 cursor-pointer'
        >
          {PRICES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='px-3 py-1.5 rounded-xl text-xs font-bold
                       text-red-500 border border-red-200
                       bg-red-50 hover:bg-red-100 transition-all'
          >
            Clear filters ✕
          </button>
        )}

      </div>

      {/* ── Course grid ──────────────────────────────────── */}
      {loading ? (
        // Skeleton loading cards
        <div className='grid grid-cols-1 sm:grid-cols-2
                        lg:grid-cols-3 xl:grid-cols-4 gap-5'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className='bg-white rounded-2xl border border-indigo-100
                         overflow-hidden animate-pulse'
            >
              <div className='bg-indigo-100 h-44' />
              <div className='p-4 space-y-3'>
                <div className='flex justify-between'>
                  <div className='bg-indigo-100 h-3 w-16 rounded' />
                  <div className='bg-indigo-100 h-3 w-16 rounded' />
                </div>
                <div className='bg-indigo-100 h-4 rounded w-3/4' />
                <div className='bg-indigo-100 h-3 rounded w-1/2' />
                <div className='flex justify-between pt-2
                                border-t border-indigo-50'>
                  <div className='bg-indigo-100 h-4 w-16 rounded' />
                  <div className='bg-indigo-100 h-4 w-10 rounded' />
                </div>
              </div>
            </div>
          ))}
        </div>

      ) : courses.length === 0 ? (
        // Empty state
        <div className='text-center py-20'>
          <div className='text-6xl mb-4'>🔍</div>
          <h3 className='text-xl font-extrabold text-indigo-900 mb-2'>
            No courses found
          </h3>
          <p className='text-indigo-400 text-sm mb-6'>
            Try adjusting your search or filters to find what you are
            looking for.
          </p>
          <button
            onClick={clearFilters}
            className='bg-indigo-700 text-white px-6 py-2.5
                       rounded-xl font-bold text-sm hover:bg-indigo-600'
          >
            Clear all filters
          </button>
        </div>

      ) : (
        // Course cards grid
        <div className='grid grid-cols-1 sm:grid-cols-2
                        lg:grid-cols-3 xl:grid-cols-4 gap-5'>
          {courses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className='flex items-center justify-center gap-2 mt-12'>

          {/* Previous button */}
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-4 py-2 rounded-xl text-sm font-bold
                       border border-indigo-200 text-indigo-600
                       hover:bg-indigo-50 disabled:opacity-40
                       disabled:cursor-not-allowed transition-all'
          >
            ← Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - page) <= 1
            )
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) {
                acc.push('...')
              }
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span
                  key={`dots-${i}`}
                  className='px-2 text-indigo-300 font-bold'
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold
                              transition-all
                              ${page === p
                                ? 'bg-indigo-700 text-white shadow-md'
                                : 'border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                              }`}
                >
                  {p}
                </button>
              )
            )
          }

          {/* Next button */}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className='px-4 py-2 rounded-xl text-sm font-bold
                       border border-indigo-200 text-indigo-600
                       hover:bg-indigo-50 disabled:opacity-40
                       disabled:cursor-not-allowed transition-all'
          >
            Next →
          </button>

        </div>
      )}

      {/* Page info */}
      {!loading && total > 0 && (
        <p className='text-center text-xs text-indigo-400 mt-4'>
          Showing page {page} of {totalPages} —{' '}
          {total} total course{total > 1 ? 's' : ''}
        </p>
      )}

    </div>
  )
}

export default CourseList