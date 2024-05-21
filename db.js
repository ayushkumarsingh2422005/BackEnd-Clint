// db.js
// import mongoose from 'mongoose';

// const connectToMongoose = async () => {
//     const dbURI = 'mongodb+srv://admin:mgJMHdOwpXbLMrwg@orders.mywatlv.mongodb.net/?retryWrites=true&w=majority&appName=Orders';
//     try 
//     {
//         await mongoose.connect(dbURI);
//         console.log('Connected to MongoDB');
//     } catch (err) {
//         console.error('Failed to connect to MongoDB', err);
//     }
// };

// export default connectToMongoose;

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const dbPromise = open({
    filename: 'database.db',
    driver: sqlite3.Database
});

export default dbPromise;