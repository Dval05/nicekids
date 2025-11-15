import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
import { createSystemUser } from '../../utils/userHelper.js';
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// GET /api/employees
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { data, error } = await supabase
        .from('employee')
        .select('*, user:UserID (UserName)')
        .order('LastName', { ascending: true });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/employees
router.post('/', async (req, res) => {
    const { supabase } = req;
    const { FirstName, LastName, Email, DocumentNumber, ...rest } = req.body;

    if (!Email || !DocumentNumber) {
        return res.status(400).json({ message: 'El correo electrónico y la cédula son obligatorios para crear el usuario.' });
    }

    try {
        // 1. Create the system user first
        const newUser = await createSystemUser(req, {
            email: Email,
            password: DocumentNumber,
            firstName: FirstName,
            lastName: LastName,
        });

        // 2. Create the employee profile and link it to the user
        const employeeData = { 
            ...rest,
            FirstName, 
            LastName, 
            Email, 
            DocumentNumber, 
            UserID: newUser.UserID 
        };
        const { data: employee, error: employeeError } = await supabase
            .from('employee')
            .insert(employeeData)
            .select()
            .single();

        if (employeeError) {
            // If employee creation fails, we should ideally roll back the user creation
            // For simplicity here, we'll just log the error and return it.
            console.error("User was created, but employee profile creation failed:", employeeError.message);
            throw new Error(`User created, but employee profile failed: ${employeeError.message}`);
        }
        
        logAction(req, 'CREATE', 'employee', employee.EmpID, null, employee);
        res.status(201).json(employee);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});


// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;

    const { data: oldData } = await supabase.from('employee').select('*').eq('EmpID', id).single();

    const { data, error } = await supabase
        .from('employee')
        .update(req.body)
        .eq('EmpID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'employee', id, oldData, data);
    res.json(data);
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;

    const { data: oldData } = await supabase.from('employee').select('*').eq('EmpID', id).single();
    
    // Logical delete
    const { error } = await supabase
        .from('employee')
        .update({ IsActive: 0 })
        .eq('EmpID', id);

    if (error) return res.status(400).json({ message: error.message });

    const newData = { ...oldData, IsActive: 0 };
    logAction(req, 'UPDATE', 'employee', id, oldData, newData);
    res.status(204).send();
});

export default router;