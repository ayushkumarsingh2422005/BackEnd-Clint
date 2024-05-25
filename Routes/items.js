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
        CREATE TABLE IF NOT EXISTS Order_detail (
            orderId TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone_number INTEGER NOT NULL,
            restaurant TEXT NOT NULL,
            table_number INTEGER NOT NULL,
            items_desc TEXT NOT NULL,
            total_bill REAL NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
};
createTable();

// Route to add data to the database
router.post('/add', async (req, res) => {
    const { name, phone_number, restaurant, table_number, items_desc } = req.body;
    // const orderId = shortid.generate();
    const orderId = await generateUniqueOrderId();
    const date = new Date().toISOString();
    try {
        const items = Array.isArray(items_desc) ? items_desc : JSON.parse(items_desc);
        const total_bill = await calculateTotalBill(items);
        const db = await dbPromise;
        await db.run(`
            INSERT INTO Order_detail (orderId, name, phone_number, restaurant, table_number, items_desc,total_bill, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [orderId, name, phone_number, restaurant, table_number, JSON.stringify(items_desc),total_bill, date]);

        res.json({ orderId, name, phone_number, restaurant, table_number, items_desc,total_bill, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete data by orderId
router.delete('/del/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const db = await dbPromise;
        const result = await db.run(`DELETE FROM Order_detail WHERE orderId = ?`, orderId);

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
        const items = Array.isArray(items_desc) ? items_desc : JSON.parse(items_desc);
        const total_bill = await calculateTotalBill(items);
        const db = await dbPromise;
        const result = await db.run(`
            UPDATE Order_detail
            SET name = ?, phone_number = ?, restaurant = ?, table_number = ?, items_desc = ?, total_bill = ?
            WHERE orderId = ?
        `, [name, phone_number, restaurant, table_number, JSON.stringify(items_desc), total_bill, orderId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ orderId, name, phone_number, restaurant, table_number, items_desc, total_bill });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to retrieve all orders
router.get('/getall', async (req, res) => {
    try {
        const db = await dbPromise;
        const allOrders = await db.all(`SELECT * FROM Order_detail`);

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

const generateUniqueOrderId = async () => {
    const db = await dbPromise;
    let isUnique = false;
    let orderId;

    while (!isUnique) {
        orderId = Math.floor(100000 + Math.random() * 900000).toString();
        const existingOrder = await db.get('SELECT 1 FROM Order_detail WHERE orderId = ?', [orderId]);
        if (!existingOrder) {
            isUnique = true;
        }
    }

    return orderId;
};

const calculateTotalBill = async (items) => {
    const db = await dbPromise;
    let totalBill = 0;

    for (const item of items) {
        const { item_id, item_quantity, item_plate } = item;

        const dish = await db.get('SELECT * FROM Dishes WHERE dishId = ?', [item_id]);
        
        if (dish) {
            let itemPrice = 0;
            if (item_plate === 'full') {
                itemPrice = dish.restaurant_full_price;
            } else if (item_plate === 'half') {
                itemPrice = dish.restaurant_half_price;
            }

            totalBill += itemPrice * item_quantity;
        }
    }

    return totalBill;
};