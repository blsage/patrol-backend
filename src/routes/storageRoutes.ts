import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authenticateJWT } from '../middleware/authMiddleware';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

router.get('/presigned-url', authenticateJWT, async (req, res) => {
    try {
        const key = `uploads/${uuidv4()}.jpg`;
        const contentType = 'image/jpeg';

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const viewingUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        res.status(200).json({ presignedUrl, viewingUrl });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({ message: 'Failed to generate presigned URL.' });
    }
});

export default router;
