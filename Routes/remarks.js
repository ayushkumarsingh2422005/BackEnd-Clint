import { Router } from "express";
import dbPromise from "../db.js";

const router = Router();

const createTable = async () => {
    const db = await dbPromise;
    await db.run(`
        CREATE TABLE IF NOT EXISTS Remarks (
            remarkId TEXT PRIMARY KEY,
            remark TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        ) 
    `);
};
createTable();

const generateUniqueRemarkId = async () => {
    const db = await dbPromise;
    let isUnique = false;
    let remarkId;

    while (!isUnique) {
        remarkId = Math.floor(100000 + Math.random() * 900000).toString();
        const existingRemark = await db.get('SELECT 1 FROM Remarks WHERE remarkId = ?', [remarkId]);
        if (!existingRemark) {
            isUnique = true;
        }
    }

    return remarkId;
};

// Get all remarks
router.get('/getall', async (req, res) => {
    const db = await dbPromise;
    const remarks = await db.all('SELECT * FROM Remarks ORDER BY date DESC');
    res.json(remarks);
});

// Delete remark by ID
router.delete('/del/:id', async (req, res) => {
    const { id } = req.params;
    const db = await dbPromise;
    const result = await db.run('DELETE FROM Remarks WHERE remarkId = ?', [id]);
    if (result.changes > 0) {
        res.json({ message: 'Remark deleted successfully' });
    } else {
        res.status(404).json({ message: 'Remark not found' });
    }
});

// Update remark by ID
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { remark } = req.body;
    const db = await dbPromise;
    const result = await db.run('UPDATE Remarks SET remark = ? WHERE remarkId = ?', [remark, id]);
    if (result.changes > 0) {
        res.json({ message: 'Remark updated successfully' });
    } else {
        res.status(404).json({ message: 'Remark not found' });
    }
});

// Add new remark with unique 6-digit code
router.post('/add', async (req, res) => {
    const { remark } = req.body;
    const db = await dbPromise;
    const remarkId = await generateUniqueRemarkId();
    await db.run('INSERT INTO Remarks (remarkId, remark) VALUES (?, ?)', [remarkId, remark]);
    res.json({ message: 'Remark added successfully', remarkId });
});

export default router;