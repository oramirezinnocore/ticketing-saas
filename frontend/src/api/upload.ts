import axios from 'axios';
import type { UploadedImage, ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Upload event cover image
 * @param file - Image file to upload
 * @returns Uploaded image URL and metadata
 */
export const uploadEventImage = async (file: File): Promise<UploadedImage> => {
  const formData = new FormData();
  formData.append('image', file);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  const response = await axios.post<ApiResponse<UploadedImage>>(
    `${API_BASE_URL}/api/v1/upload/event-image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  return response.data.data;
};

export const uploadApi = {
  uploadEventImage,
};
