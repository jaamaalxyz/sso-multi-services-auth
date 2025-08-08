import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../config/database';

// TypeScript interface for User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  services?: string[];
  isEmailVerified?: boolean;

  // Instance methods
  comparePassword(plainPassword: string): Promise<boolean>;
  addService(serviceName: string): Promise<IUser>;

  /**
   * Convert the user document to a JSON object for authentication.
   * @returns An object containing the user's ID, name, email, and last login date.
   */
  toAuthJSON(): {
    id: string;
    name: string;
    email: string;
    lastLoginAt?: Date;
    services?: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

// Interface for User model with static methods
export interface IUserModel extends Model<IUser> {
  createUser(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByIdSafe(id: string): Promise<IUser | null>;
  verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  updateLastLogin(userId: string, serviceName: string): Promise<IUser | null>;
}

// User schema with comprehensive validation
const UserSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    services: [
      {
        type: String,
        enum: ['service-a', 'service-b', 'service-c'],
        default: [],
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Auto-creates createdAt and updatedAt
    versionKey: false, // Remove __v field
  }
);

// Indexes for performance
UserSchema.index({ lastLoginAt: 1 });
UserSchema.index({ createdAt: 1 });

// Static Methods
UserSchema.statics.createUser = async function (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<IUser> {
  await dbConnect();

  // Check if user exists
  const existingUser = await this.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error(`User with email ${userData.email} already exists`);
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Create user
  const user = new this({
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    services: [],
  });

  const savedUser = await user.save();
  console.log(`✅ User created: ${savedUser.email} (ID: ${savedUser._id})`);

  // Return user without password
  const userWithoutPassword = await this.findById(savedUser._id).select(
    '-password'
  );
  return userWithoutPassword as IUser;
};

UserSchema.statics.findByEmail = async function (
  email: string
): Promise<IUser | null> {
  await dbConnect();
  const user = await this.findOne({ email: email.toLowerCase().trim() }).select(
    '+password'
  );
  if (user) {
    console.log(`🔍 Found user: ${user.email}`);
  }
  return user;
};

UserSchema.statics.findByIdSafe = async function (
  id: string
): Promise<IUser | null> {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log(`❌ Invalid ObjectId: ${id}`);
    return null;
  }
  const user = await this.findById(id).select('-password');
  if (user) {
    console.log(`🔍 Found user by ID: ${user.email} (${id})`);
  }
  return user;
};

UserSchema.statics.verifyPassword = async function (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

UserSchema.statics.updateLastLogin = async function (
  userId: string,
  serviceName: string
): Promise<IUser | null> {
  await dbConnect();
  return await this.findByIdAndUpdate(
    userId,
    {
      lastLoginAt: new Date(),
      $addToSet: { services: serviceName },
    },
    { new: true, select: '-password' }
  );
};

// Instance Methods
UserSchema.methods.comparePassword = async function (
  plainPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, this.password);
};

UserSchema.methods.addService = async function (
  this: IUser,
  serviceName: string
): Promise<IUser> {
  if (!this.services?.includes(serviceName)) {
    if (!this.services) {
      this.services = [];
    }
    this.services.push(serviceName);
  }
  return this;
};

UserSchema.methods.toAuthJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    lastLoginAt: this.lastLoginAt,
    services: this.services,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Prevent password from being returned in JSON by default
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create model with singleton pattern and proper typing
const User: IUserModel = (mongoose.models.User ||
  mongoose.model<IUser, IUserModel>('User', UserSchema)) as IUserModel;

export default User;

// Simplified UserModel class for easier usage across the app
export const UserModel = {
  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    return await User.createUser(userData);
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findByEmail(email);
  },

  async findById(id: string): Promise<IUser | null> {
    return await User.findByIdSafe(id);
  },

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await User.verifyPassword(plainPassword, hashedPassword);
  },

  async updateLastLogin(
    userId: string,
    serviceName: string
  ): Promise<IUser | null> {
    return await User.updateLastLogin(userId, serviceName);
  },

  async findAll(): Promise<IUser[]> {
    await dbConnect();
    return await User.find({}).select('-password').sort({ createdAt: -1 });
  },

  async getUserStats(): Promise<{
    total: number;
    recent: number;
    services: Record<string, number>;
  }> {
    await dbConnect();
    const total = await User.countDocuments();
    const recent = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const serviceStats = await User.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
    ]);

    const services = serviceStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return { total, recent, services };
  },
};
