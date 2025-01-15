import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, Eye, Trash, X } from "lucide-react";
import Image from "next/image"; // Use this if you're working with images in Next.js

const FileStep: React.FC = () => {
  const { projectData, setProjectData } = useProject()!;
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For preview modal

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const uploadedFiles = Array.from(files);
      setProjectData({
        ...projectData!,
        files: [...(projectData?.files || []), ...uploadedFiles],
      });
    }
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = projectData?.files.filter((_, i) => i !== index) || [];
    setProjectData({ ...projectData!, files: updatedFiles });
  };

  const getFileUrl = (file: File) => URL.createObjectURL(file);

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <FilePlus className="w-6 h-6" /> Project Files
        </CardTitle>
        <CardDescription>Upload and manage files for your project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Enhanced File Upload Section */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-blue-700">
              Upload Files
            </label>
            <Button
              variant="ghost"
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg py-3 px-6 flex items-center gap-2 hover:from-blue-600 hover:to-blue-800"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <FilePlus className="w-5 h-5" />
              Click to Upload Files
            </Button>
            <Input
              type="file"
              multiple
              id="file-upload"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf"
            />
          </div>

          {/* File List with Small and Large Previews */}
          <div className="space-y-4">
            {projectData?.files?.length ? (
              <div>
                <h4 className="text-lg font-semibold text-blue-700">Uploaded Files</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectData.files.map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-md shadow-md p-3 flex flex-col items-center space-y-3"
                    >
                      <div className="relative group w-full h-32 overflow-hidden bg-gray-100 rounded-md">
                        {/* Small Preview */}
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={getFileUrl(file)}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:opacity-75 cursor-pointer"
                            onClick={() => setSelectedFile(file)} // Open large preview
                            width={300}
                            height={300}
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center h-full text-sm text-gray-500 group-hover:opacity-75 cursor-pointer"
                            onClick={() => setSelectedFile(file)}
                          >
                            {file.name}
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500 hover:bg-green-50"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => handleFileRemove(index)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* File Info */}
                      <div className="text-sm text-center">
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-600">
                          {Math.round(file.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No files uploaded yet.</p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Lightbox for Larger File Preview */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <h4 className="text-lg font-semibold mb-4">{selectedFile.name}</h4>
            {selectedFile.type.startsWith("image/") ? (
              <Image
                src={getFileUrl(selectedFile)}
                alt={selectedFile.name}
                className="w-full h-auto object-contain"
                width={300}
                height={300}
              />
            ) : (
              <div className="text-center text-sm text-gray-600">
                Preview not available for this file type.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileStep;
