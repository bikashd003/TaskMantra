'use client'

import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Github, Linkedin, Twitter } from 'lucide-react'
import axios from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Spinner } from '@heroui/react'
import { Skeleton } from '@heroui/skeleton'

const profileFormSchema = Yup.object().shape({
  username: Yup.string().min(2, "Username must be at least 2 characters.").required("Username is required."),
  email: Yup.string().email("Please enter a valid email address.").required("Email is required."),
  bio: Yup.string().max(160, "Bio must not exceed 160 characters."),
  urls: Yup.object().shape({
    github: Yup.string().url("Please enter a valid URL.").nullable().notRequired(),
    twitter: Yup.string().url("Please enter a valid URL.").nullable().notRequired(),
    linkedin: Yup.string().url("Please enter a valid URL.").nullable().notRequired(),
  }),
});

export default function ProfileSettings() {
  const { data: profileSettings, isLoading } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/settings/profile')
      return data
    },
  })

  const profile = profileSettings?.profile

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: any) => {
      await axios.patch('/api/settings/profile', values)
      return values
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success('Profile Updated')
    },
  })

  const initialValues = {
    username: profile?.username || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    urls: {
      github: profile?.urls?.github || '',
      twitter: profile?.urls?.twitter || '',
      linkedin: profile?.urls?.linkedin || '',
    },
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium">Profile Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>
      <Separator />

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Upload a profile picture to personalize your account
                  </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            )}
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-56" />
                </>
              ) : (
                <>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Picture
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, at least 400x400px
                    </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and public profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={profileFormSchema}
              onSubmit={async (values) => {
                await mutateAsync(values)
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="space-y-4">
                    <div>
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
                    </div>

                    <div>
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
                    </div>

                    <div>
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
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-md font-medium">Social Links</h4>
                    <div>
                      <label htmlFor="urls.github" className="flex items-center gap-2 text-sm font-medium">
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
                    </div>
                    <div>
                      <label htmlFor="urls.twitter" className="flex items-center gap-2 text-sm font-medium">
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
                    </div>
                    <div>
                      <label htmlFor="urls.linkedin" className="flex items-center gap-2 text-sm font-medium">
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
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
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
  )
}
