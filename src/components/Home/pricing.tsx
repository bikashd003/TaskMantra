"use client"

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
    {
        name: "Basic",
        price: "$9",
        features: ["5 Projects", "2 Team Members", "Basic Analytics"]
    },
    {
        name: "Pro",
        price: "$29",
        features: ["Unlimited Projects", "10 Team Members", "Advanced Analytics", "Priority Support"]
    },
    {
        name: "Enterprise",
        price: "Custom",
        features: ["Unlimited Everything", "24/7 Support", "Dedicated Account Manager"]
    }
]

export default function Pricing() {
    return (
        <section id="pricing" className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex}>{feature}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Choose Plan</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

