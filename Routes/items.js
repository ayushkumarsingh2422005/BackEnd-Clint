// routes/userRoutes.js
import { Router } from 'express';
import shortid from 'shortid';
import dbPromise from '../db.js';
// Open the database connection

const router = Router();

// Create the Order table if it doesn't exist
const createTable = async () => {
    const db = await dbPromise;
    await db.run(`
        CREATE TABLE IF NOT EXISTS \`Order\` (
            orderId TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone_number INTEGER NOT NULL,
            restaurant TEXT NOT NULL,
            table_number INTEGER NOT NULL,
            items_desc TEXT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
};
createTable();

// Route to add data to the database
router.post('/add', async (req, res) => {
    const { name, phone_number, restaurant, table_number, items_desc } = req.body;
    const orderId = shortid.generate();
    const date = new Date().toISOString();

    try {
        const db = await dbPromise;
        await db.run(`
            INSERT INTO \`Order\` (orderId, name, phone_number, restaurant, table_number, items_desc, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [orderId, name, phone_number, restaurant, table_number, JSON.stringify(items_desc), date]);

        res.json({ orderId, name, phone_number, restaurant, table_number, items_desc, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete data by orderId
router.delete('/del/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const db = await dbPromise;
        const result = await db.run(`DELETE FROM \`Order\` WHERE orderId = ?`, orderId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to update data
router.put('/update/:id', async (req, res) => {
    const orderId = req.params.id;
    const { name, phone_number, restaurant, table_number, items_desc } = req.body;

    try {
        const db = await dbPromise;
        const result = await db.run(`
            UPDATE \`Order\`
            SET name = ?, phone_number = ?, restaurant = ?, table_number = ?, items_desc = ?
            WHERE orderId = ?
        `, [name, phone_number, restaurant, table_number, JSON.stringify(items_desc), orderId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ orderId, name, phone_number, restaurant, table_number, items_desc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to retrieve all orders
router.get('/getall', async (req, res) => {
    try {
        const db = await dbPromise;
        const allOrders = await db.all(`SELECT * FROM \`Order\``);

        const ordersWithParsedItemsDesc = allOrders.map(order => ({
            ...order,
            items_desc: JSON.parse(order.items_desc)
        }));

        res.json(ordersWithParsedItemsDesc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
