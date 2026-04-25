import { Link } from 'react-router-dom'

const CourseCard = ({ course }) => {
    return (
        <Link
            to={`/courses/${course._id}`}
            className='bg-white rounded-2xl border border-indigo-100
                 hover:shadow-xl hover:-translate-y-1.5
                 transition-all duration-300 overflow-hidden
                 block group'
        >
            {/* Thumbnail */}
            <div className='relative overflow-hidden'>
                <img
                    src={
                        course.thumbnail ||
                        `https://via.placeholder.com/400x220?text=${encodeURIComponent(course.title)}`
                    }
                    alt={course.title}
                    className='w-full h-44 object-cover
                     group-hover:scale-105 transition-transform duration-300'
                />

                {/* Category badge */}
                <span className='absolute top-3 left-3 bg-white/90
                         text-indigo-700 text-xs font-bold
                         px-2.5 py-1 rounded-lg border border-indigo-100'>
                    {course.category}
                </span>

                {/* Free badge */}
                {course.price === 0 && (
                    <span className='absolute top-3 right-3 bg-emerald-500
                           text-white text-xs font-bold
                           px-2.5 py-1 rounded-lg'>
                        Free
                    </span>
                )}
            </div>

            {/* Content */}
            <div className='p-4'>
                {/* Level + students row */}
                <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-xs font-bold text-indigo-400'>
                        {course.level}
                    </span>
                    <span className='text-xs text-indigo-300'>
                        {course.enrolledStudents?.length || 0} students
                    </span>
                </div>

                {/* Title */}
                <h3 className='font-bold text-indigo-900 text-sm mb-1
                       line-clamp-2 leading-snug'>
                    {course.title}
                </h3>

                {/* Teacher name */}
                <p className='text-xs text-indigo-400 mb-3'>
                    by {course.teacher?.name || 'Unknown Teacher'}
                </p>

                {/* Price + rating row */}
                <div className='flex items-center justify-between
                        pt-3 border-t border-indigo-50'>
                    <div>
                        {course.price === 0 ? (
                            <span className='text-emerald-600 font-extrabold text-sm'>
                                Free
                            </span>
                        ) : (
                            <div className='flex items-center gap-2'>
                                <span className='text-indigo-900 font-extrabold text-sm'>
                                    ₹{course.discountPrice || course.price}
                                </span>
                                {course.discountPrice > 0 && (
                                    <span className='text-indigo-300 text-xs line-through'>
                                        ₹{course.price}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <span className='text-xs text-amber-500 font-bold'>
                        {course.rating > 0 ? `★ ${course.rating}` : 'New'}
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default CourseCard