import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/employee-attendance?date=YYYY-MM-DD
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const { data, error } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('Date', date);
    
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/employee-attendance/checkin
router.post('/checkin', adminOnly, async (req, res) => {
    const { supabase } = req;
    const { employeeId, date } = req.body;
    const adminUserId = req.userProfile.UserID;

    if (!employeeId || !date) {
        return res.status(400).json({ message: 'employeeId and date are required.' });
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];

    const { data, error } = await supabase
        .from('employee_attendance')
        .upsert({
            EmpID: employeeId,
            Date: date,
            CheckInTime: checkInTime,
            CheckOutTime: null,
            Status: 'Present',
            UpdatedBy: adminUserId,
        }, { onConflict: 'EmpID, Date' })
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
});

// PUT /api/employee-attendance/checkout/:id
router.put('/checkout/:id', adminOnly, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params; // This is AttendanceID
    const adminUserId = req.userProfile.UserID;
    
    const now = new Date();
    const checkOutTime = now.toTimeString().split(' ')[0];

    const { data, error } = await supabase
        .from('employee_attendance')
        .update({
            CheckOutTime: checkOutTime,
            UpdatedBy: adminUserId,
        })
        .eq('AttendanceID', id)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
});

// POST /api/employee-attendance/status
router.post('/status', adminOnly, async (req, res) => {
    const { supabase } = req;
    const { employeeId, date, status } = req.body;
    const adminUserId = req.userProfile.UserID;

    if (!employeeId || !date || !status) {
        return res.status(400).json({ message: 'employeeId, date, and status are required.' });
    }
    
    if (!['Absent', 'Excused'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Allowed values are "Absent", "Excused".' });
    }

    const { data, error } = await supabase
        .from('employee_attendance')
        .upsert({
            EmpID: employeeId,
            Date: date,
            Status: status,
            CheckInTime: null,
            CheckOutTime: null,
            UpdatedBy: adminUserId,
        }, { onConflict: 'EmpID, Date' })
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
});

export default router;
