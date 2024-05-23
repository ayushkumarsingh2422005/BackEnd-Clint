import express from "express";
import itemsRouter from './Routes/items.js';
import dishesRouter from './Routes/dishes.js';
import dbPromise from "./db.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/order', itemsRouter);
app.use('/api/dishes', dishesRouter);

app.get('/', (req, res) => {
    res.json({"message": "Server is running"});
});

// Starting server
const PORT = process.env.PORT || 3000;
dbPromise.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
}).catch(err => {
    console.error('DB Error:', err);
});
