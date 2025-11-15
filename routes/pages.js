import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
// Navigate up two levels from routes/pages.js to the project root
const __dirname = path.dirname(path.dirname(__filename));

// --- PUBLIC ROUTES ---
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

router.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

router.get('/update-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update-password.html'));
});

// --- PROTECTED PAGES ---
router.get('/force-update-password', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'force-update-password.html'));
});

router.get('/invoice', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invoice.html'));
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

router.get('/students', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

router.get('/attendance', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'attendance.html'));
});

router.get('/employees', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employees.html'));
});

router.get('/employee-attendance', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employee-attendance.html'));
});

router.get('/grades', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'grades.html'));
});

router.get('/guardians', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'guardians.html'));
});

router.get('/observations', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'observations.html'));
});

router.get('/tasks', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

router.get('/reports', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

router.get('/billing', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'billing.html'));
});

router.get('/payroll', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payroll.html'));
});

router.get('/activities', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'activities.html'));
});

router.get('/calendar', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

router.get('/communications', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'communications.html'));
});

// --- ADMIN PAGES ---
router.get('/admin/users', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-users.html'));
});

router.get('/admin/roles', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-roles.html'));
});

router.get('/admin/audit', authMiddleware, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'audit.html'));
});

export default router;