import React from 'react';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                <button onClick={onMenuClick} className="text-gray-500 focus:outline-none lg:hidden">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            <div className="flex items-center">
                <div className="relative">
                    <button className="flex items-center text-gray-700 dark:text-gray-200 focus:outline-none">
                        <span className="text-sm">Admin User</span>
                        <svg className="w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
