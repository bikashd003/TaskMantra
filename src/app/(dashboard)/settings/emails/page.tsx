'use client'

import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Mail, Plus, Settings, Tags } from 'lucide-react'

const emailTemplateSchema = z.object({
  name: z.string().min(2, { message: "Template name must be at least 2 characters." }),
  subject: z.string().min(2, { message: "Subject is required." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  category: z.enum(["task", "member", "notification"]),
})

const emailTemplates = [
  {
    id: 1,
    name: "Task Assignment",
    subject: "New Task Assigned: {{task_name}}",
    category: "task",
    lastModified: "2024-02-22",
  },
  {
    id: 2,
    name: "Welcome Email",
    subject: "Welcome to TaskMantra, {{user_name}}!",
    category: "member",
    lastModified: "2024-02-21",
  },
  {
    id: 3,
    name: "Due Date Reminder",
    subject: "Task Due Soon: {{task_name}}",
    category: "notification",
    lastModified: "2024-02-20",
  },
]

const variables = {
  user: ["user_name", "user_email", "user_role"],
  task: ["task_name", "task_description", "task_due_date", "task_status"],
  project: ["project_name", "project_description", "project_deadline"],
}

export default function EmailTemplates() {
  const form = useForm<z.infer<typeof emailTemplateSchema>>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      category: "task",
    },
  })

  function onSubmit(values: z.infer<typeof emailTemplateSchema>) {
    console.log(values)
    // TODO: Implement template creation/update logic
  }

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Customize your email notifications and templates
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Templates List */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Manage and customize your email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="task">Task</TabsTrigger>
                <TabsTrigger value="member">Member</TabsTrigger>
                <TabsTrigger value="notification">Notification</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {template.subject}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{template.lastModified}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Template Variables
            </CardTitle>
            <CardDescription>
              Available variables for your templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">User Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {variables.user.map((variable) => (
                    <Badge key={variable} variant="secondary" className="cursor-pointer">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Task Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {variables.task.map((variable) => (
                    <Badge key={variable} variant="secondary" className="cursor-pointer">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Project Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {variables.project.map((variable) => (
                    <Badge key={variable} variant="secondary" className="cursor-pointer">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Form */}
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Edit Template</CardTitle>
            <CardDescription>
              Create or modify an email template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Task Assignment Notification" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="task">Task</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email subject line" {...field} />
                      </FormControl>
                      <FormDescription>
                        You can use variables like {"{{user_name}}"} in the subject
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your email content here..."
                          className="min-h-[300px] font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Use the variables from the right panel in your content
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Preview</Button>
                  <Button type="submit">Save Template</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
