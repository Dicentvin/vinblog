import ImageKit from '@imagekit/nodejs';

export const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Upload a file buffer to ImageKit
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in ImageKit (e.g. '/bytescribe/blogs')
 */
export async function uploadToImageKit(buffer, fileName, folder = '/bytescribe') {
  const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

  const response = await imagekit.upload({
    file:              buffer,
    fileName:          uniqueName,
    folder,
    useUniqueFileName: true,
    tags:              ['bytescribe'],
  });

  return {
    url:    response.url,
    fileId: response.fileId,
    name:   response.name,
  };
}

/**
 * Delete a file from ImageKit by fileId
 * @param {string} fileId
 */
export async function deleteFromImageKit(fileId) {
  if (!fileId) return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (err) {
    console.error('ImageKit delete error:', err.message);
  }
}

/**
 * Get an optimized image URL with transformations
 * @param {string} url - Original ImageKit URL
 * @param {'thumb'|'hero'|'avatar'} size
 */
export function getImageUrl(url, size = 'thumb') {
  if (!url) return url;
  const transforms = {
    thumb:  'tr=w-400,h-220,q-auto,f-webp',
    hero:   'tr=w-1200,q-auto,f-webp',
    avatar: 'tr=w-80,h-80,fo-face,f-webp',
    card:   'tr=w-600,h-300,q-auto,f-webp',
  };
  return `${url}?${transforms[size] || transforms.thumb}`;
}
