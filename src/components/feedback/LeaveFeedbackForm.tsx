
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createFeedback, FeedbackType } from '@/services/feedbackService';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  rating: z.enum(['positive', 'neutral', 'negative']),
  comment: z.string().min(3, "Comment must be at least 3 characters").max(500, "Comment must not exceed 500 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface LeaveFeedbackFormProps {
  sellerId: string;
  productId: string;
  transactionId: string;
  buyerId: string;
  onFeedbackSubmitted: () => void;
}

export const LeaveFeedbackForm = ({ 
  sellerId, 
  productId, 
  transactionId, 
  buyerId,
  onFeedbackSubmitted 
}: LeaveFeedbackFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 'positive',
      comment: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const feedback = await createFeedback({
        seller_id: sellerId,
        buyer_id: buyerId,
        product_id: productId,
        transaction_id: transactionId,
        rating: data.rating,
        comment: data.comment,
      });

      if (feedback) {
        toast.success("Feedback submitted successfully!");
        setIsOpen(false);
        onFeedbackSubmitted();
        form.reset();
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred while submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingOption = ({ value, label, icon }: { value: FeedbackType, label: string, icon: React.ReactNode }) => (
    <div 
      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
        form.watch('rating') === value 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => form.setValue('rating', value)}
    >
      {icon}
      <span className="mt-1 text-sm">{label}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Leave Feedback</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Feedback for the Seller</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={() => (
                <FormItem className="space-y-3">
                  <FormLabel>How would you rate your experience?</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <RatingOption 
                      value="positive" 
                      label="Positive" 
                      icon={<ThumbsUp className="h-6 w-6 text-green-600" />} 
                    />
                    <RatingOption 
                      value="neutral" 
                      label="Neutral" 
                      icon={<Minus className="h-6 w-6 text-gray-500" />} 
                    />
                    <RatingOption 
                      value="negative" 
                      label="Negative" 
                      icon={<ThumbsDown className="h-6 w-6 text-red-600" />} 
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add your comments about this transaction</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4} 
                      placeholder="Share details of your experience with this seller..."
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your feedback helps the community make informed decisions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
