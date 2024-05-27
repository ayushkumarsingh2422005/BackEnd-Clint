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
            table_number INTEGER NOT NULL,
            items_desc TEXT NOT NULL,
            total_bill REAL NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'paid'))
        )
    `);
};
createTable();

// Route to add data to the database
router.post('/add', async (req, res) => {
    const { name, phone_number, table_number, items_desc, status } = req.body;
    // const orderId = shortid.generate();
    const orderId = await generateUniqueOrderId();
    const date = new Date().toISOString();
    try {
        const items = Array.isArray(items_desc) ? items_desc : JSON.parse(items_desc);
        const total_bill = await calculateTotalBill(items);
        const db = await dbPromise;
        await db.run(`
            INSERT INTO Order_detail (orderId, name, phone_number, table_number, items_desc,total_bill, date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [orderId, name, phone_number, table_number, JSON.stringify(items_desc), total_bill, date, status]);

        res.json({ orderId, name, phone_number, table_number, items_desc, total_bill, date, status });
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
    const { name, phone_number, table_number, items_desc, status } = req.body;

    try {
        const items = Array.isArray(items_desc) ? items_desc : JSON.parse(items_desc);
        const total_bill = await calculateTotalBill(items);
        const db = await dbPromise;
        const result = await db.run(`
            UPDATE Order_detail
            SET name = ?, phone_number = ?, table_number = ?, items_desc = ?, total_bill = ?, status = ?
            WHERE orderId = ?
        `, [name, phone_number, table_number, JSON.stringify(items_desc), total_bill, status, orderId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ orderId, name, phone_number, table_number, items_desc, total_bill, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// rout to update order status
router.put('/update/status/:id', async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    const db = await dbPromise;

    try {
        const result = await db.run(`
            UPDATE Order_detail
            SET status = ?
            WHERE orderId = ?
        `, [status, orderId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// rout to update order status
router.put('/update/menu/:id', async (req, res) => {
    const orderId = req.params.id;
    const { items_desc } = req.body;
    const db = await dbPromise;

    try {
        const result = await db.run(`
            UPDATE Order_detail
            SET items_desc = ?
            WHERE orderId = ?
        `, [JSON.stringify(items_desc), orderId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ items_desc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to retrieve all orders
router.get('/getall/:type', async (req, res) => {
    const type = req.params.type;
    try {
        const db = await dbPromise;
        let allOrders;

        if (type === 'all') {
            allOrders = await db.all('SELECT * FROM Order_detail');
        } else {
            allOrders = await db.all('SELECT * FROM Order_detail WHERE status = ?', [type]);
        }

        const ordersWithParsedItemsDesc = allOrders.map(order => ({
            ...order,
            items_desc: JSON.parse(order.items_desc) // Assuming items_desc is stored as JSON
        }));

        res.json(ordersWithParsedItemsDesc);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: err.message });
    }
});
router.get('/get/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        const db = await dbPromise;
        const order = await db.all('SELECT * FROM Order_detail WHERE orderId = ?', [id]);

        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const ordersWithParsedItemsDesc = await Promise.all(order.map(async order => ({
            ...order,
            items_desc: await getItemMoney(JSON.parse(order.items_desc)) // Assuming items_desc is stored as JSON
        })));

        res.json(ordersWithParsedItemsDesc[0]);
    } catch (err) {
        console.error('Error fetching orders:', err);
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

const getItemMoney = async (items) => {
    const db = await dbPromise;
    let actualData = [];

    for (const item of items) {
        const { item_id, item_name, item_quantity, item_plate } = item;

        let prize;
        if (item_plate == "half") {
            prize = await db.get('SELECT restaurant_half_price FROM Dishes WHERE dishId = ?', [item_id]);
        } else {
            prize = await db.get('SELECT restaurant_full_price FROM Dishes WHERE dishId = ?', [item_id]);
        }
        actualData.push({
            item_id, item_name, item_quantity, item_plate, prize
        })
    }

    return actualData;
};