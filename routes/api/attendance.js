import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/attendance?date=YYYY-MM-DD
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('Date', date);
    
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/attendance/checkin
router.post('/checkin', async (req, res) => {
    const { supabase } = req;
    const { studentId, date } = req.body;
    const employeeId = req.userProfile.empId;

    if (!studentId || !date) {
        return res.status(400).json({ message: 'studentId and date are required.' });
    }
    
    if (!employeeId) {
        return res.status(403).json({ message: 'Authenticated user is not linked to an employee profile.' });
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];

    const { data, error } = await supabase
        .from('attendance')
        .upsert({
            StudentID: studentId,
            Date: date,
            CheckInTime: checkInTime,
            CheckOutTime: null, // Ensure checkout is cleared on a new checkin
            Status: 'Present',
            CheckedInBy: employeeId,
        }, { onConflict: 'StudentID, Date' })
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
});

// PUT /api/attendance/checkout/:id
router.put('/checkout/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const employeeId = req.userProfile.empId;

    if (!employeeId) {
        return res.status(403).json({ message: 'Authenticated user is not linked to an employee profile.' });
    }
    
    const now = new Date();
    const checkOutTime = now.toTimeString().split(' ')[0];

    const { data, error } = await supabase
        .from('attendance')
        .update({
            CheckOutTime: checkOutTime,
            CheckedOutBy: employeeId,
        })
        .eq('AttendanceID', id)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
});

// POST /api/attendance/status
router.post('/status', async (req, res) => {
    const { supabase } = req;
    const { studentId, date, status } = req.body;
    const employeeId = req.userProfile.empId;

    if (!studentId || !date || !status) {
        return res.status(400).json({ message: 'studentId, date, and status are required.' });
    }
    
    // Validate status
    if (!['Absent', 'Excused'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Allowed values are "Absent", "Excused".' });
    }
    
    if (!employeeId) {
        return res.status(403).json({ message: 'Authenticated user is not linked to an employee profile.' });
    }

    const { data, error } = await supabase
        .from('attendance')
        .upsert({
            StudentID: studentId,
            Date: date,
            Status: status,
            CheckInTime: null,
            CheckOutTime: null,
            CheckedInBy: employeeId, // Attribute the action to the current user
            CheckedOutBy: null,
        }, { onConflict: 'StudentID, Date' })
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
});


export default router;