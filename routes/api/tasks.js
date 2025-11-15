import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/tasks
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('employee_task')
        .select(`
            *,
            employee:EmpID (FirstName, LastName)
        `)
        .order('DueDate', { ascending: true, nullsFirst: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/tasks
router.post('/', async (req, res) => {
    const { supabase } = req;
    const newTask = {
        ...req.body,
        CreatedBy: req.userProfile.UserID, // Set the creator from the logged-in user
    };

    const { data, error } = await supabase
        .from('employee_task')
        .insert(newTask)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'CREATE', 'employee_task', data.TaskID, null, data);
    
    // --- Send Notification ---
    try {
        const { data: employeeUser, error: userError } = await supabase
            .from('employee')
            .select('UserID')
            .eq('EmpID', data.EmpID)
            .single();

        if (userError || !employeeUser?.UserID) {
            console.warn(`Could not send task notification: UserID not found for EmpID ${data.EmpID}`);
        } else {
            await supabase.from('notification').insert({
                ReceiverID: employeeUser.UserID,
                Type: 'Alert',
                Message: `Se te ha asignado una nueva tarea: "${data.TaskName}"`,
                RelatedModule: 'tasks',
                RelatedID: data.TaskID
            });
        }
    } catch (notificationError) {
        console.error('Failed to send task assignment notification:', notificationError.message);
    }
    // --- End Notification ---

    res.status(201).json(data);
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('employee_task').select('*').eq('TaskID', id).single();
    const { data, error } = await supabase
        .from('employee_task')
        .update(req.body)
        .eq('TaskID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'employee_task', id, oldData, data);
    res.json(data);
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('employee_task').select('*').eq('TaskID', id).single();
    const { error } = await supabase
        .from('employee_task')
        .delete()
        .eq('TaskID', id);

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'employee_task', id, oldData, null);
    res.status(204).send();
});

export default router;