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
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl theme-transition group cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
            : 'border-border hover:border-primary hover:bg-primary/5 hover:shadow-md'
        }`}
      >
        <input {...getInputProps()} className="hidden" />

        {/* Upload Icon with Animation */}
        <div
          className={`relative mb-4 theme-transition ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 theme-transition"></div>
          <div className="relative p-4 theme-surface-elevated rounded-full border theme-border">
            <Upload
              className={`w-8 h-8 theme-text-secondary theme-transition ${isDragActive ? 'text-primary' : 'group-hover:text-primary'}`}
            />
          </div>
        </div>

        {/* Main Text */}
        <div className="text-center mb-4">
          <p
            className={`text-lg font-medium mb-2 theme-transition ${isDragActive ? 'theme-text-primary' : 'theme-text-secondary group-hover:theme-text-primary'}`}
          >
            {isDragActive ? 'Drop your files here' : 'Upload your files'}
          </p>
          <p className="text-sm theme-text-secondary">
            Drag and drop files here, or click to browse
          </p>
        </div>

        {/* Choose Files Button */}
        <button
          onClick={open}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium theme-transition hover:bg-primary/90 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          Choose Files
        </button>

        {/* File Info */}
        <div className="mt-4 text-center">
          <p className="text-xs theme-text-secondary">
            Supports: <span className="font-medium">PNG, JPG, GIF, PDF</span>
          </p>
          <p className="text-xs theme-text-secondary mt-1">
            Maximum size: <span className="font-medium">{maxSize / (1024 * 1024)}MB per file</span>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 theme-transition delay-100"></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 theme-transition delay-200"></div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative group hover-reveal"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-xl theme-surface-elevated border theme-border theme-shadow-sm hover:theme-shadow-md theme-transition group-hover:scale-[1.02]">
              {preview.file.type.startsWith('image/') ? (
                <div className="relative aspect-square">
                  <Image src={preview.url} alt={preview.file.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 theme-transition"></div>
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center p-4">
                  <div className="p-3 theme-surface rounded-full mb-3">
                    <FileIcon className="w-8 h-8 theme-text-secondary" />
                  </div>
                  <p className="text-xs theme-text-secondary text-center font-medium">
                    PDF Document
                  </p>
                </div>
              )}

              {/* File name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs text-white font-medium truncate">{preview.file.name}</p>
                <p className="text-xs text-white/70">{(preview.file.size / 1024).toFixed(1)} KB</p>
              </div>

              {/* Action buttons overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 theme-transition bg-black/40 backdrop-blur-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPreview(preview)}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full theme-transition hover:scale-110 backdrop-blur-sm"
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
                    className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full theme-transition hover:scale-110 backdrop-blur-sm"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
