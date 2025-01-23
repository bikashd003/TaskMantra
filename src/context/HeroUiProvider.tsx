"use client"
import React from 'react'

import { HeroUIProvider } from '@heroui/react'

export function NextUiProviders({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider>
            {children}
        </HeroUIProvider>
    )
}