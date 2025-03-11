import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  error?: string;
}

/**
 * Uploads a file to Cloudinary
 * @param file - The file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise<UploadResult>
 */
export const uploadToCloudinary = async (
  file: string, // file should contain proper base64 data
  folder: string = 'taskmantra'
): Promise<UploadResult> => {
  try {
    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        file,
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      secure_url: '',
      public_id: '',
      error: 'Failed to upload file',
    };
  }
};

/**
 * Deletes a file from Cloudinary
 * @param publicId - The public_id of the file to delete
 * @returns Promise<boolean>
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};
