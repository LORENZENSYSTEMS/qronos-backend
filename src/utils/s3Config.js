import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const uploadToS3 = async (fileBuffer, fileName, mimetype) => {
    const bucketName = process.env.S3_BUCKET_NAME;
    const key = `perfiles/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype, // Esto permite que la imagen se vea en el navegador
    });

    await s3Client.send(command);
    
    // Retornamos la URL lista para guardar en la base de datos
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};