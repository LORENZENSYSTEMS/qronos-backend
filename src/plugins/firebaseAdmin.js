import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Corregir saltos de línea en la clave privada si es necesario
if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

// Inicialización singleton siguiendo las mejores prácticas actuales
const app = getApps().length === 0
  ? initializeApp({
    credential: cert(serviceAccount)
  })
  : getApps()[0];

export const firebaseAdminAuth = getAuth(app);
export const db = getFirestore(app);