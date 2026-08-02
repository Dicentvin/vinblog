// api/upload/index.js  →  POST /api/upload
import { cors } from '../_lib/db.js';
import { v2 as cloudinary } from 'cloudinary';

// parse multipart/form-data without multer in serverless
// We use the raw body approach via Vercel's body parser config
export const config = {
  api: { bodyParser: false },
};

// Polyfill: parse multipart manually using busboy
import Busboy from 'busboy';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary credentials not configured in environment variables' });
    }

    // Parse multipart
    const fileBuffer = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let fileData = null;
      let fileName = 'upload.jpg';

      busboy.on('file', (_field, file, info) => {
        fileName = info.filename || fileName;
        const chunks = [];
        file.on('data', chunk => chunks.push(chunk));
        file.on('end', () => { fileData = { buffer: Buffer.concat(chunks), name: fileName }; });
      });

      busboy.on('finish', () => fileData ? resolve(fileData) : reject(new Error('No file received')));
      busboy.on('error', reject);
      req.pipe(busboy);
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'skylimits/blogs', resource_type: 'image' },
        (err, res2) => (err ? reject(err) : resolve(res2))
      );
      stream.end(fileBuffer.buffer);
    });

    return res.json({ url: result.secure_url, fileId: result.public_id, name: fileBuffer.name });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
