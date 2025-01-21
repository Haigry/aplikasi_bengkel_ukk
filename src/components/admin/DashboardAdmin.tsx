"use client"
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

const DashboardAdmin: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar isOpen={sidebarOpen} />
            
            <div className="flex flex-col flex-1">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <MainContent />
            </div>
        </div>
    );
};

export default DashboardAdmin;
