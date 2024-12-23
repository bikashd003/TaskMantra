"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
    {
        name: "Alice Johnson",
        role: "Project Manager",
        content: "ProjectPro has revolutionized how we manage our projects. It's intuitive and powerful!",
        avatar: "/placeholder.svg?height=40&width=40"
    },
    {
        name: "Bob Smith",
        role: "Team Lead",
        content: "The collaboration features are top-notch. Our team productivity has skyrocketed.",
        avatar: "/placeholder.svg?height=40&width=40"
    },
    {
        name: "Carol Williams",
        role: "CEO",
        content: "ProjectPro provides invaluable insights that help us make informed decisions.",
        avatar: "/placeholder.svg?height=40&width=40"
    }
]

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className='h-full'
                        >
                            <Card className='h-full'>
                                <CardHeader>
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle>{testimonial.name}</CardTitle>
                                            <CardDescription>{testimonial.role}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{testimonial.content}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

