import express from 'express';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

import pageRoutes from './routes/pages.js';
import authApiRoutes from './routes/api/auth.js';
import usersApiRoutes from './routes/api/users.js';
import studentsApiRoutes from './routes/api/students.js';
import employeesApiRoutes from './routes/api/employees.js';
import gradesApiRoutes from './routes/api/grades.js';
import guardiansApiRoutes from './routes/api/guardians.js';
import adminApiRoutes from './routes/api/admin.js';
import observationsApiRoutes from './routes/api/observations.js';
import tasksApiRoutes from './routes/api/tasks.js';
import attendanceApiRoutes from './routes/api/attendance.js';
import employeeAttendanceApiRoutes from './routes/api/employee-attendance.js';
import reportsApiRoutes from './routes/api/reports.js';
import billingApiRoutes from './routes/api/billing.js';
import payrollApiRoutes from './routes/api/payroll.js';
import invoicesApiRoutes from './routes/api/invoices.js';
import activitiesApiRoutes from './routes/api/activities.js';
import communicationsApiRoutes from './routes/api/communications.js';
import auditApiRoutes from './routes/api/audit.js';
import notificationsApiRoutes from './routes/api/notifications.js';

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SECURITY IMPROVEMENT: Load credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("FATAL ERROR: SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- MIDDLEWARE ---
app.use(express.json({ limit: '10mb' })); // Increase limit for Base64 file uploads
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Pass supabase instance to routes that need it
app.use((req, res, next) => {
    req.supabase = supabase;
    req.supabaseAdmin = supabaseAdmin;
    next();
});


// --- ROUTES ---
// Page serving routes
app.use('/', pageRoutes);

// API routes
app.use('/api/auth', authApiRoutes);
app.use('/api/user', usersApiRoutes);
app.use('/api/students', studentsApiRoutes);
app.use('/api/employees', employeesApiRoutes);
app.use('/api/grades', gradesApiRoutes);
app.use('/api/guardians', guardiansApiRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/observations', observationsApiRoutes);
app.use('/api/tasks', tasksApiRoutes);
app.use('/api/attendance', attendanceApiRoutes);
app.use('/api/employee-attendance', employeeAttendanceApiRoutes);
app.use('/api/reports', reportsApiRoutes);
app.use('/api/billing', billingApiRoutes);
app.use('/api/payroll', payrollApiRoutes);
app.use('/api/invoices', invoicesApiRoutes);
app.use('/api/activities', activitiesApiRoutes);
app.use('/api/communications', communicationsApiRoutes);
app.use('/api/audit', auditApiRoutes);
app.use('/api/notifications', notificationsApiRoutes);


// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});