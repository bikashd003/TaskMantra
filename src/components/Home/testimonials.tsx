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
        <section id="testimonials" className="py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-extrabold text-center mb-16 gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">What Our Clients Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className='h-full'
                        >
                            <Card className='h-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 shadow-xl hover:shadow-2xl transition-all duration-300'>
                                <CardHeader>
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="w-16 h-16 border-2">
                                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                            <AvatarFallback className="text-2xl font-bold text-purple-500">{testimonial.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-white">{testimonial.name}</CardTitle>
                                            <CardDescription className="text-purple-400">{testimonial.role}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300 text-lg italic">&ldquo;{testimonial.content}&rdquo;</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

