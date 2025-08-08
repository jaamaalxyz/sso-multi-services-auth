import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log(`📝 Signup request for: ${email}`);

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      console.log('❌ Name too short');
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create user
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    console.log(`✅ User created successfully: ${user.email}`);

    // Return success (don't include sensitive data)
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('❌ Signup error:', error);

    // Handle duplicate email error
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string' &&
      (error as { message: string }).message.includes('already exists')
    ) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Handle mongoose validation errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: unknown }).name === 'ValidationError'
    ) {
      const messages = Object.values(
        (error as mongoose.Error.ValidationError).errors
      ).map(
        (err: mongoose.Error.ValidatorError | mongoose.Error.CastError) =>
          err.message
      );
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    // Handle MongoDB duplicate key error
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
