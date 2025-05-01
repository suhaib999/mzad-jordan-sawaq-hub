
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    role: 'Regular Buyer',
    quote: "I've been using MzadKumSooq for months now and it's become my go-to marketplace. The auctions are exciting and I've found incredible deals!",
    avatar: '/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png'
  },
  {
    id: 2,
    name: 'Layla Mahmoud',
    role: 'Power Seller',
    quote: "As a seller, I appreciate how easy it is to list my products. The platform has connected me with buyers across Jordan and increased my sales significantly.",
    avatar: '/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png'
  },
  {
    id: 3,
    name: 'Omar Saleh',
    role: 'Collector',
    quote: "The variety of unique items I've found on MzadKumSooq is amazing. The bidding system is fair and the shipping options are convenient.",
    avatar: '/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png'
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-mzad-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who buy and sell on Jordan's premier marketplace
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-xl shadow-lg p-8">
            <div className="absolute -top-4 -left-4 text-mzad-primary opacity-20">
              <Quote size={48} />
            </div>
            
            <div className="mb-8">
              <p className="italic text-lg text-gray-700">"{testimonials[activeIndex].quote}"</p>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src={testimonials[activeIndex].avatar} 
                  alt={testimonials[activeIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-mzad-primary">{testimonials[activeIndex].name}</h4>
                <p className="text-sm text-gray-500">{testimonials[activeIndex].role}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              ←
            </Button>
            {testimonials.map((_, index) => (
              <Button 
                key={index}
                variant="ghost" 
                size="sm"
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 p-0 rounded-full ${index === activeIndex ? 'bg-mzad-primary' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <span className="sr-only">Testimonial {index + 1}</span>
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
