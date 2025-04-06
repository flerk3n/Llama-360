import { useState, useEffect } from 'react'

function TestimonialCarousel() {
  const testimonials = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Data Scientist at FinTech Corp',
      testimonial: 'Llama 360 revolutionized how we create banking data pipelines. What used to take weeks now takes hours.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'CTO at DataFlow Solutions',
      testimonial: 'This tool has incredible potential for financial data processing. The AI-based approach handles complex data transformations elegantly.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Banking Analytics Lead',
      testimonial: 'The intuitive interface and powerful backend make Llama 360 an essential tool for modern banking data products. Highly recommended!',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <section id="testimonials" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-3xl font-poppins font-bold text-white">What Users Say</h2>
        
        <div className="relative mx-auto max-w-4xl">
          {/* Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="glass glass-hover rounded-2xl p-6 md:p-8">
                    <div className="mb-6 flex items-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="mr-4 h-14 w-14 rounded-full object-cover ring-2 ring-white/20"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                        <p className="text-sm text-gray-300">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-lg italic text-gray-300">"{testimonial.testimonial}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialCarousel
