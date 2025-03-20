import React from 'react';

const MainContent: React.FC = () => {
    return (
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="container px-6 py-8 mx-auto">
                <h3 className="text-3xl font-medium text-gray-700 dark:text-gray-200">Dashboard</h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Statistics Cards */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"></div>
                        <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h4>
                        <div className="flex items-center pt-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,200</div>
                            <span className="flex items-center px-2 py-0.5 mx-2 text-sm text-green-600 bg-green-100 rounded-full">
                                +5%
                            </span>
                        </div>
                    </div>
                    
                    {/* Add more statistics cards */}
                </div>

                {/* Recent Activity */}
                <div className="mt-8"></div>
                    <h4 className="text-gray-600 dark:text-gray-300">Recent Activity</h4>
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        {/* Add activity list */}
                    </div>
        </main>
    );
};

export default MainContent;
