import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/billing
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('student_payment')
        .select('*')
        .order('DueDate', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/billing
router.post('/', async (req, res) => {
    const { supabase } = req;
    const paymentData = {
        ...req.body,
        CreatedBy: req.userProfile.UserID,
        ProcessedBy: req.userProfile.empId
    };
    
    const { data, error } = await supabase
        .from('student_payment')
        .insert(paymentData)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'CREATE', 'student_payment', data.StudentPaymentID, null, data);
    res.status(201).json(data);
});

// PUT /api/billing/:id
router.put('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { StudentPaymentID, ...updateData } = req.body; // Exclude ID from body
    
    const { data: oldData, error: fetchError } = await supabase.from('student_payment').select('*').eq('StudentPaymentID', id).single();
    if(fetchError) return res.status(404).json({ message: 'Payment record not found.' });
    
    const { data, error } = await supabase
        .from('student_payment')
        .update(updateData)
        .eq('StudentPaymentID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'student_payment', id, oldData, data);
    
    // --- Send Notification if payment is Overdue ---
    if (updateData.Status === 'Overdue' && oldData.Status !== 'Overdue') {
        try {
            // 1. Get Student name
            const { data: student } = await supabase.from('student').select('FirstName, LastName').eq('StudentID', data.StudentID).single();
            const studentName = student ? `${student.FirstName} ${student.LastName}` : `ID ${data.StudentID}`;
            
            // 2. Get all Admins
            const { data: admins } = await supabase
                .from('user_role')
                .select('UserID')
                .eq('RoleID', 1); // Assuming 'Admin' role has RoleID = 1

            if (admins && admins.length > 0) {
                const notifications = admins.map(admin => ({
                    ReceiverID: admin.UserID,
                    Type: 'Alert',
                    Message: `El pago para el estudiante ${studentName} ha vencido.`,
                    RelatedModule: 'billing',
                    RelatedID: data.StudentPaymentID
                }));
                await supabase.from('notification').insert(notifications);
            }
        } catch (notificationError) {
             console.error('Failed to send overdue payment notification:', notificationError.message);
        }
    }
    // --- End Notification ---
    
    res.json(data);
});

// DELETE /api/billing/:id
router.delete('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('student_payment').select('*').eq('StudentPaymentID', id).single();
    const { error } = await supabase
        .from('student_payment')
        .delete()
        .eq('StudentPaymentID', id);

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'student_payment', id, oldData, null);
    res.status(204).send();
});

export default router;