const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function diagnose() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\nAvailable Collections:', collections.map(c => c.name).join(', '));

        for (const colName of ['events', 'deliverylogs', 'pickuplogs']) {
            const count = await db.collection(colName).countDocuments();
            console.log(`\nCollection: ${colName} | Count: ${count}`);
            
            if (count > 0) {
                const latest = await db.collection(colName).find().sort({ timestamp: -1, _id: -1 }).limit(10).toArray();
                console.log(`Latest 10 entries for ${colName}:`);
                latest.forEach(doc => {
                    const ts = doc.timestamp || doc.createdAt || doc._id.getTimestamp();
                    console.log(`- TS: ${ts.toISOString()} | ${doc.type || 'N/A'} | ${doc.description || 'N/A'}`);
                });
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSIS FAILED:', err);
        process.exit(1);
    }
}

diagnose();
