/**
 * User model (in-memory for now)
 * In production, this would be stored in a database
 */
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

// In-memory user store
const users: Map<string, User> = new Map();

// Initialize with default admin user
async function initializeDefaultUser() {
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  users.set("admin", {
    id: "user-1",
    username: "admin",
    passwordHash,
    createdAt: Date.now(),
  });
}

// Initialize on module load
initializeDefaultUser().catch((err) => {
  console.error("Failed to initialize default user:", err);
});

/**
 * Find user by username
 */
export function findUserByUsername(username: string): User | null {
  return users.get(username) || null;
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | null {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
}

/**
 * Verify user password
 */
export async function verifyPassword(
  username: string,
  password: string
): Promise<boolean> {
  const user = findUserByUsername(username);
  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.passwordHash);
}

/**
 * Create a new user (for future use)
 */
export async function createUser(
  username: string,
  password: string
): Promise<User> {
  if (users.has(username)) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: `user-${Date.now()}`,
    username,
    passwordHash,
    createdAt: Date.now(),
  };

  users.set(username, user);
  return user;
}

