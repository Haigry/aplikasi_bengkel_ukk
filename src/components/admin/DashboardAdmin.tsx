"use client"
import React, { useState } from 'react';
import MainContent from './MainContent';

const DashboardAdmin: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <MainContent />
      </div>
    </div>
  );
};

export default DashboardAdmin;
