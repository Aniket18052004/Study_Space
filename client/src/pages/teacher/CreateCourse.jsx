import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/axiosInstance'

const CATEGORIES = [
    'Math', 'Physics', 'Biology',
    'Chemistry', 'CS', 'English', 'Other',
]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil',
    'Kannada', 'Marathi', 'Bengali', 'Other']

const CreateCourse = () => {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [thumbnail, setThumbnail] = useState(null)
    const [preview, setPreview] = useState('')
    const [uploadPct, setUploadPct] = useState(0)

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Math',
        level: 'Beginner',
        language: 'English',
        price: '',
        discountPrice: '',
        tags: '',
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleThumbnail = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.')
            return
        }

        // Check file size — max 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB.')
            return
        }

        setThumbnail(file)
        setPreview(URL.createObjectURL(file))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!form.title.trim()) {
            setError('Course title is required.')
            return
        }
        if (!form.description.trim()) {
            setError('Course description is required.')
            return
        }
        if (form.price !== '' && isNaN(Number(form.price))) {
            setError('Price must be a valid number.')
            return
        }
        if (
            form.discountPrice !== '' &&
            Number(form.discountPrice) >= Number(form.price)
        ) {
            setError('Discount price must be less than original price.')
            return
        }

        setLoading(true)
        try {
            // Build FormData for file upload
            const data = new FormData()
            data.append('title', form.title.trim())
            data.append('description', form.description.trim())
            data.append('category', form.category)
            data.append('level', form.level)
            data.append('language', form.language)
            data.append('price', form.price || '0')
            data.append('discountPrice', form.discountPrice || '0')
            data.append('tags', form.tags)

            if (thumbnail) {
                data.append('thumbnail', thumbnail)
            }

            await api.post('/courses', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    setUploadPct(pct)
                },
            })

            navigate('/dashboard/teacher')
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to create course. Please try again.'
            )
        } finally {
            setLoading(false)
            setUploadPct(0)
        }
    }

    return (
        <div className='max-w-2xl mx-auto px-6 py-10'>

            {/* Header */}
            <div className='mb-8'>
                <Link
                    to='/dashboard/teacher'
                    className='text-xs font-bold text-indigo-500
                     hover:text-indigo-700 mb-3 block'
                >
                    ← Back to Dashboard
                </Link>
                <p className='text-xs font-bold text-emerald-600
                      uppercase tracking-widest mb-1'>
                    New Course
                </p>
                <h1 className='text-3xl font-extrabold text-indigo-900
                       tracking-tight'>
                    Create a Course
                </h1>
                <p className='text-indigo-400 text-sm mt-1'>
                    Fill in the details below to publish your course
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className='bg-red-50 border border-red-200 text-red-700
                        text-sm rounded-xl p-4 mb-6
                        flex items-start gap-2'>
                    <span className='text-red-500 mt-0.5'>⚠</span>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>

                {/* ── Thumbnail upload ─────────────────────────────── */}
                <div>
                    <label className='block text-sm font-bold
                            text-indigo-700 mb-2'>
                        Course Thumbnail
                    </label>

                    {preview ? (
                        <div className='relative'>
                            <img
                                src={preview}
                                alt='Thumbnail preview'
                                className='w-full h-48 object-cover rounded-2xl
                           border-2 border-indigo-200'
                            />
                            <button
                                type='button'
                                onClick={() => {
                                    setThumbnail(null)
                                    setPreview('')
                                }}
                                className='absolute top-3 right-3 bg-white
                           text-red-500 border border-red-200
                           rounded-lg px-3 py-1 text-xs font-bold
                           hover:bg-red-50'
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <label className='flex flex-col items-center justify-center
                              w-full h-40 rounded-2xl border-2
                              border-dashed border-indigo-300
                              bg-indigo-50 cursor-pointer
                              hover:border-indigo-500
                              hover:bg-indigo-100 transition-all'>
                            <div className='text-3xl mb-2'>🖼️</div>
                            <p className='text-sm font-semibold text-indigo-600'>
                                Click to upload thumbnail
                            </p>
                            <p className='text-xs text-indigo-400 mt-1'>
                                JPG, PNG, WebP — max 5MB
                            </p>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleThumbnail}
                                className='hidden'
                            />
                        </label>
                    )}
                </div>

                {/* ── Title ────────────────────────────────────────── */}
                <div>
                    <label className='block text-sm font-bold
                            text-indigo-700 mb-1.5'>
                        Course Title <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='text'
                        name='title'
                        value={form.title}
                        onChange={handleChange}
                        placeholder='e.g. Complete CBSE Mathematics Class 10'
                        maxLength={100}
                        required
                        className='w-full border border-indigo-200 rounded-xl
                       px-4 py-2.5 text-sm text-indigo-900
                       placeholder-indigo-300 outline-none
                       focus:border-indigo-500 focus:ring-2
                       focus:ring-indigo-100 transition-all'
                    />
                    <p className='text-xs text-indigo-400 mt-1 text-right'>
                        {form.title.length}/100
                    </p>
                </div>

                {/* ── Description ──────────────────────────────────── */}
                <div>
                    <label className='block text-sm font-bold
                            text-indigo-700 mb-1.5'>
                        Description <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                        name='description'
                        value={form.description}
                        onChange={handleChange}
                        placeholder='Describe what students will learn, who this course is for, and what topics are covered...'
                        rows={5}
                        required
                        className='w-full border border-indigo-200 rounded-xl
                       px-4 py-2.5 text-sm text-indigo-900
                       placeholder-indigo-300 outline-none
                       focus:border-indigo-500 focus:ring-2
                       focus:ring-indigo-100 transition-all resize-none'
                    />
                </div>

                {/* ── Category + Level + Language row ──────────────── */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                        <label className='block text-sm font-bold
                              text-indigo-700 mb-1.5'>
                            Category <span className='text-red-500'>*</span>
                        </label>
                        <select
                            name='category'
                            value={form.category}
                            onChange={handleChange}
                            className='w-full border border-indigo-200 rounded-xl
                         px-4 py-2.5 text-sm text-indigo-900
                         outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-100
                         bg-white cursor-pointer'
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-bold
                              text-indigo-700 mb-1.5'>
                            Level <span className='text-red-500'>*</span>
                        </label>
                        <select
                            name='level'
                            value={form.level}
                            onChange={handleChange}
                            className='w-full border border-indigo-200 rounded-xl
                         px-4 py-2.5 text-sm text-indigo-900
                         outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-100
                         bg-white cursor-pointer'
                        >
                            {LEVELS.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-bold
                              text-indigo-700 mb-1.5'>
                            Language
                        </label>
                        <select
                            name='language'
                            value={form.language}
                            onChange={handleChange}
                            className='w-full border border-indigo-200 rounded-xl
                         px-4 py-2.5 text-sm text-indigo-900
                         outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-100
                         bg-white cursor-pointer'
                        >
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Price + Discount row ──────────────────────────── */}
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-sm font-bold
                              text-indigo-700 mb-1.5'>
                            Price (₹)
                        </label>
                        <div className='relative'>
                            <span className='absolute left-4 top-1/2
                               -translate-y-1/2 text-indigo-400
                               font-bold text-sm'>
                                ₹
                            </span>
                            <input
                                type='number'
                                name='price'
                                value={form.price}
                                onChange={handleChange}
                                placeholder='0 for free'
                                min='0'
                                className='w-full border border-indigo-200 rounded-xl
                           pl-8 pr-4 py-2.5 text-sm text-indigo-900
                           placeholder-indigo-300 outline-none
                           focus:border-indigo-500 focus:ring-2
                           focus:ring-indigo-100 transition-all'
                            />
                        </div>
                        <p className='text-xs text-indigo-400 mt-1'>
                            Leave empty or 0 for free course
                        </p>
                    </div>

                    <div>
                        <label className='block text-sm font-bold
                              text-indigo-700 mb-1.5'>
                            Discount Price (₹)
                        </label>
                        <div className='relative'>
                            <span className='absolute left-4 top-1/2
                               -translate-y-1/2 text-indigo-400
                               font-bold text-sm'>
                                ₹
                            </span>
                            <input
                                type='number'
                                name='discountPrice'
                                value={form.discountPrice}
                                onChange={handleChange}
                                placeholder='Optional'
                                min='0'
                                className='w-full border border-indigo-200 rounded-xl
                           pl-8 pr-4 py-2.5 text-sm text-indigo-900
                           placeholder-indigo-300 outline-none
                           focus:border-indigo-500 focus:ring-2
                           focus:ring-indigo-100 transition-all'
                            />
                        </div>
                        <p className='text-xs text-indigo-400 mt-1'>
                            Must be less than original price
                        </p>
                    </div>
                </div>

                {/* Price preview */}
                {form.price > 0 && (
                    <div className='bg-indigo-50 border border-indigo-200
                          rounded-xl p-4'>
                        <p className='text-sm font-semibold text-indigo-700'>
                            Price preview:
                        </p>
                        <div className='flex items-baseline gap-3 mt-1'>
                            <span className='text-xl font-extrabold text-indigo-900'>
                                ₹{form.discountPrice || form.price}
                            </span>
                            {form.discountPrice > 0 && form.discountPrice < form.price && (
                                <>
                                    <span className='text-indigo-400 line-through text-sm'>
                                        ₹{form.price}
                                    </span>
                                    <span className='text-emerald-600 text-sm font-bold'>
                                        {Math.round(
                                            ((form.price - form.discountPrice) / form.price) * 100
                                        )}% off
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tags ─────────────────────────────────────────── */}
                <div>
                    <label className='block text-sm font-bold
                            text-indigo-700 mb-1.5'>
                        Tags
                    </label>
                    <input
                        type='text'
                        name='tags'
                        value={form.tags}
                        onChange={handleChange}
                        placeholder='algebra, class10, cbse, trigonometry'
                        className='w-full border border-indigo-200 rounded-xl
                       px-4 py-2.5 text-sm text-indigo-900
                       placeholder-indigo-300 outline-none
                       focus:border-indigo-500 focus:ring-2
                       focus:ring-indigo-100 transition-all'
                    />
                    <p className='text-xs text-indigo-400 mt-1'>
                        Separate tags with commas — helps students find your course
                    </p>

                    {/* Tag preview */}
                    {form.tags && (
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {form.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                                <span
                                    key={tag}
                                    className='text-xs font-semibold text-indigo-600
                             bg-indigo-50 border border-indigo-200
                             px-2.5 py-1 rounded-xl'
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Upload progress ───────────────────────────────── */}
                {loading && uploadPct > 0 && (
                    <div>
                        <div className='flex justify-between text-xs
                            text-indigo-600 font-semibold mb-1'>
                            <span>Uploading...</span>
                            <span>{uploadPct}%</span>
                        </div>
                        <div className='h-2 bg-indigo-100 rounded-full overflow-hidden'>
                            <div
                                className='h-full bg-indigo-600 rounded-full
                           transition-all duration-300'
                                style={{ width: `${uploadPct}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Submit button ─────────────────────────────────── */}
                <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-indigo-700 text-white py-3.5
                     rounded-xl font-bold text-sm
                     hover:bg-indigo-600 disabled:opacity-60
                     disabled:cursor-not-allowed shadow-lg
                     shadow-indigo-200 transition-all'
                >
                    {loading ? (
                        <span className='flex items-center justify-center gap-2'>
                            <span className='w-4 h-4 border-2 border-white
                               border-t-transparent rounded-full
                               animate-spin' />
                            Creating Course...
                        </span>
                    ) : (
                        'Create Course →'
                    )}
                </button>

                <p className='text-center text-xs text-indigo-400'>
                    Your course will be saved as a draft.
                    You can add lessons and publish it from your dashboard.
                </p>

            </form>
        </div>
    );
};

export default CreateCourse;