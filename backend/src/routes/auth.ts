import express from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, LoginCredentials, RegisterData, ApiResponse, AuthUser } from '../types';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: '7d' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const registerData: RegisterData = req.body;
    
    // Validate required fields
    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, firstName, lastName'
      } as ApiResponse);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', registerData.email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 12);

    // Create user in Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: registerData.email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        date_of_birth: registerData.dateOfBirth,
        location: registerData.location,
        employment_status: registerData.employmentStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, first_name, last_name, date_of_birth, location, employment_status, created_at, updated_at')
      .single();

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user account'
      } as ApiResponse);
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Transform database format to API format
    const user: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      dateOfBirth: newUser.date_of_birth,
      location: newUser.location,
      employmentStatus: newUser.employment_status,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at,
      token
    };

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully'
    } as ApiResponse<AuthUser>);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    } as ApiResponse);
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginCredentials = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
    }

    // Find user in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Update last login
    await supabase
      .from('users')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Transform database format to API format
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
      dateOfBirth: user.date_of_birth,
      location: user.location,
      employmentStatus: user.employment_status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      token
    };

    res.json({
      success: true,
      data: authUser,
      message: 'Login successful'
    } as ApiResponse<AuthUser>);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    } as ApiResponse);
  }
});

// Verify token and get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      } as ApiResponse);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_picture, date_of_birth, location, employment_status, created_at, updated_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      } as ApiResponse);
    }

    // Transform database format to API format
    const authUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
      dateOfBirth: user.date_of_birth,
      location: user.location,
      employmentStatus: user.employment_status,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({
      success: true,
      data: authUser
    } as ApiResponse<User>);

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    } as ApiResponse);
  }
});

// Logout (client-side token removal, but we can log the event)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  } as ApiResponse);
});

export default router;