import React, { useState, useCallback } from 'react';
import { X, Upload, File as FileIcon, Eye } from 'lucide-react';
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
        className={`relative flex items-center gap-4 w-full p-4 border-2 border-dashed rounded-lg theme-transition group cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-md'
            : 'border-border hover:border-primary hover:bg-primary/5 hover:shadow-sm'
        }`}
      >
        <input {...getInputProps()} className="hidden" />

        {/* Upload Icon - Compact */}
        <div
          className={`flex-shrink-0 theme-transition ${isDragActive ? 'scale-105' : 'group-hover:scale-105'}`}
        >
          <div className="relative p-2 theme-surface-elevated rounded-lg border theme-border">
            <Upload
              className={`w-5 h-5 theme-text-secondary theme-transition ${isDragActive ? 'text-primary' : 'group-hover:text-primary'}`}
            />
          </div>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium theme-transition ${isDragActive ? 'theme-text-primary' : 'theme-text-secondary group-hover:theme-text-primary'}`}
              >
                {isDragActive ? 'Drop your files here' : 'Upload your files'}
              </p>
              <p className="text-xs theme-text-secondary mt-0.5">
                Drag & drop or click to browse • PNG, JPG, GIF, PDF • Max {maxSize / (1024 * 1024)}
                MB
              </p>
            </div>

            {/* Choose Files Button - Compact */}
            <button
              onClick={open}
              className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium theme-transition hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background"
            >
              Browse
            </button>
          </div>
        </div>

        {/* Subtle Decorative Element */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 theme-transition"></div>
      </div>

      {/* File Previews - Compact List */}
      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 p-3 theme-surface-elevated border theme-border rounded-lg theme-shadow-sm hover:theme-shadow-md theme-transition group-hover:scale-[1.01]">
                {/* File Icon/Thumbnail */}
                <div className="flex-shrink-0">
                  {preview.file.type.startsWith('image/') ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                      <Image
                        src={preview.url}
                        alt={preview.file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center theme-surface rounded-md border theme-border">
                      <FileIcon className="w-5 h-5 theme-text-secondary" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text-primary truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs theme-text-secondary">
                    {preview.file.type.startsWith('image/') ? 'Image' : 'PDF Document'} •{' '}
                    {(preview.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 theme-transition">
                  <button
                    onClick={() => setSelectedPreview(preview)}
                    className="p-1.5 theme-surface hover:theme-surface-elevated text-primary rounded-md theme-transition hover:scale-105"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelectedPreview(null);
                      removeFile(index);
                    }}
                    className="p-1.5 theme-surface hover:bg-red-500/10 text-red-500 rounded-md theme-transition hover:scale-105"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
