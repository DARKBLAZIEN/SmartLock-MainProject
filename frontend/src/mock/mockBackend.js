// Simulate network delay
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- MOCK DATABASE ---

const INITIAL_LOCKERS = Array.from({ length: 12 }, (_, i) => ({
    id: `L${101 + i}`,
    status: Math.random() > 0.7 ? 'OCCUPIED' : 'AVAILABLE',
    door: 'CLOSED',
    apartmentId: Math.random() > 0.7 ? `${101 + Math.floor(Math.random() * 20)}` : null,
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString()
}));

const RESIDENTS = Array.from({ length: 20 }, (_, i) => ({
    id: `USR-${100 + i}`,
    name: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright'][i % 5],
    apartment: `${101 + i}`,
    email: `resident${101 + i}@example.com`,
    status: 'ACTIVE',
    lastAccess: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString()
}));

let lockers = [...INITIAL_LOCKERS];
let residents = [...RESIDENTS];
let logs = [];

// Seed logs
for (let i = 0; i < 15; i++) {
    const types = ['DELIVERY', 'PICKUP', 'ADMIN_OVERRIDE', 'SYSTEM_ALERT'];
    logs.push({
        id: `LOG-${Date.now() - i * 1000}`,
        type: types[Math.floor(Math.random() * types.length)],
        description: 'Automated event simulation',
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        lockerId: `L${101 + Math.floor(Math.random() * 12)}`
    });
}


const logEvent = (type, description, details = {}) => {
    const log = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        type,
        description,
        ...details
    };
    logs.unshift(log);
    if (logs.length > 100) logs.pop();
    return log;
};


// --- PUBLIC APIs ---

export const getDashboardStats = async () => {
    await delay(600);
    return {
        totalLockers: lockers.length,
        available: lockers.filter(l => l.status === 'AVAILABLE').length,
        activeIssues: lockers.filter(l => l.door === 'OPEN').length,
        todaysDeliveries: 14, // Mock
        weeklyEfficiency: 92, // Mock %
        revenue: 1250, // Mock $
    };
};

export const getLockers = async () => {
    await delay(400);
    return [...lockers];
};

export const getRecentActivity = async () => {
    await delay(300);
    return [...logs];
};

export const getResidents = async () => {
    await delay(500);
    return [...residents];
};

// Admin Actions
export const addLocker = async (lockerId) => {
    await delay(500);
    // Case-insensitive uniqueness check
    if (lockers.some(l => l.id.toLowerCase() === lockerId.toLowerCase())) {
        throw new Error(`Locker ${lockerId} already exists (Duplicate ID)`);
    }
    const newLocker = {
        id: lockerId,
        status: 'AVAILABLE',
        door: 'CLOSED',
        apartmentId: null,
        lastUpdated: new Date().toISOString()
    };
    lockers.push(newLocker);
    logEvent('SYSTEM_CONFIG', `New locker unit ${lockerId} installed`);
    return newLocker;
};

export const forceOpenLocker = async (lockerId) => {
    await delay(500);
    const locker = lockers.find(l => l.id === lockerId);
    if (locker) {
        locker.door = 'OPEN';
        locker.lastUpdated = new Date().toISOString();
        logEvent('ADMIN_OVERRIDE', `Manual unlock triggers for ${lockerId}`);
    }
};

export const resetLocker = async (lockerId) => {
    await delay(500);
    const locker = lockers.find(l => l.id === lockerId);
    if (locker) {
        locker.status = 'AVAILABLE';
        locker.door = 'CLOSED';
        locker.apartmentId = null;
        locker.lastUpdated = new Date().toISOString();
        logEvent('SYSTEM_MAINTENANCE', `Locker ${lockerId} reset to available`);
    }
};
