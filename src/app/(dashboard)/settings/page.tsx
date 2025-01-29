import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SettingsLayout } from "@/components/Settings/settings-layout"
import { Button } from "@/components/ui/button"
import { InfoIcon as InfoCircled } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
      <SettingsLayout>
          <div className="space-y-6 w-full h-full">
              <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground">
                      Manage your account settings and preferences.
                  </p>
              </div>
              <Separator />
              <div className="grid gap-6">
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              My Notifications
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                  <InfoCircled className="h-4 w-4" />
                              </Button>
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="space-y-4">
                              <h4 className="text-sm font-medium">Notify me when...</h4>
                              <div className="grid gap-3">
                                  {[
                                      "Daily productivity update",
                                      "New event created",
                                      "When added on new team"
                                  ].map((label) => (
                                      <label
                                          key={label}
                                          className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                                      >
                                          <Checkbox id={label} />
                                          <span className="text-sm font-medium">{label}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-4">
                              {[
                                  {
                                      title: "Mobile push notifications",
                                      description: "Receive push notification whenever your organisation requires your attentions"
                                  },
                                  {
                                      title: "Desktop Notification",
                                      description: "Receive desktop notification whenever your organisation requires your attentions"
                                  },
                                  {
                                      title: "Email Notification",
                                      description: "Receive email whenever your organisation requires your attentions"
                                  }
                              ].map(({ title, description }) => (
                                  <div
                                      key={title}
                                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                                  >
                                      <div className="space-y-0.5">
                                          <h4 className="text-sm font-medium">{title}</h4>
                                          <p className="text-sm text-muted-foreground">
                                              {description}
                                          </p>
                                      </div>
                                      <Switch />
                                  </div>
                              ))}
                          </div>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader>
                          <CardTitle>My Settings</CardTitle>
                          <CardDescription>
                              Customize your experience and security preferences
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {[
                              {
                                  title: "Appearance",
                                  description: "Customize how you theams looks on your device.",
                                  control: (
                                      <Select defaultValue="light">
                                          <SelectTrigger className="w-[180px]">
                                              <SelectValue placeholder="Select a theme" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="light">Light</SelectItem>
                                              <SelectItem value="dark">Dark</SelectItem>
                                              <SelectItem value="system">System</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  )
                              },
                              {
                                  title: "Two-factor authentication",
                                  description: "Keep your account secure by enabling 2FA via SMS or using a temporary one-time passcode (TOTP).",
                                  control: <Switch />
                              },
                              {
                                  title: "Language",
                                  description: "Customize how you theams looks on your device.",
                                  control: (
                                      <Select defaultValue="english">
                                          <SelectTrigger className="w-[180px]">
                                              <SelectValue placeholder="Select a language" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="english">English</SelectItem>
                                              <SelectItem value="spanish">Spanish</SelectItem>
                                              <SelectItem value="french">French</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  )
                              }
                          ].map(({ title, description, control }) => (
                              <div
                                  key={title}
                                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                              >
                                  <div className="space-y-0.5">
                                      <h4 className="text-sm font-medium">{title}</h4>
                                      <p className="text-sm text-muted-foreground">
                                          {description}
                                      </p>
                                  </div>
                                  {control}
                              </div>
                          ))}
                      </CardContent>
                  </Card>
              </div>
          </div>
      </SettingsLayout>
  )
}

