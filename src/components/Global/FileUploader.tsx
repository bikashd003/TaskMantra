import React, { useState, useCallback } from "react";
import { X, Upload, File as FileIcon, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface FileUploaderProps {
  multiple?: boolean;
  onChange(_files: File[]): void;
  maxSize?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  multiple = false, 
  onChange,
  maxSize = 5 * 1024 * 1024 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<{ file: File; url: string } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error("Some files were rejected.");
      return;
    }
    const updatedFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
    setFiles(updatedFiles);
    const newPreviews = acceptedFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
    if (!multiple) previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
    onChange(updatedFiles);
  }, [onChange, previews, files, multiple]);

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

  return (
    <div className="w-full"
    onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPreview(null);
      }}
    >
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} className="hidden" />
        <Upload className="w-12 h-12 mb-4 text-gray-400" />
        <p className="text-sm text-center text-muted-foreground">
          {isDragActive ? "Drop the files here..." : "Drag files here or"}
        </p>
        <button onClick={open} className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700">
          Choose files
        </button>
        <p className="mt-2 text-xs text-center text-gray-500">
          Accepts images (PNG, JPG, GIF) and PDF files up to {maxSize / (1024 * 1024)}MB
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group" onClick={(e) => e.stopPropagation()}>
            {preview.file.type.startsWith('image/') ? (
              <Image src={preview.url} alt={preview.file.name} width={200} height={200} className="object-cover rounded-lg" />
            ) : (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg">
                <FileIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
              <button onClick={() => setSelectedPreview(preview)} className="p-2 mx-1 text-white bg-blue-500 rounded-full hover:bg-blue-600">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={(e) => {e.stopPropagation();  e.preventDefault(); setSelectedPreview(null) ; removeFile(index)}} className="p-2 mx-1 text-white bg-red-500 rounded-full hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ml-0 md:ml-48 " onClick={() => setSelectedPreview(null)}>
          <div className="relative max-w-4xl w-full rounded-lg overflow-hidden shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPreview(null);
              }}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-lg">
              <X className="w-6 h-6" />
            </button>
            {selectedPreview.file.type.startsWith('image/') ? (
              <Image src={selectedPreview.url} alt={selectedPreview.file.name} width={800} height={600} className="object-contain max-h-[80vh]" />
            ) : (
              <iframe src={selectedPreview.url} className="w-full h-[80vh]" title={selectedPreview.file.name} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
