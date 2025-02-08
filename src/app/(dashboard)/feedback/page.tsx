'use client'
import React, { useState } from 'react'
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import FileUploader from '@/components/Global/FileUploader'
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';

type FeedbackType = 'terrible' | 'bad' | 'medium' | 'good' | 'excellent'

interface FeedbackData {
    feedbackType: FeedbackType;
    comment: string;
    screenshot: string | null;
    userId:string
}

export default function Page() {
    const [selectedFeedbackType, setSelectedFeedbackType] = useState<FeedbackType>('medium')
    const [comment, setComment] = useState('')
    const [screenshot, setScreenshot] = useState<string | null>(null)
    const [resetUploader, setResetUploader] = useState(false)
    const session = useAuth().session;

    const { mutate, isPending } = useMutation<void, Error, FeedbackData>({
        mutationFn: async (data: FeedbackData) => {
          await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success("Feedback submitted successfully")
            setComment('')
            setSelectedFeedbackType('medium')
            setScreenshot(null)
            setResetUploader(prev => !prev)
        }
    })

    const feedbackTypes: { value: FeedbackType; emoji: string }[] = [
        { value: 'terrible', emoji: '😫' },
        { value: 'bad', emoji: '😔' },
        { value: 'medium', emoji: '😐' },
        { value: 'good', emoji: '🙂' },
        { value: 'excellent', emoji: '🤗' },
    ]

    const handleScreenshotChange = (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setScreenshot(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isPending) {
            mutate({ 
                feedbackType: selectedFeedbackType, 
                comment, 
                screenshot,
                userId: session?.user.id 
            })
        }
    }
    return (
        <form onSubmit={handleSubmit} className='mx-auto max-w-md w-full p-6 border rounded-lg'>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">How are you feeling?</h2>
                <p className="text-muted-foreground">
                    Your input is valuable in helping us better understand your needs and tailor our service accordingly.
                </p>
            </div>

            <div className="flex justify-center gap-4 mb-16">
                {feedbackTypes.map(({ value, emoji }) => (
                    <button
                        key={value}
                        onClick={() => setSelectedFeedbackType(value)}
                        className={`relative text-2xl p-4 rounded-full transition-all
                ${selectedFeedbackType === value
                                ? 'bg-emerald-100 scale-110'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {emoji}
                        {selectedFeedbackType === value && (
                            <>
                                <div className="absolute inset-0 animate-ping bg-emerald-100 rounded-full" />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                                    <div className="relative">
                                        <div className="bg-zinc-900 text-white text-xs px-3 py-1 rounded-full capitalize">
                                            {value}
                                        </div>
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-900" />
                                    </div>
                                </div>
                            </>
                        )}
                    </button>
                ))}
            </div>

            <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a Comment..."
                className="mb-6 resize-none"
            />

            <label className="block mb-6">
                <FileUploader onChange={handleScreenshotChange} multiple={false} reset={resetUploader} />
            </label>

            <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={isPending}
            >
                {isPending ? 'Sending...' : 'Submit Now'}
            </Button>
        </form>
    )
}
