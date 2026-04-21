/**
 * Cloudinary Service
 * For file uploads (can be implemented later)
 */

export const uploadFile = async (file, options = {}) => {
  // TODO: Implement Cloudinary upload
  // For now, return the file as base64 or URL
  if (typeof file === 'string') {
    return file; // Already a URL
  }
  
  // Convert file to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


