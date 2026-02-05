import axios from 'axios';

// API Base URL - same as main client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
 * Get the auth token for requests
 */
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('bugfixer_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Check upload service status
 */
export async function getUploadStatus(): Promise<UploadStatusResponse> {
  const response = await axios.get<UploadStatusResponse>(
    `${API_BASE_URL}/upload/status`
  );
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

  const response = await axios.post<UploadSingleResponse>(
    `${API_BASE_URL}/upload/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader(),
      },
      withCredentials: true,
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

  const response = await axios.post<UploadMultipleResponse>(
    `${API_BASE_URL}/upload/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );

  return response.data;
}

/**
 * Delete an image
 * @param url - The URL of the image to delete
 */
export async function deleteImage(url: string): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(
    `${API_BASE_URL}/upload/image`,
    {
      data: { url },
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );

  return response.data;
}
