// api/upload/index.js  →  POST /api/upload
import { cors } from '../_lib/db.js';
import ImageKit from '@imagekit/nodejs';

// parse multipart/form-data without multer in serverless
// We use the raw body approach via Vercel's body parser config
export const config = {
  api: { bodyParser: false },
};

// Polyfill: parse multipart manually using busboy
import Busboy from 'busboy';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const imagekit = new ImageKit({
      publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

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

    const result = await imagekit.upload({
      file:     fileBuffer.buffer,
      fileName: fileBuffer.name,
      folder:   '/skylimits/blogs',
    });

    return res.json({ url: result.url, fileId: result.fileId, name: result.name });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
