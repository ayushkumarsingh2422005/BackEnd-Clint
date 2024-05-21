// routes/dishRoutes.js
import { Router } from 'express';
import shortid from 'shortid';
import dbPromise from '../db.js';

const router = Router();

// Create the Dishes table if it doesn't exist
const createTable = async () => {
    try {
        const db = await dbPromise;
        await db.run(`
            CREATE TABLE IF NOT EXISTS Dishes (
                dishId TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                restaurant_half_price INTEGER NOT NULL DEFAULT 0,
                restaurant_full_price INTEGER NOT NULL DEFAULT 0,
                zomato_half_price INTEGER NOT NULL DEFAULT 0,
                zomato_full_price INTEGER NOT NULL DEFAULT 0,
                swiggy_half_price INTEGER NOT NULL DEFAULT 0,
                swiggy_full_price INTEGER NOT NULL DEFAULT 0
            )
        `);
    } catch (err) {
        console.error("Error creating table:", err.message);
    }
};
createTable();

// Route to add data to the database
router.post('/add', async (req, res) => {
    const { name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price } = req.body;
    const dishId = shortid.generate();

    try {
        const db = await dbPromise;
        await db.run(`
            INSERT INTO Dishes (dishId, name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [dishId, name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price]);

        res.json({ dishId, name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete a dish by dishId
router.delete('/del/:id', async (req, res) => {
    const dishId = req.params.id;

    try {
        const db = await dbPromise;
        const result = await db.run(`DELETE FROM Dishes WHERE dishId = ?`, dishId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        res.json({ message: 'Dish deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to update a dish
router.put('/update/:id', async (req, res) => {
    const dishId = req.params.id;
    const { name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price } = req.body;

    try {
        const db = await dbPromise;
        const result = await db.run(`
            UPDATE Dishes
            SET name = ?, category = ?, restaurant_half_price = ?, restaurant_full_price = ?, zomato_half_price = ?, zomato_full_price = ?, swiggy_half_price = ?, swiggy_full_price = ?
            WHERE dishId = ?
        `, [name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price, dishId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        res.json({ dishId, name, category, restaurant_half_price, restaurant_full_price, zomato_half_price, zomato_full_price, swiggy_half_price, swiggy_full_price });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to retrieve all dishes
router.get('/getall', async (req, res) => {
    try {
        const db = await dbPromise;
        const allDishes = await db.all(`SELECT * FROM Dishes`);
        res.json(allDishes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;