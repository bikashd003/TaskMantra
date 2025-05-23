import React, { useState, useCallback } from 'react';
import { X, Upload, File as FileIcon, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface FileUploaderProps {
  multiple?: boolean;
  onChange(_files: File[]): void;
  maxSize?: number;
  reset?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  multiple = false,
  onChange,
  maxSize = 5 * 1024 * 1024,
  reset,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<{ file: File; url: string } | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast.error('Some files were rejected.');
        return;
      }
      const updatedFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
      setFiles(updatedFiles);
      const newPreviews = acceptedFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
      if (!multiple) previews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
      onChange(updatedFiles);
    },
    [onChange, previews, files, multiple]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'], 'application/pdf': ['.pdf'] },
    multiple,
    maxSize,
    noClick: true,
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    onChange(newFiles);
  };
  React.useEffect(() => {
    if (reset) {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPreviews([]);
      setFiles([]);
      setSelectedPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);
  return (
    <div
      className="w-full"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPreview(null);
      }}
    >
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg theme-transition ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
      >
        <input {...getInputProps()} className="hidden" />
        <Upload className="w-12 h-12 mb-4 theme-text-secondary" />
        <p className="text-sm text-center theme-text-secondary">
          {isDragActive ? 'Drop the files here...' : 'Drag files here or'}
        </p>
        <button
          onClick={open}
          className="mt-2 px-4 py-2 text-sm text-primary hover:text-primary/80 theme-transition"
        >
          Choose files
        </button>
        <p className="mt-2 text-xs text-center theme-text-secondary">
          Accepts images (PNG, JPG, GIF) and PDF files up to {maxSize / (1024 * 1024)}MB
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative group hover-reveal"
            onClick={e => e.stopPropagation()}
          >
            {preview.file.type.startsWith('image/') ? (
              <Image
                src={preview.url}
                alt={preview.file.name}
                width={200}
                height={200}
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center theme-surface rounded-lg h-48">
                <FileIcon className="w-16 h-16 theme-text-secondary" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 theme-transition bg-background/80 backdrop-blur-sm rounded-lg">
              <button
                onClick={() => setSelectedPreview(preview)}
                className="p-2 mx-1 theme-button-primary rounded-full"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedPreview(null);
                  removeFile(index);
                }}
                className="p-2 mx-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 theme-transition rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center ml-0 md:ml-48 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-lg overflow-hidden theme-shadow-lg theme-surface-elevated"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPreview(null);
              }}
              className="absolute top-4 right-4 p-2 theme-text-secondary hover:theme-text-primary theme-surface rounded-full theme-shadow theme-transition"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedPreview.file.type.startsWith('image/') ? (
              <Image
                src={selectedPreview.url}
                alt={selectedPreview.file.name}
                width={800}
                height={600}
                className="object-contain max-h-[80vh]"
              />
            ) : (
              <iframe
                src={selectedPreview.url}
                className="w-full h-[80vh]"
                title={selectedPreview.file.name}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
