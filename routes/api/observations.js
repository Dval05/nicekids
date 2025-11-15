import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/observations
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('student_observation')
        .select(`
            *,
            student:StudentID (FirstName, LastName),
            employee:EmpID (FirstName, LastName)
        `)
        .order('ObservationDate', { ascending: false })
        .order('CreatedAt', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/observations
router.post('/', async (req, res) => {
    const { supabase } = req;
    const newObservation = {
        ...req.body,
        EmpID: req.userProfile.empId, // Set the employee ID from the logged-in user
    };

    if (!newObservation.EmpID) {
        return res.status(400).json({ message: 'User is not linked to an employee profile.' });
    }

    const { data, error } = await supabase
        .from('student_observation')
        .insert(newObservation)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'CREATE', 'student_observation', data.ObservationID, null, data);
    res.status(201).json(data);
});

// PUT /api/observations/:id
router.put('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('student_observation').select('*').eq('ObservationID', id).single();
    const { data, error } = await supabase
        .from('student_observation')
        .update(req.body)
        .eq('ObservationID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'student_observation', id, oldData, data);
    res.json(data);
});

// DELETE /api/observations/:id
router.delete('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('student_observation').select('*').eq('ObservationID', id).single();
    const { error } = await supabase
        .from('student_observation')
        .delete()
        .eq('ObservationID', id);

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'student_observation', id, oldData, null);
    res.status(204).send();
});

export default router;