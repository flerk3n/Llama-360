function BlogGrid() {
  // Sample blog data - in a real app, this would come from an API
  const blogs = [
    {
      id: 1,
      title: 'Introduction to Llama 360',
      excerpt: 'Learn how Llama 360 can transform your banking data operations with its advanced AI capabilities.',
      thumbnail: '/blog/intro-llama360.jpg',
      date: 'March 15, 2023',
      author: 'Alex Johnson',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How AI Systems Transform Data Pipelines',
      excerpt: 'Discover the latest innovations in AI-powered data pipeline management and how they are revolutionizing the banking sector.',
      thumbnail: '/blog/ai-transform.jpg',
      date: 'April 22, 2023',
      author: 'Sarah Williams',
      readTime: '8 min read'
    },
    {
      id: 3,
      title: 'Banking Data Product Use Cases',
      excerpt: 'Explore real-world applications of data products in retail banking and how they improve customer experiences.',
      thumbnail: '/blog/banking-use-cases.jpg',
      date: 'May 10, 2023',
      author: 'Michael Chen',
      readTime: '6 min read'
    },
  ]

  return (
    <section id="blogs" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-3xl font-poppins font-bold text-white">Featured Blogs</h2>
        <p className="mb-8 text-center text-lg text-gray-300">
          Learn more about Llama 360 through these informative articles.
        </p>
        
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="glass glass-hover overflow-hidden rounded-2xl transition-all">
              <div className="aspect-w-16 aspect-h-9 relative">
                <img 
                  src={blog.thumbnail} 
                  alt={blog.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://source.unsplash.com/800x450/?technology,banking,${blog.id}`;
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span>{blog.date}</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{blog.title}</h3>
                <p className="text-gray-300 mb-4">{blog.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">By {blog.author}</span>
                  <button 
                    className="glass-button text-sm px-4 py-2 rounded-md"
                    onClick={() => alert('Full blog post would open here')}
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogGrid 