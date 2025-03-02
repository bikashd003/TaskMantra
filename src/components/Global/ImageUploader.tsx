"use client";
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { type Crop } from 'react-image-crop';
import Image from 'next/image';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, X, Check, Crop as CropIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
    onImageUpload: (_file: File, _croppedBlob?: Blob) => void;
    maxSizeMB?: number;
    aspectRatio?: number;
    className?: string;
    allowedTypes?: string[];
    initialImage?: string | null;
}

const ImageUploader = ({
    onImageUpload,
    maxSizeMB = 5,
    aspectRatio,
    className = '',
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    initialImage,
}: ImageUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 90,
        height: aspectRatio ? 90 / aspectRatio : 90,
        x: 5,
        y: 5,
    });
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [zoom, setZoom] = useState(1);

    const inputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const validateFile = (file: File): boolean => {
        setError(null);

        if (!allowedTypes.includes(file.type)) {
            setError(`Unsupported file type. Please upload: ${allowedTypes.join(', ')}`);
            return false;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
            return false;
        }

        return true;
    };

    const handleFile = useCallback((file: File) => {
        if (!validateFile(file)) return;

        setFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxSizeMB, allowedTypes]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setImage(null);
        setFile(null);
        setError(null);
        setIsCropping(false);
        setCrop({
            unit: '%',
            width: 90,
            height: aspectRatio ? 90 / aspectRatio : 90,
            x: 5,
            y: 5,
        });
        setCompletedCrop(null);
        setZoom(1);
        if (inputRef.current) inputRef.current.value = '';
    };
    const generateCroppedImage = async () => {
        if (!imgRef.current || !completedCrop) return null;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError("Couldn't process image. Please try again.");
            return null;
        }

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
        );

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
                (blob) => resolve(blob),
                file?.type || 'image/jpeg',
                0.95
            );
        });
    };

    const handleCropComplete = async () => {
        if (!file || !completedCrop) return;

        const croppedBlob = await generateCroppedImage();
        if (croppedBlob) {
            const croppedImageUrl = URL.createObjectURL(croppedBlob);
            setImage(croppedImageUrl);
            onImageUpload(file, croppedBlob);
        } else {
            onImageUpload(file);
        }
        setIsCropping(false);
    };
    return (
        <div className={`w-full ${className}`}>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept={allowedTypes.join(',')}
                className="hidden"
            />

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {!image ? (
                <motion.div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
                        }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleButtonClick}
                >
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                Drag and drop your image here
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                or click to browse files (max {maxSizeMB}MB)
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900"
                >
                    {isCropping ? (
                        <div className="flex flex-col space-y-4">
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Crop Image
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            type='button'
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        <span>Cancel</span>
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleCropComplete}
                                        className="h-8 bg-blue-600 hover:bg-blue-700"
                                            type='button'
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        <span>Apply</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 overflow-hidden">
                                    <div className="max-h-[500px] overflow-auto flex justify-center">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={aspectRatio}
                                        className="mx-auto"
                                    >
                                        <Image
                                            ref={imgRef}
                                            src={image}
                                            alt="Upload"
                                            style={{ transform: `scale(${zoom})` }}
                                            className="max-w-full transition-transform duration-150 mx-auto"
                                                width={300}
                                                height={300}
                                        />
                                    </ReactCrop>
                                </div>
                            </div>


                        </div>
                    ) : (
                        <div className="relative aspect-square md:aspect-auto">
                            <Image
                                src={image}
                                alt="Uploaded preview"
                                        className="object-cover w-full h-fit"
                                        width={200}
                                        height={200}
                            />
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsCropping(true)}
                                    className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 backdrop-blur-sm"
                                >
                                    <CropIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRemoveImage}
                                    className="h-8 w-8 bg-white/90 hover:bg-white hover:text-red-500 dark:bg-gray-800/90 dark:hover:bg-gray-800 backdrop-blur-sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ImageUploader;