import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Integration() {
    const tools = [
        { name: 'GitHub', logo: '/logos/github.svg' },
        { name: 'Slack', logo: '/logos/slack.svg' },
        { name: 'Jira', logo: '/logos/jira.svg' },
        { name: 'Notion', logo: '/logos/notion.svg' },
        // Add more tools as needed
    ];

    return (
        <div className="container mx-auto text-center">
            <motion.h2 
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                Seamless Integrations
            </motion.h2>
            <motion.p 
                className="text-lg text-white/60 mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                Connect with your favorite tools
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {tools.map((tool, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="glass-effect rounded-xl p-6 flex items-center justify-center"
                    >
                        <Image
                            src={tool.logo}
                            alt={tool.name}
                            width={40}
                            height={40}
                        />
                        <span className="ml-3 font-medium">{tool.name}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}