'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUploader from '@/components/Global/FileUploader';
import { LoadingSpinner } from '@/components/Global/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import { Send, Camera, CheckCircle } from 'lucide-react';
import axios from 'axios';

type FeedbackType = 'terrible' | 'bad' | 'medium' | 'good' | 'excellent';

interface FeedbackData {
  feedbackType: FeedbackType;
  comment: string;
  screenshot: string | null;
  userId: string;
}

export default function Page() {
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<FeedbackType>('medium');
  const [comment, setComment] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [resetUploader, setResetUploader] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const session = useAuth().session;

  const { mutate, isPending } = useMutation<void, Error, FeedbackData>({
    mutationFn: async (data: FeedbackData) => {
      await axios.post('/api/feedback', data);
    },
    onError: error => {
      toast.error(error.message);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Feedback submitted successfully');

      // Reset form after showing success animation
      setTimeout(() => {
        setComment('');
        setSelectedFeedbackType('medium');
        setScreenshot(null);
        setResetUploader(prev => !prev);
        setIsSubmitted(false);
      }, 2000);
    },
  });

  const feedbackTypes: {
    value: FeedbackType;
    emoji: string;
    color: string;
    bgColor: string;
    label: string;
  }[] = [
    {
      value: 'terrible',
      emoji: '😫',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      label: 'Terrible',
    },
    {
      value: 'bad',
      emoji: '😔',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      label: 'Bad',
    },
    {
      value: 'medium',
      emoji: '😐',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      label: 'Okay',
    },
    {
      value: 'good',
      emoji: '🙂',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      label: 'Good',
    },
    {
      value: 'excellent',
      emoji: '🤗',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      label: 'Excellent',
    },
  ];

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
    e.preventDefault();
    if (!isPending) {
      mutate({
        feedbackType: selectedFeedbackType,
        comment,
        screenshot,
        userId: session?.user.id,
      });
    }
  };
  // Show success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-grid-pattern theme-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="theme-surface-elevated rounded-2xl p-8 max-w-md w-full text-center theme-shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold theme-text-primary mb-2"
          >
            Thank You!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="theme-text-secondary"
          >
            Your feedback has been submitted successfully. We appreciate your input!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-grid-pattern theme-surface flex items-center justify-center p-4 h-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <motion.form
          onSubmit={handleSubmit}
          className="theme-surface-elevated rounded-2xl p-8 theme-shadow-lg glass hover-reveal"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header Section */}
          <motion.div
            className="text-center mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold theme-text-primary mb-3">How are you feeling?</h1>
          </motion.div>

          {/* Feedback Type Selection */}
          <motion.div
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-center gap-3 flex-wrap">
              {feedbackTypes.map(({ value, emoji, color, bgColor }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedFeedbackType(value)}
                  className={`relative text-2xl p-4 rounded-full transition-all
                ${
                  selectedFeedbackType === value
                    ? `${bgColor} scale-110`
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                >
                  {emoji}
                  {selectedFeedbackType === value && (
                    <>
                      <div className={`absolute inset-0 animate-ping ${bgColor} rounded-full`} />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                        <div className="relative">
                          <div
                            className={`${color} ${bgColor} text-xs px-3 py-1 rounded-full capitalize`}
                          >
                            {value}
                          </div>
                          <div
                            className={`absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent ${color}`}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Comment Section */}
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <label className="block text-sm font-medium theme-text-primary mb-3">
              Tell us more about your experience
            </label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts, suggestions, or any issues you encountered..."
              className="min-h-[120px] resize-none theme-input theme-focus theme-transition"
              disabled={isPending}
            />
          </motion.div>

          {/* File Upload Section */}
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <label className="block text-sm font-medium theme-text-primary mb-3">
              <Camera className="w-4 h-4 inline mr-2" />
              Attach a screenshot (optional)
            </label>
            <div className="theme-surface rounded-lg p-4 border-2 border-dashed theme-border">
              <FileUploader
                onChange={handleScreenshotChange}
                multiple={false}
                reset={resetUploader}
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl theme-transition btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" color="secondary" />
                  <span>Sending feedback...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </div>
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Floating Elements for Visual Interest */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500/20 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-pink-500/20 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-500/30 rounded-full"
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 2,
          }}
        />
      </motion.div>
    </div>
  );
}
