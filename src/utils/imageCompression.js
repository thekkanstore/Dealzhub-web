/**
 * Client-Side Image Compression & WebP Converter Utility
 * Automatically scales images to max bounds and encodes to high-efficiency WebP.
 */

export const compressImageToWebP = async (
  file,
  {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
  } = {}
) => {
  if (!file || !(file instanceof File || file instanceof Blob)) {
    return file;
  }

  // Bypass SVGs, non-image files, or already tiny assets (< 40KB)
  if (file.type === 'image/svg+xml' || (file.size && file.size < 40 * 1024)) {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Downscale proportionally if larger than max bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        return resolve(file); // Fallback to raw file if canvas context unavailable
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt export as image/webp
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to JPEG if WebP blob generation fails
            canvas.toBlob(
              (fallbackBlob) => {
                if (!fallbackBlob) return resolve(file);
                const originalName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'upload';
                const jpegFile = new File([fallbackBlob], `${originalName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(jpegFile);
              },
              'image/jpeg',
              quality
            );
            return;
          }

          const originalName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'upload';
          const webpFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fail open: use original file if decoding fails
    };

    img.src = objectUrl;
  });
};

/**
 * Batch compress an array of image files in parallel
 */
export const compressMultipleImagesToWebP = async (files, options = {}) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return Promise.all(files.map((file) => compressImageToWebP(file, options)));
};

export default compressImageToWebP;
