'use client';

import React, { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Github, Linkedin, Twitter } from 'lucide-react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Spinner } from '@heroui/react';
import { Skeleton } from '@heroui/skeleton';

const profileFormSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, 'Username must be at least 2 characters.')
    .required('Username is required.'),
  email: Yup.string().email('Please enter a valid email address.').required('Email is required.'),
  bio: Yup.string().max(160, 'Bio must not exceed 160 characters.'),
  urls: Yup.object().shape({
    github: Yup.string().url('Please enter a valid URL.').nullable().notRequired(),
    twitter: Yup.string().url('Please enter a valid URL.').nullable().notRequired(),
    linkedin: Yup.string().url('Please enter a valid URL.').nullable().notRequired(),
  }),
});

export default function ProfileSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profileSettings, isLoading } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/settings/profile');
      return data;
    },
  });
  const queryClient = useQueryClient();

  const profile = profileSettings?.profile;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: any) => {
      await axios.patch('/api/settings/profile', values);
      return values;
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Profile Updated');
    },
  });
  const { mutateAsync: uploadImageMutation, isPending: isUploading } = useMutation({
    mutationFn: async (image: string) => {
      const { data } = await axios.post('/api/settings/profile', { file: image });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload image');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileSettings'] });
      toast.success('Profile picture updated');
    },
  });

  const initialValues = {
    username: profile?.username || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    urls: {
      github: profile?.urls?.github || '',
      twitter: profile?.urls?.twitter || '',
      linkedin: profile?.urls?.linkedin || '',
    },
  };
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await uploadImageMutation(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error('Error uploading image', {
        description: error.message,
      });
    }
  };
  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium theme-text-primary">Profile Settings</h3>
        <p className="text-sm theme-text-secondary">
          Manage your personal information and preferences
        </p>
      </div>
      <Separator className="theme-divider" />

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <Card className="theme-surface-elevated hover-reveal theme-transition">
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2 rounded-sm loading-skeleton" />
                <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
              </>
            ) : (
              <>
                <CardTitle className="theme-text-primary">Profile Picture</CardTitle>
                <CardDescription className="theme-text-secondary">
                  Upload a profile picture to personalize your account
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full loading-skeleton" />
            ) : (
              <Avatar className="h-24 w-24 theme-border border-2">
                <AvatarImage src={profile?.image} alt="Profile" />
                <AvatarFallback className="theme-surface theme-text-primary">
                  {profile?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-32 rounded-sm loading-skeleton" />
                  <Skeleton className="h-4 w-56 rounded-sm loading-skeleton" />
                </>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="outline"
                    className="gap-2 theme-button-ghost interactive-hover theme-transition"
                    onClick={handleImageClick}
                    disabled={isUploading}
                  >
                    {isUploading ? <Spinner color="primary" /> : <Camera className="h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Change Picture'}
                  </Button>
                  <p className="text-xs theme-text-secondary">
                    Recommended: Square image, at least 400x400px
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="theme-surface-elevated hover-reveal theme-transition">
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2 rounded-sm loading-skeleton" />
                <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
              </>
            ) : (
              <>
                <CardTitle className="theme-text-primary">Profile Information</CardTitle>
                <CardDescription className="theme-text-secondary">
                  Update your personal details and public profile information
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={profileFormSchema}
              onSubmit={async values => {
                await mutateAsync(values);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-10 w-full mb-1 rounded-sm" />
                          <Skeleton className="h-4 w-48 mb-1 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <label htmlFor="username" className="block text-sm font-medium">
                            Username
                          </label>
                          <Field
                            id="username"
                            name="username"
                            as={Input}
                            placeholder="bikashd003"
                          />
                          <ErrorMessage
                            name="username"
                            component="div"
                            className="text-sm text-red-500"
                          />
                          <p className="text-xs text-muted-foreground">
                            This is your public display name.
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-10 w-full mb-1 rounded-sm" />
                          <Skeleton className="h-4 w-48 mb-1 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <label htmlFor="email" className="block text-sm font-medium">
                            Email
                          </label>
                          <Field
                            id="email"
                            name="email"
                            as={Input}
                            placeholder="bikashd003@gmail.com"
                            disabled
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-sm text-red-500"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your email address will not be publicly displayed.
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-16 w-full mb-1 rounded-sm" />
                          <Skeleton className="h-4 w-48 mb-1 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <label htmlFor="bio" className="block text-sm font-medium">
                            Bio
                          </label>
                          <Field
                            id="bio"
                            name="bio"
                            as={Textarea}
                            placeholder="Tell us a little bit about yourself"
                            className="resize-none"
                          />
                          <ErrorMessage
                            name="bio"
                            component="div"
                            className="text-sm text-red-500"
                          />
                          <p className="text-xs text-muted-foreground">
                            Brief description for your profile. Maximum 160 characters.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6 space-y-4">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                      </>
                    ) : (
                      <>
                        <h4 className="text-md font-medium">Social Links</h4>
                      </>
                    )}
                    <div>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-10 w-full mb-1 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <label
                            htmlFor="urls.github"
                            className="flex items-center gap-2 text-sm font-medium"
                          >
                            <Github className="h-4 w-4" />
                            GitHub
                          </label>
                          <Field
                            id="urls.github"
                            name="urls.github"
                            as={Input}
                            placeholder="https://github.com/username"
                          />
                          <ErrorMessage
                            name="urls.github"
                            component="div"
                            className="text-sm text-red-500"
                          />
                        </>
                      )}
                    </div>
                    <div>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-10 w-full mb-1 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <label
                            htmlFor="urls.twitter"
                            className="flex items-center gap-2 text-sm font-medium"
                          >
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </label>
                          <Field
                            id="urls.twitter"
                            name="urls.twitter"
                            as={Input}
                            placeholder="https://twitter.com/username"
                          />
                          <ErrorMessage
                            name="urls.twitter"
                            component="div"
                            className="text-sm text-red-500"
                          />
                        </>
                      )}
                    </div>
                    <div>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-10 w-full mb-1 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <label
                            htmlFor="urls.linkedin"
                            className="flex items-center gap-2 text-sm font-medium"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </label>
                          <Field
                            id="urls.linkedin"
                            name="urls.linkedin"
                            as={Input}
                            placeholder="https://linkedin.com/in/username"
                          />
                          <ErrorMessage
                            name="urls.linkedin"
                            component="div"
                            className="text-sm text-red-500"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      className="theme-button-primary theme-transition"
                    >
                      {isPending || isSubmitting ? <Spinner /> : null}
                      Save Changes
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
