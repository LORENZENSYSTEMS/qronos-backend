import { hashPassword, verifyPassword } from '../../../plugins/bcrypt.js';

export class PasswordService {
  async hash(plainPassword) {
    return hashPassword(plainPassword);
  }

  async verify(plainPassword, hashed) {
    return verifyPassword(plainPassword, hashed);
  }
}