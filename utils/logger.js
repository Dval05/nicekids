/**
 * Logs a user action to the audit_log table.
 * This is a fire-and-forget operation; it doesn't wait for the insert to complete
 * and does not block the main request flow. Errors are logged to the console.
 * @param {object} req - The Express request object.
 * @param {string} action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE').
 * @param {string} tableName - The name of the table affected.
 * @param {number} recordId - The ID of the record affected.
 * @param {object} [oldData] - The data before the change (for UPDATE/DELETE).
 * @param {object} [newData] - The data after the change (for CREATE/UPDATE).
 */
export const logAction = (req, action, tableName, recordId, oldData = null, newData = null) => {
    const { supabase, userProfile } = req;
    
    if (!supabase || !userProfile) {
        console.error('Logger: Supabase client or user profile not found on request object.');
        return;
    }

    const logEntry = {
        UserID: userProfile.UserID,
        Action: action,
        TableName: tableName,
        RecordID: recordId,
        OldData: oldData,
        NewData: newData,
        IPAddress: req.ip,
        UserAgent: req.get('User-Agent'),
    };

    supabase.from('audit_log').insert(logEntry)
        .then(({ error }) => {
            if (error) {
                console.error('Failed to write to audit log:', error.message);
            }
        });
};
