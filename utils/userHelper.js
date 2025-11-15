/**
 * Generates a unique username based on first and last names.
 * e.g., "David Hernandez" -> "dahernandez", "dahernandez1", etc.
 * @param {object} supabase - The Supabase client.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {Promise<string>} A unique username.
 */
const generateUniqueUsername = async (supabase, firstName, lastName) => {
    const firstInitial = firstName.substring(0, 2).toLowerCase();
    const lastNameSanitized = lastName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let baseUsername = `${firstInitial}${lastNameSanitized}`;
    let username = baseUsername;
    let counter = 1;

    while (true) {
        const { data, error } = await supabase
            .from('user')
            .select('UserName')
            .eq('UserName', username)
            .single();

        if (error && error.code === 'PGRST116') { // "Not found"
            return username; // The username is unique
        } else if (data) {
            username = `${baseUsername}${counter}`;
            counter++;
        } else {
            // Some other database error occurred
            throw new Error('Database error while checking username uniqueness: ' + error.message);
        }
    }
};

/**
 * Creates a user in Supabase Auth and a corresponding profile in the public 'user' table.
 * @param {object} req - The Express request object.
 * @param {object} details - User details { email, password, firstName, lastName }.
 * @returns {Promise<object>} The created user profile from the public table.
 */
export const createSystemUser = async (req, details) => {
    const { supabase, supabaseAdmin } = req;
    const { email, password, firstName, lastName } = details;

    if (!email || !password || !firstName || !lastName) {
        throw new Error('Email, password, first name, and last name are required to create a user.');
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
        // Handle case where user might already exist in auth but not in public table
        if (authError.message.includes('already registered')) {
            throw new Error('Este correo electrónico ya está registrado en el sistema.');
        }
        throw new Error(`Error creating auth user: ${authError.message}`);
    }

    const authUser = authData.user;

    // 2. Generate a unique username
    const username = await generateUniqueUsername(supabase, firstName, lastName);

    // 3. Create user profile in public.user table
    const { data: userData, error: userError } = await supabase
        .from('user')
        .insert({
            AuthUserID: authUser.id,
            UserName: username,
            Email: email,
            FirstName: firstName,
            LastName: lastName,
            IsActive: 1
        })
        .select()
        .single();
    
    if (userError) {
        // Rollback: If profile creation fails, delete the auth user
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        throw new Error(`Error creating user profile: ${userError.message}`);
    }

    return userData;
};
