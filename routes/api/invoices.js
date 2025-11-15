import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/invoices/:paymentId
router.get('/:paymentId', async (req, res) => {
    const { supabase } = req;
    const { paymentId } = req.params;

    try {
        // Fetch the payment itself
        const { data: payment, error: paymentError } = await supabase
            .from('student_payment')
            .select('*')
            .eq('StudentPaymentID', paymentId)
            .single();
        if (paymentError) throw new Error('Payment record not found.');

        // Fetch the student related to the payment
        const { data: student, error: studentError } = await supabase
            .from('student')
            .select('*')
            .eq('StudentID', payment.StudentID)
            .single();
        if (studentError) throw new Error('Student record not found.');

        // Fetch the guardian related to the student
        const { data: guardian, error: guardianError } = await supabase
            .from('guardian')
            .select('*')
            .eq('GuardianID', student.GuardianID)
            .single();
        if (guardianError) throw new Error('Guardian record not found.');

        // Fetch company profile (assuming one profile with ID 1)
        // In a real app, this might be more dynamic
        const { data: company, error: companyError } = await supabase
            .from('company_profile')
            .select('*')
            .eq('ProfileID', 1)
            .single();
        // Don't throw error if company profile is missing, just return null

        res.json({
            payment,
            student,
            guardian,
            company: company || null
        });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

export default router;