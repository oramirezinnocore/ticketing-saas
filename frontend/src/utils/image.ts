/**
 * Image URL utilities for handling backend image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Get full image URL from backend path
 * Handles both absolute URLs and relative paths
 *
 * @param path - Image path (can be full URL or relative path)
 * @returns Full absolute URL for the image
 *
 * @example
 * getImageUrl('/uploads/events/abc123.jpg')
 * // Returns: 'http://localhost:5001/uploads/events/abc123.jpg'
 *
 * getImageUrl('http://localhost:5001/uploads/events/abc123.jpg')
 * // Returns: 'http://localhost:5001/uploads/events/abc123.jpg'
 *
 * getImageUrl(undefined)
 * // Returns: undefined
 */
export const getImageUrl = (path?: string): string | undefined => {
  if (!path) {
    return undefined;
  }

  // If already an absolute URL (http:// or https://), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If relative path, prepend base URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Check if an image URL is valid and accessible
 *
 * @param url - Image URL to check
 * @returns Promise that resolves to true if image is accessible
 */
export const isImageAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.startsWith('image/') ?? false);
  } catch {
    return false;
  }
};

/**
 * Get image dimensions from URL
 *
 * @param url - Image URL
 * @returns Promise with image width and height
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};
