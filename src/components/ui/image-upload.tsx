/**
 * ImageUpload Component
 * 
 * A reusable component for uploading and previewing images.
 * Supports drag & drop, multiple files, and shows upload progress.
 */

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadMultipleImages, type UploadedImage } from '@/lib/api/upload';

interface ImageUploadProps {
  /** Project ID for organizing uploads */
  projectId: string;
  /** Optional bug ID (for existing bugs) */
  bugId?: string;
  /** Currently uploaded image URLs */
  images: string[];
  /** Callback when images change */
  onChange: (urls: string[]) => void;
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Disable the component */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

interface PreviewImage {
  url: string;
  isUploading: boolean;
  error?: string;
  file?: File;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUpload({
  projectId,
  bugId,
  images,
  onChange,
  maxImages = 5,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>(
    images.map((url) => ({ url, isUploading: false }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = previews.length < maxImages && !disabled;

  /**
   * Validate a file before upload
   */
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`;
    }
    return null;
  };

  /**
   * Handle file selection
   */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - previews.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of filesToProcess) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    } else {
      setUploadError(null);
    }

    if (validFiles.length === 0) return;

    // Create local previews with uploading state
    const newPreviews: PreviewImage[] = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      isUploading: true,
      file,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);

    try {
      // Upload files
      const response = await uploadMultipleImages(validFiles, projectId, bugId);

      // Update previews with actual URLs
      setPreviews((prev) => {
        const updatedPreviews = [...prev];
        let uploadIndex = 0;

        for (let i = 0; i < updatedPreviews.length; i++) {
          if (updatedPreviews[i].isUploading && uploadIndex < response.images.length) {
            // Revoke the object URL
            URL.revokeObjectURL(updatedPreviews[i].url);
            // Update with actual URL
            updatedPreviews[i] = {
              url: response.images[uploadIndex].url,
              isUploading: false,
            };
            uploadIndex++;
          }
        }

        return updatedPreviews;
      });

      // Call onChange with all uploaded URLs
      const allUrls = [
        ...images,
        ...response.images.map((img: UploadedImage) => img.url),
      ];
      onChange(allUrls);
    } catch (error) {
      // Mark uploads as failed
      setPreviews((prev) =>
        prev.map((p) =>
          p.isUploading
            ? { ...p, isUploading: false, error: 'Upload failed' }
            : p
        )
      );

      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(message);
    }
  }, [projectId, bugId, images, maxImages, previews.length, onChange]);

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canAddMore) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canAddMore) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  /**
   * Remove an image
   */
  const handleRemove = (index: number) => {
    const preview = previews[index];

    // Revoke object URL if it's a local preview
    if (preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url);
    }

    // Remove from previews
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);

    // Update parent with new URLs (only non-uploading, non-error items)
    const newUrls = newPreviews
      .filter((p) => !p.isUploading && !p.error)
      .map((p) => p.url);
    onChange(newUrls);
  };

  /**
   * Open file dialog
   */
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !canAddMore && 'opacity-50 cursor-not-allowed',
          canAddMore && 'cursor-pointer hover:border-primary/50',
          'border-muted-foreground/25'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={canAddMore ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={!canAddMore}
        />

        <div className="flex flex-col items-center justify-center py-4 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {canAddMore ? (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
              </>
            ) : (
              `Maximum ${maxImages} images reached`
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, GIF, WebP, SVG up to 10MB
          </p>
        </div>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {uploadError}
        </div>
      )}

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div
              key={preview.url}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border bg-muted',
                preview.error && 'border-destructive'
              )}
            >
              {/* Image */}
              <img
                src={preview.url}
                alt={`Upload ${index + 1}`}
                className={cn(
                  'w-full h-full object-cover',
                  preview.isUploading && 'opacity-50'
                )}
              />

              {/* Uploading overlay */}
              {preview.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* Error overlay */}
              {preview.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              )}

              {/* Remove button */}
              {!preview.isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image count */}
      <p className="text-xs text-muted-foreground text-right">
        {previews.filter((p) => !p.error).length} / {maxImages} images
      </p>
    </div>
  );
}

/**
 * Simple image gallery for displaying uploaded screenshots
 */
interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2', className)}>
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            className="relative aspect-video rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary transition-all"
            onClick={() => setSelectedImage(url)}
          >
            <img
              src={url}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Show placeholder on error
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).classList.add('hidden');
                (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
            <div className="hidden items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={selectedImage}
              alt="Screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
