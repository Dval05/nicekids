import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware);
router.use(adminOnly);

// --- USERS ---
router.get('/users', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('user')
        .select('*, user_role(*, role(*))')
        .order('LastName');
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

router.put('/users/:id/roles', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { roleIds } = req.body;

    const { data: oldRolesData } = await supabase.from('user_role').select('RoleID').eq('UserID', id);
    const oldRoleIds = oldRolesData ? oldRolesData.map(r => r.RoleID) : [];

    // Delete existing roles for the user
    const { error: deleteError } = await supabase.from('user_role').delete().eq('UserID', id);
    if (deleteError) return res.status(500).json({ message: deleteError.message });

    // Insert new roles
    if (roleIds && roleIds.length > 0) {
        const newRoles = roleIds.map(roleId => ({ UserID: id, RoleID: roleId, AssignedBy: req.userProfile.UserID }));
        const { error: insertError } = await supabase.from('user_role').insert(newRoles);
        if (insertError) return res.status(500).json({ message: insertError.message });
    }
    
    logAction(req, 'UPDATE', 'user_role', id, { roleIds: oldRoleIds }, { roleIds });
    res.status(200).json({ message: 'Roles updated successfully' });
});


// --- ROLES ---
router.get('/roles', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('role')
        .select('*, role_permission(*, permission(*))')
        .order('RoleName');
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

router.post('/roles', async (req, res) => {
    const { supabase } = req;
    const { RoleName, Description, permissionIds } = req.body;

    const { data: roleData, error: roleError } = await supabase
        .from('role').insert({ RoleName, Description }).select().single();
    if (roleError) return res.status(400).json({ message: roleError.message });

    if (permissionIds && permissionIds.length > 0) {
        const assignments = permissionIds.map(pid => ({ RoleID: roleData.RoleID, PermissionID: pid }));
        const { error: permError } = await supabase.from('role_permission').insert(assignments);
        if (permError) {
            await supabase.from('role').delete().eq('RoleID', roleData.RoleID);
            return res.status(500).json({ message: `Failed to assign permissions: ${permError.message}` });
        }
    }

    const finalData = { ...roleData, permissionIds };
    logAction(req, 'CREATE', 'role', roleData.RoleID, null, finalData);
    res.status(201).json(roleData);
});

router.put('/roles/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { RoleName, Description, permissionIds } = req.body;

    const { data: oldRoleData } = await supabase.from('role').select('*, role_permission(PermissionID)').eq('RoleID', id).single();
    const oldPermissionIds = oldRoleData.role_permission.map(p => p.PermissionID);

    const { data: roleData, error: roleError } = await supabase
        .from('role').update({ RoleName, Description }).eq('RoleID', id).select().single();
    if (roleError) return res.status(400).json({ message: roleError.message });

    const { error: deleteError } = await supabase.from('role_permission').delete().eq('RoleID', id);
    if (deleteError) return res.status(500).json({ message: `Failed to clear old permissions: ${deleteError.message}` });
    
    if (permissionIds && permissionIds.length > 0) {
        const assignments = permissionIds.map(pid => ({ RoleID: id, PermissionID: pid }));
        const { error: insertError } = await supabase.from('role_permission').insert(assignments);
        if (insertError) return res.status(500).json({ message: `Failed to assign new permissions: ${insertError.message}` });
    }

    logAction(req, 'UPDATE', 'role', id, { ...oldRoleData, permissionIds: oldPermissionIds }, { ...roleData, permissionIds });
    res.json(roleData);
});

router.delete('/roles/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('role').select('*, role_permission(*)').eq('RoleID', id).single();
    const { error } = await supabase.from('role').delete().eq('RoleID', id);
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'role', id, oldData, null);
    res.status(204).send();
});


// --- PERMISSIONS ---
router.get('/permissions', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('permission').select('*').order('Module').order('PermissionName');
    if (error) return res.status(500).json({ message: error.message });
    
    const grouped = data.reduce((acc, permission) => {
        const { Module } = permission;
        if (!acc[Module]) acc[Module] = [];
        acc[Module].push(permission);
        return acc;
    }, {});
    res.json(grouped);
});

export default router;