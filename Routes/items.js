// routes/userRoutes.js
import { Router } from 'express';
import Order from '../Models/order.js';

const router = Router();

// Route to add data to the database
router.post('/add', async (req, res) => {
    const { table_number, items_desc } = req.body;

    try {
        const newUser = new Order({ table_number, items_desc });
        const savedUser = await newUser.save();

        res.json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete data by _id
router.delete('/del/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to update data (example)
router.put('/update/:id', async (req, res) => {
    const orderId = req.params.id;
    const { table_number, items_desc } = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { table_number, items_desc }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to retrieve all orders
router.get('/getall', async (req, res) => {
    try {
        const allOrders = await Order.find();
        res.json(allOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
