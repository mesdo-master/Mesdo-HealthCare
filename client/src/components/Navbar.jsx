import { BriefcaseMedical, Building2, Home, LogOut, MessageCircleMore, User } from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/mesdo_logo.jpeg'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../store/features/authSlice'

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, currentUser } = useSelector((state => state.auth))
    console.log(currentUser)

    const handleLogout = async () => {
        try {
            dispatch(logoutUser());
            alert('Logout successful');
            navigate('/');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + (error.response?.data?.message || error.message));
        };
    };

    return (
        <nav className='bg-secondary shadow-md sticky top-0 z-10 bg-white'>
            <div className='max-w-7xl mx-auto px-2'>
                <div className='flex justify-between items-center py-3'>
                    <div className='flex items-center space-x-4'>
                        <Link to={'/'}>
                            <img className='h-12 rounded' src={logo} alt='Mesdo' />
                        </Link>
                    </div>
                    <div className='flex items-center gap-2 md:gap-6'>
                        {isAuthenticated ? (
                            <>
                                <Link to={"/"} className='text-neutral flex flex-col items-center'>
                                    <Home size={20} />
                                    <span className='text-xs hidden md:block'>Home</span>
                                </Link>

                                <Link to="/" className='text-neutral flex flex-col items-center'>
                                    <BriefcaseMedical size={20} />
                                    <span className='text-xs hidden md:block'>Job Board</span>
                                </Link>

                                <Link to="/messages" className='text-neutral flex flex-col items-center'>
                                    <MessageCircleMore size={20} />
                                    <span className='text-xs hidden md:block'>Messages</span>
                                </Link>
                                <Link to="/business" className='text-neutral flex flex-col items-center'>
                                    <Building2 size={20} />
                                    <span className='text-xs hidden md:block'>Business</span>
                                </Link>

                                {/* <Link to='/network' className='text-neutral flex flex-col items-center relative'>
                                    <Users size={20} />
                                    <span className='text-xs hidden md:block'>My Network</span>
                                    {unreadConnectionRequestsCount > 0 && (
                                        <span
                                            className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center'
                                        >
                                            {unreadConnectionRequestsCount}
                                        </span>
                                    )}
                                </Link> */}
                                {/* <Link to='/notifications' className='text-neutral flex flex-col items-center relative'>
                                    <Bell size={20} />
                                    <span className='text-xs hidden md:block'>Notifications</span>
                                    {unreadNotificationCount > 0 && (
                                        <span
                                            className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center'
                                        >
                                            {unreadNotificationCount}
                                        </span>
                                    )}
                                </Link> */}
                                <Link
                                    to={`/${currentUser?.data?.username}`}
                                    className='text-neutral flex flex-col items-center'
                                >
                                    <User size={20} />
                                    <span className='text-xs hidden md:block'>me</span>
                                </Link>
                                <button
                                    className='flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800'
                                    onClick={handleLogout}
                                >
                                    <LogOut size={20} />
                                    <span className='hidden md:inline'>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={'/login'} className='btn btn-ghost'>
                                    Sign In
                                </Link>
                                <Link to={'/signup'} className='btn btn-primary'>
                                    Join now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
