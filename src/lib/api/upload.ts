import apiClient from './client';

// API Base URL - same as main client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7070/api';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedImage {
  url: string;
  originalName: string;
  size: number;
  contentType: string;
}

export interface UploadSingleResponse {
  message: string;
  image: UploadedImage;
}

export interface UploadMultipleResponse {
  message: string;
  images: UploadedImage[];
}

export interface UploadStatusResponse {
  configured: boolean;
  details: string;
  limits: {
    maxFileSize: string;
    maxFiles: number;
    allowedTypes: string[];
  };
}

// ============================================================================
// UPLOAD API FUNCTIONS
// ============================================================================

/**
 * Check upload service status
 */
export async function getUploadStatus(): Promise<UploadStatusResponse> {
  const response = await apiClient.get<UploadStatusResponse>('/upload/status');
  return response.data;
}

/**
 * Upload a single image
 * @param file - The file to upload
 * @param projectId - The project ID to associate with the image
 * @param bugId - Optional bug ID (for existing bugs)
 */
export async function uploadSingleImage(
  file: File,
  projectId: string,
  bugId?: string
): Promise<UploadSingleResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('projectId', projectId);
  if (bugId) {
    formData.append('bugId', bugId);
  }

  const response = await apiClient.post<UploadSingleResponse>(
    '/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Upload multiple images (up to 5)
 * @param files - The files to upload
 * @param projectId - The project ID to associate with the images
 * @param bugId - Optional bug ID (for existing bugs)
 */
export async function uploadMultipleImages(
  files: File[],
  projectId: string,
  bugId?: string
): Promise<UploadMultipleResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  formData.append('projectId', projectId);
  if (bugId) {
    formData.append('bugId', bugId);
  }

  const response = await apiClient.post<UploadMultipleResponse>(
    '/upload/images',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Delete an image
 * @param url - The URL of the image to delete
 */
export async function deleteImage(url: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    '/upload/image',
    { data: { url } }
  );

  return response.data;
}
