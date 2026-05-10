import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '@/api/upload';

interface EventImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

export const EventImageUploader = ({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  disabled = false,
}: EventImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadEventImage,
    onSuccess: (data) => {
      setPreview(data.url);
      onImageUploaded(data.url);
      setUploadError(null);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      setUploadError(
        error.response?.data?.message || 'Error al subir la imagen. Intenta de nuevo.'
      );
      setPreview(null);
    },
  });

  const validateFile = (file: File): string | null => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Tipo de archivo inválido. Solo se permiten JPG, PNG o WEBP.';
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. El tamaño máximo es 5MB.';
    }

    return null;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    setUploadError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setUploadError(null);
    onImageUploaded('');
    if (onImageRemoved) {
      onImageRemoved();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Imagen de portada
        <span className="text-gray-500 font-normal ml-2">(Opcional)</span>
      </label>

      {preview ? (
        // Preview Mode
        <div className="relative group">
          <div className="relative h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            {uploadMutation.isPending && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-3"></div>
                  <p className="text-white font-medium">Subiendo imagen...</p>
                  <p className="text-white text-sm opacity-80">Por favor espera</p>
                </div>
              </div>
            )}
            {!uploadMutation.isPending && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleClickUpload}
                    disabled={disabled || uploadMutation.isPending}
                    className="flex-1 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cambiar imagen
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={disabled || uploadMutation.isPending}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
          {uploadMutation.isSuccess && !uploadMutation.isPending && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Imagen subida
            </div>
          )}
        </div>
      ) : (
        // Upload Mode
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClickUpload}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${disabled || uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploadMutation.isPending ? (
            <div className="space-y-3">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              <div>
                <p className="text-gray-700 font-medium">Subiendo imagen...</p>
                <p className="text-sm text-gray-500 mt-1">Por favor espera</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg
                  className={`mx-auto h-16 w-16 transition-colors ${
                    isDragging ? 'text-primary-600' : 'text-gray-400'
                  }`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-2">
                  {isDragging
                    ? '¡Suelta la imagen aquí!'
                    : 'Arrastra una imagen aquí o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG o WEBP (máx. 5MB)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Recomendado: 1920x1080px o superior
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-medium">Error al subir imagen</p>
            <p className="text-sm mt-1">{uploadError}</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploadMutation.isPending}
      />

      <p className="text-xs text-gray-500">
        💡 Tip: Una buena imagen de portada mejora la visibilidad de tu evento y atrae más asistentes
      </p>
    </div>
  );
};
