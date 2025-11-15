// Middleware to get user profile and roles
const getProfileAndRoles = async (supabase, user) => {
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*, user_role(*, role(*)), employee(EmpID)')
        .eq('AuthUserID', user.id)
        .single();

    if (userError || !userData) {
        return null;
    }
    
    // Assuming a user has one primary role for simplicity
    const role = userData.user_role[0]?.role?.RoleName || null;
    const empId = userData.employee[0]?.EmpID || null;
    
    // Remove the nested employee array for a cleaner profile object
    delete userData.employee;

    return { ...userData, role, empId };
};


// Middleware to protect routes
export const authMiddleware = async (req, res, next) => {
  const token = req.cookies['nicekids-auth'];
  if (!token) {
    return res.redirect('/');
  }

  const { data: { user } } = await req.supabase.auth.getUser(token);

  if (!user) {
    res.clearCookie('nicekids-auth');
    return res.redirect('/');
  }

  const userProfile = await getProfileAndRoles(req.supabase, user);
  if (!userProfile) {
    res.clearCookie('nicekids-auth');
    return res.status(403).send('User profile not found in database.');
  }

  req.user = user;
  req.userProfile = userProfile;
  next();
};

// Middleware to restrict access to Admins
export const adminOnly = (req, res, next) => {
    if (req.userProfile?.role !== 'Admin') {
        return res.status(403).send('Acceso denegado. Se requieren privilegios de administrador.');
    }
    next();
};

// Middleware to restrict access to Admins or Teachers
export const adminOrTeacher = (req, res, next) => {
    const role = req.userProfile?.role;
    if (role !== 'Admin' && role !== 'Teacher') {
        return res.status(403).send('Acceso denegado. Se requiere rol de Administrador o Docente.');
    }
    next();
};