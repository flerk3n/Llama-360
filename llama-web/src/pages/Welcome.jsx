import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import BlogGrid from '../components/BlogGrid'
import TestimonialCarousel from '../components/TestimonialCarousel'
import ContactCard from '../components/ContactCard'
import DataBuilder from '../components/DataBuilder'

function Welcome({ user }) {
  const launchBuilderRef = useRef(null)
  const [showDataBuilder, setShowDataBuilder] = useState(false)

  // Function to handle scrolling animation for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'translate-y-10')
          }
        })
      },
      { threshold: 0.1 }
    )

    // Select all sections to animate
    document.querySelectorAll('section').forEach((section) => {
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10')
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleLaunchBuilder = () => {
    // Open the DataBuilder component instead of a new tab
    setShowDataBuilder(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="glass relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center p-4 py-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src="/images/logohome.png" 
                alt="Llama 360 Logo" 
                className="w-24 h-24 object-contain"
              />
              <h1 className="text-5xl font-bold text-white">
                Llama 360
              </h1>
            </div>

            <p className="text-xl text-gray-300 max-w-2xl mb-8">
              Build sophisticated data products and pipelines for retail banking with
              our advanced AI system.
            </p>

            <button
              ref={launchBuilderRef}
              onClick={handleLaunchBuilder}
              className="glass-button px-6 py-3 text-lg rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              Launch the Data Builder
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-6">
        <div className="glass mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogGrid />
          <TestimonialCarousel />
          <ContactCard />
        </div>
      </div>

      {/* Footer */}
      <footer className="glass mt-4 py-6 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-gray-300">© {new Date().getFullYear()} Llama 360. All rights reserved.</p>
        </div>
      </footer>

      {/* Data Builder Modal */}
      {showDataBuilder && <DataBuilder onClose={() => setShowDataBuilder(false)} />}
    </div>
  )
}

export default Welcome
