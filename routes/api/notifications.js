import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware);

// GET /api/notifications/count
// Gets the total number of all unread notifications (messages and alerts)
router.get('/count', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;

    const { count, error } = await supabase
        .from('notification')
        .select('*', { count: 'exact', head: true })
        .eq('ReceiverID', currentUserId)
        .eq('IsRead', 0);
        
    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json({ count });
});

// GET /api/notifications
// Gets the most recent notifications for the user
router.get('/', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;

    const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('ReceiverID', currentUserId)
        .order('CreatedAt', { ascending: false })
        .limit(20);

    if (error) {
        return res.status(500).json({ message: error.message });
    }
    res.json(data);
});

// PUT /api/notifications/read/all
// Marks all notifications for the current user as read
router.put('/read/all', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;

    const { error } = await supabase
        .from('notification')
        .update({ IsRead: 1, ReadAt: new Date().toISOString() })
        .eq('ReceiverID', currentUserId)
        .eq('IsRead', 0);
    
    if (error) {
        return res.status(500).json({ message: error.message });
    }
    res.status(200).json({ message: 'All notifications marked as read' });
});

// PUT /api/notifications/read/:id
// Marks a single notification as read
router.put('/read/:id', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID.' });
    }

    const { error } = await supabase
        .from('notification')
        .update({ IsRead: 1, ReadAt: new Date().toISOString() })
        .eq('NotificationID', notificationId)
        .eq('ReceiverID', currentUserId); // Ensure user can only mark their own notifications

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.status(200).json({ message: 'Notification marked as read.' });
});


export default router;