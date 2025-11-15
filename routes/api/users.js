import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
const router = express.Router();

// GET /api/user/profile
router.get('/profile', authMiddleware, (req, res) => {
    res.json({
        firstName: req.userProfile.FirstName,
        lastName: req.userProfile.LastName,
        role: req.userProfile.role,
    });
});

// GET /api/user/permissions
router.get('/permissions', authMiddleware, async (req, res) => {
    const { supabase } = req;
    const roleId = req.userProfile.user_role[0]?.RoleID;
    if (!roleId) {
        return res.json([]);
    }

    const { data, error } = await supabase
        .from('role_permission')
        .select('permission:PermissionID (*)')
        .eq('RoleID', roleId)
        .order('PermissionName', { foreignTable: 'permission', ascending: true });

    if (error) return res.status(500).json({ message: error.message });
    
    // We only want permissions that have a link to show in the sidebar
    const navLinks = data.map(item => item.permission).filter(p => p.Link);
    res.json(navLinks);
});

export default router;
