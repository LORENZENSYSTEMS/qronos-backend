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
            client_id: Number(data.client_id),
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

    async generateQrData({ client_id}) { 
        if (!client_id) {
            return { code: 400, message: "el client_id es obligatorio" };
        }

        try {
            const token = this._signData({ client_id });
            
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