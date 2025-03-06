"use client"
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { toast } from 'sonner';
const OnboardingLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {

    const router=useRouter();

    const {data,error}=useQuery({
        queryKey:['onboarding'],
        queryFn:async()=>{
            const {data}=await axios.get('/api/onboarding/status');
            return data;
        }
    })
       // Show error toast if query fails
       useEffect(() => {
        if (error) {
            toast.error("Failed to check invites", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        }

    }, [error]);
    if(data?.hasCompletedOnboarding){
        router.push('/home')
    }

    return (
        <div>
            {children}
        </div>
    )
}
export default OnboardingLayout