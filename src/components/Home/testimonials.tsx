'use client';

import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef, useState } from 'react';
import { Quote, Star, MapPin, Users, CheckCircle, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Engineering Manager',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India',
    content:
      'TaskMantra helped our team coordinate across Bangalore, Delhi and Mumbai offices. We cut project delivery time by 35% and saw immediate improvement in team communication. The sprint planning features are particularly valuable for our agile workflow.',
    avatar: '/placeholder.svg?height=40&width=40',
    rating: 5,
    projectsCompleted: 42,
    teamSize: 18,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Founder & CEO',
    company: 'GrowthBox Technologies',
    location: 'Mumbai, India',
    content:
      'As a growing startup with limited resources, TaskMantra provided exactly what we needed without breaking our budget. The intuitive interface meant minimal training for new hires, and the mobile app lets me stay connected even during my frequent travels to client sites.',
    avatar: '/placeholder.svg?height=40&width=40',
    rating: 4,
    projectsCompleted: 23,
    teamSize: 12,
  },
  {
    name: 'Dr. Anita Desai',
    role: 'IT Director',
    company: 'National Health Institute',
    location: 'New Delhi, India',
    content:
      "In healthcare, documentation and compliance are critical. TaskMantra's audit logs and permission controls give us the security we need, while the customizable workflows adapt to our unique processes. Implementation was smooth with excellent support from the team.",
    avatar: '/placeholder.svg?height=40&width=40',
    rating: 5,
    projectsCompleted: 31,
    teamSize: 22,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section ref={ref} id="testimonials" className="py-32 relative overflow-hidden">
      {/* Floating background elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 bg-green-500/10 rounded-full blur-lg"
        animate={{
          y: [0, 15, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-green-500/20 rounded-full mb-6"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 165, 0, 0.3)',
                '0 0 30px rgba(0, 255, 0, 0.3)',
                '0 0 20px rgba(255, 165, 0, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-2xl">🇮🇳</span>
            <span className="text-sm font-semibold text-foreground">
              Trusted by Indian Enterprises
            </span>
          </motion.div>

          <h2 className="text-5xl font-extrabold mb-4 gradient-text bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-white to-green-500">
            Success Stories from India
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            From startups in Mumbai to enterprises in Bangalore, see how TaskMantra is transforming
            project management across India's diverse business landscape.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={
                isInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 50, rotateY: -15 }
              }
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -12, scale: 1.03, rotateY: 5 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className="h-full group perspective-1000"
            >
              <Card className="h-full relative overflow-hidden bg-card/40 backdrop-blur-lg border border-border/40 shadow-2xl hover:shadow-3xl transition-all duration-700 hover-reveal glow-on-hover transform-gpu">
                {/* Indian flag colors accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500" />

                {/* Glassmorphism overlay with Indian theme */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-white/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Floating elements */}
                <motion.div
                  className="absolute top-4 right-4 opacity-20 group-hover:opacity-60 transition-opacity duration-300"
                  animate={
                    hoveredCard === index ? { rotate: 360, scale: 1.2 } : { rotate: 0, scale: 1 }
                  }
                  transition={{ duration: 0.8 }}
                >
                  <Quote className="w-8 h-8 text-orange-500" />
                </motion.div>

                {/* Rating stars */}
                <div className="absolute top-4 left-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + i * 0.1 }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <CardHeader className="relative z-10 pt-12">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Avatar className="w-20 h-20 border-3 border-gradient-to-r from-orange-500 to-green-500 shadow-xl ring-2 ring-orange-500/20">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="text-2xl font-bold text-white bg-gradient-to-br from-orange-500 to-green-500">
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors duration-300">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-orange-600/80 font-semibold text-sm">
                        {testimonial.role}
                      </CardDescription>
                      <CardDescription className="text-green-600/80 font-medium text-xs">
                        {testimonial.company}
                      </CardDescription>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-foreground/60" />
                        <span className="text-xs text-foreground/60">{testimonial.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <motion.p
                    className="text-foreground/85 text-base leading-relaxed font-medium"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    &ldquo;{testimonial.content}&rdquo;
                  </motion.p>

                  {/* Stats section */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                    <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">
                          {testimonial.projectsCompleted}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/60">Projects Completed</p>
                    </motion.div>
                    <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-2xl font-bold text-blue-600">
                          {testimonial.teamSize}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/60">Team Members</p>
                    </motion.div>
                  </div>
                </CardContent>

                {/* Animated border with Indian flag colors */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/20 via-white/10 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-sm"
                  animate={hoveredCard === index ? { scale: 1.02 } : { scale: 1 }}
                />

                {/* Performance indicator */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={hoveredCard === index ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
