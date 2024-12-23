"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, BarChart, Users, Clock } from 'lucide-react'

const features = [
    {
        icon: ClipboardList,
        title: "Task Management",
        description: "Organize and prioritize your tasks with ease."
    },
    {
        icon: BarChart,
        title: "Analytics",
        description: "Gain insights with powerful project analytics."
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Work seamlessly with your team members."
    },
    {
        icon: Clock,
        title: "Time Tracking",
        description: "Monitor time spent on tasks and projects."
    }
]

export default function Features() {
    return (
        <section id="features" className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <feature.icon className="w-10 h-10 mb-4 text-primary" />
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

