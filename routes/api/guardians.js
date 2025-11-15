import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
import { createSystemUser } from '../../utils/userHelper.js';
const router = express.Router();

// GET /api/guardians - Accessible to all authenticated users
router.get('/', authMiddleware, async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('guardian')
        .select('*, user:UserID (UserName)')
        .order('LastName');
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST, PUT, DELETE routes are for admins only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    const { supabase } = req;
    const { FirstName, LastName, Email, DocumentNumber, ...rest } = req.body;

    if (!Email || !DocumentNumber) {
        return res.status(400).json({ message: 'El correo electrónico y la cédula son obligatorios para crear el usuario.' });
    }

    try {
        const newUser = await createSystemUser(req, {
            email: Email,
            password: DocumentNumber,
            firstName: FirstName,
            lastName: LastName,
        });

        const guardianData = {
            ...rest,
            FirstName,
            LastName,
            Email,
            DocumentNumber,
            UserID: newUser.UserID,
        };

        const { data, error } = await supabase.from('guardian').insert(guardianData).select().single();
        if (error) {
             console.error("User was created, but guardian profile creation failed:", error.message);
             throw new Error(`User created, but guardian profile failed: ${error.message}`);
        }

        logAction(req, 'CREATE', 'guardian', data.GuardianID, null, data);
        res.status(201).json(data);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});


router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('guardian').select('*').eq('GuardianID', id).single();
    const { data, error } = await supabase.from('guardian').update(req.body).eq('GuardianID', id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'guardian', id, oldData, data);
    res.json(data);
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('guardian').select('*').eq('GuardianID', id).single();
    // This is a hard delete as requested
    const { error } = await supabase.from('guardian').delete().eq('GuardianID', id);
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'guardian', id, oldData, null);
    res.status(204).send();
});

export default router;