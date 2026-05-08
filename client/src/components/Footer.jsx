import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className='bg-indigo-900 text-white mt-auto'>
            {/* ── Main footer content ───────────────── */}
            <div className='max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10'>

                {/* Brand column */}
                <div>
                    <div className='text-xl font-extrabold mb-3 tracking-tight'>
                        Study<span className='text-emerald-400'>·</span>Space
                    </div>
                    <p className='text-indigo-300 text-sm leading-relaxed mb-5'>
                        Empowering teachers to sell courses
                        and students to learn — all in one
                        focused platform.
                    </p>
                    {/* Social links */}
                    <div className='flex gap-3'>
                        {['X', 'YT', 'IN', 'IG'].map(s => (
                            <a
                                key={s}
                                href='#'
                                className='w-8 h-8 rounded-lg bg-indigo-800 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-700 transition-colors'
                            >
                                {s}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Platform column */}
                <div>
                    <div className='font-bold text-indigo-300 text-xs uppercase tracking-widest mb-4'>
                        Platform
                    </div>
                    <ul className='space-y-2.5'>
                        {[
                            { label: 'Browse Courses', to: '/courses' },
                            { label: 'Teach on StudySpace', to: '/register' },
                            { label: 'Student Dashboard', to: '/dashboard/student' },
                            { label: 'Teacher Dashboard', to: '/dashboard/teacher' },
                        ].map(({ label, to }) => (
                            <li key={label}>
                                <Link
                                    to={to}
                                    className='text-sm text-indigo-400 hover:text-white transition-colors'
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Company column */}
                <div>
                    <div className='font-bold text-indigo-300 text-xs uppercase tracking-widest mb-4'>
                        Company
                    </div>
                    <ul className='space-y-2.5'>
                        {[
                            'About Us',
                            'Careers',
                            'Blog',
                            'Press Kit',
                            'Contact Us',
                        ].map(item => (
                            <li key={item}>
                                <a
                                    href='#'
                                    className='text-sm text-indigo-400 hover:text-white transition-colors'
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter column */}
                <div>
                    <div className='font-bold text-indigo-300 text-xs uppercase tracking-widest mb-4'>
                        Stay Updated
                    </div>
                    <p className='text-sm text-indigo-400 mb-4 leading-relaxed'>
                        Get latest courses and study tips
                        delivered to your inbox.
                    </p>
                    <div className='flex gap-2'>
                        <input
                            type='email'
                            placeholder='your@email.com'
                            className='flex-1 bg-indigo-800 border border-indigo-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 placeholder-indigo-500'
                        />
                        <button className='bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors'>
                            Go
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className='flex gap-2 mt-4 flex-wrap'>
                        {['SSL Secured', 'GDPR Safe', 'RBI Compliant'].map(b => (
                            <span
                                key={b}
                                className='text-xs font-semibold px-2.5 py-1 bg-indigo-800 border border-indigo-700 text-indigo-300 rounded-lg'
                            >
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom bar ─────────────────────────── */}
            <div className='border-t border-indigo-800'>
                <div className='max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3'>
                    <p className='text-indigo-500 text-xs'>
                        © 2026 <strong className='text-indigo-400'>StudySpace</strong>.
                        All rights reserved.
                    </p>

                    <div className='flex gap-5'>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Accessibility'].map(item => (
                            <a
                                key={item}
                                href='#'
                                className='text-indigo-500 text-xs hover:text-indigo-300 transition-colors'
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>

                <p className='text-indigo-500 text-xs text-center pb-4'>
                    Made with love for learners everywhere
                </p>
            </div>
        </footer>
    );
}

export default Footer;