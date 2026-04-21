import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Food Pharmer',
      image: null, // Placeholder for image
    },
    {
      id: 2,
      name: 'Soha Ali Khan',
      image: null,
    },
    {
      id: 3,
      name: 'Trak',
      image: null,
    },
  ];

  return (
    <div className="bg-white py-8 px-4">
      {/* Title */}
      <h2 className="text-2xl font-bold text-black mb-6">See why people chose Native</h2>

      {/* Horizontal Scrollable Testimonial Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="min-w-[200px] rounded-xl overflow-hidden relative"
          >
            {/* Video/Image Placeholder */}
            <div className="w-full h-64 bg-gray-300 rounded-xl flex items-center justify-center">
              <span className="text-gray-500 text-xs">Testimonial Video</span>
            </div>

            {/* Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white font-medium text-sm">{testimonial.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;

