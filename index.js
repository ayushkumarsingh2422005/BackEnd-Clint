// Import necessary modules
import express from 'express';
import cors from 'cors';
import dbPromise from './db.js';
import itemsRouter from './Routes/items.js';
import dishesRouter from './Routes/dishes.js';
import adminAuthRouter from './Routes/adminAuth.js';

// Create an Express app
const app = express();

// Middleware to log all requests and responses
app.use((req, res, next) => {
    // Log the request method, URL, and body
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${JSON.stringify(req.body)}`);

    // Capture the original res.send function
    const originalSend = res.send;

    // Override res.send to log the response body
    res.send = function (body) {
        console.log(`[${new Date().toISOString()}] Response sent:`, body);
        return originalSend.apply(res, arguments); // Call original function
    };

    next(); // Call the next middleware
});

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/orders', itemsRouter);
app.use('/api/dishes', dishesRouter);
app.use('/api/admin', adminAuthRouter);

// Default route
app.get('/', (req, res) => {
    res.json({"message": "Server is running"});
});

// Start the server
const PORT = process.env.PORT || 3000;

// Connect to the database and start the server
dbPromise.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
}).catch(err => {
    console.error('DB Error:', err);
});
