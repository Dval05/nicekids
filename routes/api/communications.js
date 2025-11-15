import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware);

// GET /api/communications/users
// Gets a list of all employees to chat with, excluding the current user
router.get('/users', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;

    // Fetch all active employees that have a linked user account
    const { data, error } = await supabase
        .from('employee')
        .select(`
            UserID,
            FirstName,
            LastName,
            Position,
            user:UserID (Email)
        `)
        .not('UserID', 'is', null)
        .eq('IsActive', 1);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    // Filter out the current user from the list
    const users = data.filter(u => u.UserID !== currentUserId);

    res.json({ users, currentUserId });
});

// GET /api/communications/history/:otherUserId
// Gets the conversation history between the logged-in user and another user
router.get('/history/:otherUserId', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;
    const otherUserId = parseInt(req.params.otherUserId);

    if (isNaN(otherUserId)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('Type', 'Message')
        .or(`and(SenderID.eq.${currentUserId},ReceiverID.eq.${otherUserId}),and(SenderID.eq.${otherUserId},ReceiverID.eq.${currentUserId})`)
        .order('CreatedAt', { ascending: true });

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});

// POST /api/communications/send
// Sends a message from the logged-in user to another user
router.post('/send', async (req, res) => {
    const { supabase } = req;
    const { receiverId, message } = req.body;
    const senderId = req.userProfile.UserID;

    if (!receiverId || !message) {
        return res.status(400).json({ message: 'Receiver and message are required.' });
    }

    const { data, error } = await supabase
        .from('notification')
        .insert({
            SenderID: senderId,
            ReceiverID: parseInt(receiverId),
            Message: message,
            Type: 'Message',
            IsRead: 0
        })
        .select()
        .single();
    
    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.status(201).json(data);
});

// PUT /api/communications/read/:otherUserId
// Marks all messages from otherUserId to the current user as read
router.put('/read/:otherUserId', async (req, res) => {
    const { supabase } = req;
    const currentUserId = req.userProfile.UserID;
    const otherUserId = parseInt(req.params.otherUserId);

    if (isNaN(otherUserId)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const { error } = await supabase
        .from('notification')
        .update({ IsRead: 1, ReadAt: new Date().toISOString() })
        .eq('ReceiverID', currentUserId)
        .eq('SenderID', otherUserId)
        .eq('IsRead', 0)
        .eq('Type', 'Message');

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.status(200).json({ message: 'Messages marked as read.' });
});

export default router;