import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LogOut, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

function Navbar() {
  const { user, setUser, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <Link to={isLoggedIn ? "/dashboard" : "/login"} className="text-xl font-bold text-gray-800">
              Agri-Advisor
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/login'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/register'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-green-600 border border-green-600'
                  }`}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;