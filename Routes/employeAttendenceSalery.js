import { Router } from "express";
import dbPromise from "../db.js";

const router = Router();

// Endpoint to get all data
router.get('/getall', async (req, res) => {
    try {
        const db = await dbPromise;
        const result = await db.all(`
            SELECT 
                employeAuthData.employeId,
                employeAuthData.name,
                employePersonalData.attendence,
                employePersonalData.salery
            FROM 
                employeAuthData
            JOIN 
                employePersonalData
            ON 
                employeAuthData.employeId = employePersonalData.employeId
        `);

        // Parse JSON data for attendance and salary
        const parsedResult = result.map(row => ({
            ...row,
            attendence: JSON.parse(row.attendence),
            salery: JSON.parse(row.salery)
        }));

        res.json(parsedResult);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to update attendance and salary data
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { attendence, salery } = req.body;

    if (!attendence || !salery) {
        return res.status(400).json({ error: 'Attendance and Salary are required' });
    }

    try {
        const db = await dbPromise;
        const result = await db.run(`
            UPDATE employePersonalData 
            SET attendence = ?, salery = ? 
            WHERE employeId = ?
        `, [JSON.stringify(attendence), JSON.stringify(salery), id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;