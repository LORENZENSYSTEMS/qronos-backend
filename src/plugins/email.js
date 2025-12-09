// plugins/email.js (Ejemplo usando Nodemailer)
import nodemailer from 'nodemailer';

// Configuración del transportador (DEBE CONFIGURAR TUS VARIABLES DE ENTORNO)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Ej: 'smtp.mailtrap.io' o 'smtp.gmail.com'
    port: process.env.EMAIL_PORT, // Ej: 2525 o 465
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendVerificationEmail(recipientEmail, token, type) {
    // URL base de tu backend (o un frontend que redirija al backend)
    // Asegúrate de que esta URL sea accesible desde internet.
    const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'; 
    const verificationLink = `${BASE_URL}/api/${type}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Verificación de Correo Electrónico',
        html: `
            <h1>Verifica tu cuenta</h1>
            <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #000b76; text-decoration: none; border-radius: 5px;">
                Verificar Correo
            </a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p>${verificationLink}</p>
        `,
    };

    console.log(`Intentando enviar correo a: ${recipientEmail} con token: ${token}`);
    
    // Esto enviará el correo
    await transporter.sendMail(mailOptions);
    console.log("Correo de verificación enviado exitosamente.");
}