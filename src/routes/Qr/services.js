// qr/qr.service.js 
import { prisma } from "../../plugins/database.js";
import crypto from 'crypto'; 

const QR_SECRET_KEY = process.env.TOKEN; 
const HASH_ALGORITHM = 'sha256';


export class QrServices { 

    _signData(data) {
        if (!QR_SECRET_KEY) {
            throw new Error("TOKEN (QR_SECRET_KEY) no definido.");
        }
        
        const payload = {
            empresa_id: Number(data.empresa_id),
            puntos: Number(data.puntos),
            nonce: crypto.randomUUID(), 
            iat: Date.now() 
        };
        const payloadString = JSON.stringify(payload);
        const hmac = crypto.createHmac(HASH_ALGORITHM, QR_SECRET_KEY)
                           .update(payloadString)
                           .digest('hex');
        const encodedPayload = Buffer.from(payloadString).toString('base64');
        
        return `${encodedPayload}.${hmac}`;
    }

    async generateQrData({ empresa_id, puntos }) { 
        if (!empresa_id || !puntos) {
            return { code: 400, message: "empresa_id y puntos son obligatorios" };
        }

        try {
            const token = this._signData({ empresa_id, puntos });
            
            return { 
                code: 201, 
                message: "Token de QR generado con firma HMAC", 
                qr_token: token 
            };
        } catch (err) {
            console.error(err);
            const code = err.message.includes('TOKEN') ? 500 : 500;
            return { code: code, message: "Error al generar los datos del QR", error: err.message };
        }
    }
}