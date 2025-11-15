import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
const router = express.Router();
const COOKIE_NAME = 'nicekids-auth';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  const { supabase } = req;

  if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required.' });
  }

  let emailToLogin = identifier;

  if (!identifier.includes('@')) {
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('Email')
      .eq('UserName', identifier)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    emailToLogin = userData.Email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  if (data.session && data.user) {
    // Update AuthUserID in public.user table to ensure link between auth.users and public.user
    // This is crucial for the auth middleware to work correctly
    await supabase
      .from('user')
      .update({ AuthUserID: data.user.id })
      .eq('Email', emailToLogin);
    
    // last_sign_in_at is null on the very first sign-in.
    // The user object from signInWithPassword already contains this information.
    // No need for an extra admin API call.
    const firstLogin = data.user.last_sign_in_at === null;

    res.cookie(COOKIE_NAME, data.session.access_token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: data.session.expires_in * 1000 
    });
    return res.status(200).json({ message: 'Login successful', firstLogin });
  }
  
  return res.status(400).json({ message: 'An unknown error occurred.' });
});

// POST /api/auth/force-update-password
router.post('/force-update-password', authMiddleware, async (req, res) => {
    const { newPassword } = req.body;
    const { supabase } = req;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        return res.status(500).json({ message: 'Failed to update password: ' + error.message });
    }

    res.status(200).json({ message: 'Password updated successfully.' });
});


// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const { supabase } = req;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get('host')}/update-password`,
    });

    if (error) {
        console.error('Password reset request error:', error.message);
    }
    
    return res.status(200).json({ 
        message: 'Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.' 
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.status(200).json({ message: 'Logout successful' });
});

export default router;