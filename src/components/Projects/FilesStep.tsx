import React from "react";
import { useProject } from "@/context/ProjectContext";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus } from "lucide-react";
import FileUploader from "../Global/FileUploader";

interface FileData {
  name: string;
  data: string;
  type: string;
}

const FileStep: React.FC = () => {
  const { setProjectFiles, resetUploader } = useProject()!;

  const handleFileUpload = async (files: File[]) => {
    const filePromises = files.map((file) => {
      return new Promise<FileData>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve({
              name: file.name,
              data: reader.result,
              type: file.type
            });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    const fileData = await Promise.all(filePromises);

    setProjectFiles((prev) => [...prev, ...fileData]);
  };

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <FilePlus className="w-6 h-6" /> Project Files
        </CardTitle>
        <CardDescription>Upload and manage files for your project</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploader onChange={handleFileUpload} multiple={true} reset={resetUploader} />
      </CardContent>
    </div>
  );
};

export default FileStep;