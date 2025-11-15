// Middleware to get user profile and roles
const getProfileAndRoles = async (supabase, user) => {
    // Corrected Query: First, get the user profile and their roles.
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*, user_role(*, role(*))') // Select user data and their roles
        .eq('AuthUserID', user.id)
        .single();

    // If the basic profile isn't found, we can't proceed.
    if (userError || !userData) {
        console.error('Error fetching user profile or profile not found:', userError?.message);
        return null;
    }

    // Now, optionally try to get the employee ID if there's a link.
    const { data: employeeData, error: employeeError } = await supabase
        .from('employee')
        .select('EmpID')
        .eq('UserID', userData.UserID)
        .single();

    // If there's an error fetching the employee (other than not found), log it but don't fail.
    if (employeeError && employeeError.code !== 'PGRST116') { // PGRST116 is "Not found"
        console.warn('Could not fetch employee link for user:', employeeError.message);
    }
    
    const role = userData.user_role[0]?.role?.RoleName || null;
    const empId = employeeData?.EmpID || null;

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
    // Send a more informative error and redirect on the client side if needed
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
