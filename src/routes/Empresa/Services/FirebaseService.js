import { firebaseAdminAuth } from '../../../plugins/firebaseAdmin.js';

export class FirebaseService {
  async createUser({ email, password, displayName }) {
    return firebaseAdminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
  }

  async deleteUser(uid) {
    try {
      await firebaseAdminAuth.deleteUser(uid);
    } catch (err) {
      console.log('Usuario no encontrado en Firebase o ya eliminado:', err.message);
    }
  }

  async verifyUser(uid) {
    await firebaseAdminAuth.updateUser(uid, { emailVerified: true });
  }
}
