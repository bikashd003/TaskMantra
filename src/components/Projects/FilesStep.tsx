import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, X } from 'lucide-react';
import FileUploader from '../Global/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FileData {
  name: string;
  data: string;
  type: string;
}

const FileStep: React.FC = () => {
  const { formik, resetUploader } = useProject()!;
  const { values, setFieldValue } = formik;

  const handleFileUpload = async (files: File[]) => {
    const filePromises = files.map(file => {
      return new Promise<FileData>(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve({
              name: file.name,
              data: reader.result,
              type: file.type,
            });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    const fileData = await Promise.all(filePromises);
    const updatedFiles = [...values.files, ...fileData];
    setFieldValue('files', updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...values.files];
    updatedFiles.splice(index, 1);
    setFieldValue('files', updatedFiles);
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

        {values.files && values.files.length > 0 && (
          <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-semibold mb-3">Uploaded Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {values.files.map((file, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative flex items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-1 truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 h-8 w-8 p-0 ml-2"
                      onClick={() => removeFile(index)}
                    >
                      <X size={16} />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </CardContent>
    </div>
  );
};

export default FileStep;
