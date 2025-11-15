import express from 'express';
import { authMiddleware, adminOrTeacher } from '../../middleware/auth.js';
import { logAction } from '../../utils/logger.js';
const router = express.Router();

// Helper to decode Base64 and get buffer
const getBufferFromBase64 = (dataUrl) => {
    const base64 = dataUrl.split(',')[1];
    if (!base64) throw new Error('Invalid Base64 string');
    return Buffer.from(base64, 'base64');
};


// GET /api/activities?year=YYYY&month=MM
router.get('/', authMiddleware, async (req, res) => {
    const { supabase } = req;
    const { year, month } = req.query;

    let query = supabase
        .from('activity')
        .select(`
            *, 
            activity_media(*),
            grade:GradeID(GradeName),
            employee:EmpID(FirstName, LastName)
        `);

    if (year && month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('ScheduledDate', startDate).lte('ScheduledDate', endDate);
    }
    
    const { data, error } = await query.order('ScheduledDate', { ascending: false }).order('StartTime', { ascending: true });
    
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// POST /api/activities
router.post('/', authMiddleware, adminOrTeacher, async (req, res) => {
    const { supabase } = req;
    const activityData = {
        ...req.body,
        CreatedBy: req.userProfile.UserID,
    };
    
    const { data, error } = await supabase
        .from('activity')
        .insert(activityData)
        .select()
        .single();
    
    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'CREATE', 'activity', data.ActivityID, null, data);
    res.status(201).json(data);
});

// PUT /api/activities/:id
router.put('/:id', authMiddleware, adminOrTeacher, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { ActivityID, ...updateData } = req.body;
    
    const { data: oldData } = await supabase.from('activity').select('*').eq('ActivityID', id).single();

    const { data, error } = await supabase
        .from('activity')
        .update(updateData)
        .eq('ActivityID', id)
        .select()
        .single();

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'UPDATE', 'activity', id, oldData, data);
    res.json(data);
});

// DELETE /api/activities/:id
router.delete('/:id', authMiddleware, adminOrTeacher, async (req, res) => {
    const { supabase } = req;
    const { id } = req.params;
    const { data: oldData } = await supabase.from('activity').select('*').eq('ActivityID', id).single();
    const { error } = await supabase
        .from('activity')
        .delete()
        .eq('ActivityID', id);

    if (error) return res.status(400).json({ message: error.message });
    logAction(req, 'DELETE', 'activity', id, oldData, null);
    res.status(204).send();
});


// --- MULTIMEDIA ROUTES ---

// POST /api/activities/:id/media
router.post('/:id/media', authMiddleware, adminOrTeacher, async (req, res) => {
    const { supabase } = req;
    const { id: activityId } = req.params;
    const { fileName, fileData, mediaType, caption } = req.body;

    if (!fileName || !fileData || !mediaType) {
        return res.status(400).json({ message: 'fileName, fileData, and mediaType are required.' });
    }

    try {
        const fileBuffer = getBufferFromBase64(fileData);
        const fileExtension = fileName.split('.').pop();
        const newFileName = `${Date.now()}.${fileExtension}`;
        const filePath = `public/${newFileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('activity-media')
            .upload(filePath, fileBuffer, {
                contentType: fileData.split(';')[0].split(':')[1],
            });
        
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('activity-media')
            .getPublicUrl(filePath);

        // Insert into activity_media table
        const { data: dbData, error: dbError } = await supabase
            .from('activity_media')
            .insert({
                ActivityID: activityId,
                MediaType: mediaType,
                FilePath: urlData.publicUrl,
                Caption: caption,
                UploadedBy: req.userProfile.UserID,
            })
            .select()
            .single();
        
        if (dbError) throw dbError;

        logAction(req, 'CREATE', 'activity_media', dbData.MediaID, null, dbData);
        res.status(201).json(dbData);

    } catch (error) {
        console.error('Media upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/activities/media/:mediaId
router.delete('/media/:mediaId', authMiddleware, adminOrTeacher, async (req, res) => {
    const { supabase } = req;
    const { mediaId } = req.params;

    try {
        // 1. Get file path from DB
        const { data: media, error: fetchError } = await supabase
            .from('activity_media')
            .select('*')
            .eq('MediaID', mediaId)
            .single();

        if (fetchError || !media) throw new Error('Media not found');
        
        // 2. Delete file from storage
        const fileName = media.FilePath.split('/').pop();
        const { error: storageError } = await supabase.storage
            .from('activity-media')
            .remove([`public/${fileName}`]);
        
        if (storageError) console.warn("Could not delete from storage, but proceeding to delete DB record:", storageError.message);

        // 3. Delete record from DB
        const { error: dbError } = await supabase
            .from('activity_media')
            .delete()
            .eq('MediaID', mediaId);

        if (dbError) throw dbError;
        
        logAction(req, 'DELETE', 'activity_media', mediaId, media, null);
        res.status(204).send();

    } catch (error) {
        console.error('Media delete error:', error);
        res.status(500).json({ message: error.message });
    }
});


export default router;