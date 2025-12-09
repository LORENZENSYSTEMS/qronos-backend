import admin from 'firebase-admin';
import { createRequire } from "module"; // Necesario para importar JSON en ES Modules

const require = createRequire(import.meta.url);
const serviceAccount = require("../../serviceAccountKey.json"); // 👈 Ruta a tu archivo descargado

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const firebaseAdminAuth = admin.auth();