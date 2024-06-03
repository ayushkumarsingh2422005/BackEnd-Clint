import { Router } from "express";
import dbPromise from "../db.js";

const router = Router();

const createTable = async () => {
    const db = await dbPromise;
    await db.run(`
    CREATE TABLE IF NOT EXISTS Purchase (
        salesId TEXT PRIMARY KEY,
        z INTEGER DEFAULT 0,
        s INTEGER DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `);
};
createTable();

const generateUniqueSalesId = async () => {
    const db = await dbPromise;
    let isUnique = false;
    let salesId;

    while (!isUnique) {
        salesId = Math.floor(100000 + Math.random() * 900000).toString();
        const existingSale = await db.get('SELECT 1 FROM Purchase WHERE salesId = ?', [salesId]);
        if (!existingSale) {
            isUnique = true;
        }
    }

    return salesId;
};

// Get all sales
router.get('/getall', async (req, res) => {
    const db = await dbPromise;
    const sales = await db.all('SELECT * FROM Purchase ORDER BY date DESC');
    res.json(sales);
});

// Delete sale by ID
router.delete('/del/:id', async (req, res) => {
    const { id } = req.params;
    const db = await dbPromise;
    console.log(id)
    const result = await db.run('DELETE FROM Purchase WHERE salesId = ?', [id]);
    if (result.changes > 0) {
        res.json({ message: 'Purchase deleted successfully' });
    } else {
        res.status(404).json({ message: 'Purchase not found' });
    }
});

// Update sale by ID
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { z, s } = req.body;
    const db = await dbPromise;
    const result = await db.run('UPDATE Purchase SET z = ?, s = ? WHERE salesId = ?', [z, s, id]);
    if (result.changes > 0) {
        res.json({ message: 'Purchase updated successfully' });
    } else {
        res.status(404).json({ message: 'Purchase not found' });
    }
});

// Add new sale with unique 6-digit code
router.post('/add', async (req, res) => {
    const { z, s, r } = req.body;
    const db = await dbPromise;
    const salesId = await generateUniqueSalesId();
    await db.run('INSERT INTO Purchase (salesId, z, s) VALUES (?, ?, ?)', [salesId, z, s]);
    res.json({ message: 'Purchase added successfully', salesId });
});

export default router;
