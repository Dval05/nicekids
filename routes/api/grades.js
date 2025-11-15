import express from 'express';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// GET /api/grades - Accessible to all authenticated users
router.get('/', authMiddleware, async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase.from('grade').select('*').order('GradeName');
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST, PUT, DELETE routes are for admins only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase.from('grade').insert(req.body).select().single();
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'CREATE', 'grade', data.GradeID, null, data);
    res.status(201).json(data);
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('grade').select('*').eq('GradeID', id).single();
    const { data, error } = await supabase.from('grade').update(req.body).eq('GradeID', id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'grade', id, oldData, data);
    res.json(data);
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('grade').select('*').eq('GradeID', id).single();
    // Logical delete
    const { error } = await supabase.from('grade').update({ IsActive: 0 }).eq('GradeID', id);
    if (error) return res.status(400).json({ message: error.message });
    const newData = { ...oldData, IsActive: 0 };
    logAction(req, 'UPDATE', 'grade', id, oldData, newData);
    res.status(204).send();
});

export default router;