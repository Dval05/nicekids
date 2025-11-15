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
    
    // Debug logging
    console.log('User Profile:', JSON.stringify(req.userProfile, null, 2));
    console.log('User Role Array:', req.userProfile.user_role);
    
    // Try to get RoleID from the user_role array
    // The user_role table has a RoleID foreign key column
    let roleId = req.userProfile.user_role?.[0]?.RoleID;
    
    // Fallback: if not found, try to get from nested role object
    if (!roleId && req.userProfile.user_role?.[0]?.role?.RoleID) {
        roleId = req.userProfile.user_role[0].role.RoleID;
    }
    
    console.log('Role ID:', roleId);
    
    if (!roleId) {
        console.warn('No role ID found for user, returning empty permissions');
        return res.json([]);
    }

    const { data, error } = await supabase
        .from('role_permission')
        .select(`
            *,
            permission (*)
        `)
        .eq('RoleID', roleId);

    if (error) {
        console.error('Error fetching permissions:', error);
        return res.status(500).json({ message: error.message });
    }
    
    if (!data || data.length === 0) {
        console.warn('No permissions found for role ID:', roleId);
        return res.json([]);
    }
    
    console.log('Raw permission data:', JSON.stringify(data, null, 2));
    
    // We only want permissions that have a link to show in the sidebar
    const navLinks = data
        .map(item => item.permission)
        .filter(p => p && p.Link)
        .sort((a, b) => (a.PermissionName || '').localeCompare(b.PermissionName || ''));
    console.log('Nav links:', navLinks);
    res.json(navLinks);
});

export default router;
