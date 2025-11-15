import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/payroll
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('teacher_payment')
        .select('*')
        .order('PaymentDate', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/payroll
router.post('/', async (req, res) => {
    const { supabase } = req;
    const paymentData = {
        ...req.body,
        CreatedBy: req.userProfile.UserID,
        ProcessedBy: req.userProfile.UserID
    };
    
    const { data, error } = await supabase
        .from('teacher_payment')
        .insert(paymentData)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'CREATE', 'teacher_payment', data.TeacherPaymentID, null, data);
    res.status(201).json(data);
});

// PUT /api/payroll/:id
router.put('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { TeacherPaymentID, ...updateData } = req.body;
    
    const { data: oldData } = await supabase.from('teacher_payment').select('*').eq('TeacherPaymentID', id).single();
    
    const { data, error } = await supabase
        .from('teacher_payment')
        .update(updateData)
        .eq('TeacherPaymentID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'teacher_payment', id, oldData, data);
    res.json(data);
});

// DELETE /api/payroll/:id
router.delete('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('teacher_payment').select('*').eq('TeacherPaymentID', id).single();
    const { error } = await supabase
        .from('teacher_payment')
        .delete()
        .eq('TeacherPaymentID', id);

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'teacher_payment', id, oldData, null);
    res.status(204).send();
});

export default router;