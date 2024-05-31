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

// Endpoint to get attendennce data
router.get('/get-attendence/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await dbPromise;
        const result = await db.all(`
            SELECT attendence FROM employePersonalData
            WHERE employeId = ?
        `, [id]);

        // Parse JSON data for attendance and salary

        res.json(JSON.parse(result[0].attendence));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Endpoint to update attendance and salary data
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { salery } = req.body;
    console.log(salery)

    if (!salery) {
        return res.status(400).json({ error: 'Salary is required' });
    }

    try {
        const db = await dbPromise;
        const result = await db.run(`
            UPDATE employePersonalData 
            SET salery = ?
            WHERE employeId = ?
        `, [JSON.stringify(salery), id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to update attendence 
router.put('/attendence/:id', async (req, res) => {
    const { id } = req.params;
    const date = new Date();
    const key = (date.getMonth() + 1) + "-" + date.getFullYear();
    const value = date.getDate();

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        const db = await dbPromise;
        const employee = await db.get(`
            SELECT attendence FROM employePersonalData 
            WHERE employeId = ?
        `, [id]);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const updatedAttendance = JSON.parse(employee.attendence);
        if (updatedAttendance.hasOwnProperty(key)) {
            if (!updatedAttendance[key].includes(value)) {
                updatedAttendance[key].push(value)
            }
        } else {
            updatedAttendance[key] = [value];
        }
        // res.json(updatedAttendance)
        // Assuming you want to update the attendance in some way
        // const updatedAttendance = /* your logic to update attendance */;

        const result = await db.run(`
            UPDATE employePersonalData 
            SET attendence = ?
            WHERE employeId = ?
        `, [JSON.stringify(updatedAttendance), id]);

        if (result.changes === 0) {
            return res.status(400).json({ error: 'Failed to update attendance' });
        }

        res.json({ message: 'Attendance updated successfully', key });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Endpoint to get data for the current month
router.get('/getall/now', async (req, res) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() is zero-based
    const currentYear = now.getFullYear();
    console.log(currentMonth, currentYear)
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
        const filteredResult = result.map(row => ({
            ...row,
            attendence: filterAttendanceByMonth(JSON.parse(row.attendence), currentMonth, currentYear),
            salery: JSON.parse(row.salery)
        }));

        res.json(filteredResult);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



export default router;


// Function to filter attendance by month and year
function filterAttendanceByMonth(attendence, currentMonth, currentYear) {
    let filteredAttendance;
    for (const [key, value] of Object.entries(attendence)) {
        const [month, year] = key.split('-').map(Number);
        // console.log(month, year)
        if (month == currentMonth && year == currentYear) {
            filteredAttendance = value;
        }
    }
    // console.log(filteredAttendance)
    return filteredAttendance;
}
