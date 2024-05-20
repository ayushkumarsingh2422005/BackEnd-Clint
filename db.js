// db.js
import mongoose from 'mongoose';

const connectToMongoose = async () => {
    const dbURI = 'mongodb+srv://admin:20/05/24@admin@main.joy023z.mongodb.net/?retryWrites=true&w=majority&appName=Main';
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

export default connectToMongoose;
