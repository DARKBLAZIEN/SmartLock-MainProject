import React, { useContext } from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import { SearchContext } from '../contexts/SearchContext';

const Header = ({ title }) => {
    const { searchQuery, setSearchQuery } = useContext(SearchContext);

    return (
        <header
            className="h-16 backdrop-blur-md border-b px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)'
            }}
        >
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
                        style={{
                            backgroundColor: 'var(--color-bg-surface2)',
                            color: 'var(--color-text-primary)',
                            border: 'none'
                        }}
                    />
                </div>

                {/* Actions */}
                <button className="relative p-2 transition-colors" style={{ color: 'var(--color-text-subtle)' }}>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" style={{ border: '2px solid var(--color-bg-surface)' }}></span>
                </button>

                <div className="flex items-center gap-3 pl-6" style={{ borderLeft: '1px solid var(--color-border)' }}>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Admin User</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Super Admin</p>
                    </div>
                    <div className="h-9 w-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm text-indigo-600" style={{ border: '2px solid var(--color-border)' }}>
                        <UserCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
