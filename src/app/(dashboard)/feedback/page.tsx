'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Mood = 'terrible' | 'bad' | 'medium' | 'good' | 'excellent'

export default function Page() {
    const [selectedMood, setSelectedMood] = useState<Mood>('medium')
    const [comment, setComment] = useState('')

    const moods: { value: Mood; emoji: string }[] = [
        { value: 'terrible', emoji: '😫' },
        { value: 'bad', emoji: '😔' },
        { value: 'medium', emoji: '😐' },
        { value: 'good', emoji: '🙂' },
        { value: 'excellent', emoji: '🤗' },
    ]

    const handleSubmit = () => {
        // console.log({ mood: selectedMood, comment })
    }

    return (
        <div className='mx-auto w-full max-w-md p-6 border mt-[50vh] -translate-y-1/2'>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <div className="w-4 h-4 bg-primary rounded-full" />
                    </div>
                    <span className="font-semibold">Feedback</span>
                </div>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">How are you feeling?</h2>
                <p className="text-muted-foreground">
                    Your input is valuable in helping us better understand your needs and tailor our service accordingly.
                </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
                {moods.map(({ value, emoji }) => (
                    <button
                        key={value}
                        onClick={() => setSelectedMood(value)}
                        className={`relative text-2xl p-4 rounded-full transition-all
                ${selectedMood === value
                                ? 'bg-emerald-100 scale-110'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {emoji}
                        {selectedMood === value && (
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
                className="mb-6"
            />

            <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
                Submit Now
            </Button>


        </div>
    )
}

