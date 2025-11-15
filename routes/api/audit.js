import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware);
router.use(adminOnly);

// GET /api/audit
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { startDate, endDate, userId, action } = req.query;

    let query = supabase
        .from('audit_log')
        .select(`
            *,
            user:UserID (UserName, FirstName, LastName)
        `)
        .order('CreatedAt', { ascending: false });

    if (startDate) {
        query = query.gte('CreatedAt', new Date(startDate).toISOString());
    }
    if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('CreatedAt', endOfDay.toISOString());
    }
    if (userId) {
        query = query.eq('UserID', userId);
    }
    if (action) {
        query = query.eq('Action', action);
    }

    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    // Also fetch all users for the filter dropdown
    const { data: users, error: usersError } = await supabase
        .from('user')
        .select('UserID, UserName, FirstName, LastName')
        .order('UserName');
        
    if (usersError) {
         return res.status(500).json({ message: usersError.message });
    }

    res.json({ logs: data, users: users });
});


export default router;
