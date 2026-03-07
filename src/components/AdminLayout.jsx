import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ children, title = 'Overview' }) => {
    return (
        <div className="min-h-screen bg-[#F3F6F9] font-sans flex text-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header title={title} />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
