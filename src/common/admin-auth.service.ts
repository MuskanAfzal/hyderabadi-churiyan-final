import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { FileDB } from './filedb';

type AdminAuthFile = {
  passwordHash?: string;
  passwordSalt?: string;
  updatedAt?: string;
  username?: string;
};

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  username: string;
};

const authFileDb = new FileDB<AdminAuthFile>('data/admin-auth.json', {});

function envUsername() {
  return process.env.ADMIN_USER || 'admin';
}

function envPassword() {
  return process.env.ADMIN_PASS || 'admin123';
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}

function safeCompareHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export class AdminAuthService {
  getUsername() {
    return authFileDb.read().username || envUsername();
  }

  verify(username: string, password: string) {
    const credentials = authFileDb.read();
    const expectedUser = credentials.username || envUsername();

    if (username !== expectedUser) {
      return false;
    }

    if (credentials.passwordHash && credentials.passwordSalt) {
      return safeCompareHex(
        hashPassword(password, credentials.passwordSalt),
        credentials.passwordHash,
      );
    }

    return password === envPassword();
  }

  changePassword(input: ChangePasswordInput) {
    const username = input.username.trim();
    const currentPassword = input.currentPassword;
    const newPassword = input.newPassword;

    if (!this.verify(username, currentPassword)) {
      throw new Error('Current username or password is incorrect.');
    }

    if (newPassword.trim().length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    if (newPassword === currentPassword) {
      throw new Error('New password must be different from the current one.');
    }

    const salt = randomBytes(16).toString('hex');

    authFileDb.write({
      passwordHash: hashPassword(newPassword, salt),
      passwordSalt: salt,
      updatedAt: new Date().toISOString(),
      username,
    });
  }
}
