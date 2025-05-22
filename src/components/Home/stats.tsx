'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, Clock, Shield } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: 40,
    suffix: '%',
    label: 'Faster Project Delivery',
    description: 'Reduce time-to-market with AI-powered insights',
    color: 'text-green-500',
  },
  {
    icon: Clock,
    value: 25,
    suffix: 'hrs',
    label: 'Time Saved Monthly',
    description: 'Per team member through automation',
    color: 'text-blue-500',
  },
  {
    icon: Shield,
    value: 99.9,
    suffix: '%',
    label: 'Uptime SLA',
    description: 'Enterprise-grade reliability & security',
    color: 'text-orange-500',
  },
];

function AnimatedCounter({
  value,
  suffix = '',
  duration = 2000,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {Math.floor(count)}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why 50,000+ Teams Choose{' '}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-white to-green-500">
              TaskMantra
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            From Indian startups to global enterprises, see the measurable impact TaskMantra
            delivers for project management, team collaboration, and business growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 glow-on-hover h-full">
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-background to-card mb-6 ${stat.color}`}
                  >
                    <stat.icon className="w-8 h-8" />
                  </div>

                  <div className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>

                  <h3 className="text-lg font-semibold mb-2 text-foreground">{stat.label}</h3>

                  <p className="text-sm text-foreground/70">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
