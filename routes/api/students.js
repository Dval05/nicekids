import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/students
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('student')
        .select(`
            *, 
            grade:GradeID (GradeName),
            guardian:GuardianID (FirstName, LastName)
        `)
        .order('LastName', { ascending: true });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/students
router.post('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('student')
        .insert(req.body)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    
    logAction(req, 'CREATE', 'student', data.StudentID, null, data);
    res.status(201).json(data);
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;

    const { data: oldData, error: fetchError } = await supabase.from('student').select('*').eq('StudentID', id).single();
    if (fetchError) return res.status(404).json({ message: 'Student not found to update.' });

    const { data, error } = await supabase
        .from('student')
        .update(req.body)
        .eq('StudentID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    
    logAction(req, 'UPDATE', 'student', id, oldData, data);
    res.json(data);
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;

    const { data: oldData, error: fetchError } = await supabase.from('student').select('*').eq('StudentID', id).single();
    if (fetchError) return res.status(404).json({ message: 'Student not found to delete.' });

    // Logical delete
    const { error } = await supabase
        .from('student')
        .update({ IsActive: 0 })
        .eq('StudentID', id);

    if (error) return res.status(400).json({ message: error.message });
    
    const newData = { ...oldData, IsActive: 0 };
    logAction(req, 'UPDATE', 'student', id, oldData, newData); // Logged as UPDATE since it's a logical delete
    res.status(204).send();
});

export default router;