function BlogGrid() {
  // Sample blog data - in a real app, this would come from an API
  const blogs = [
    {
      id: 1,
      title: 'Introduction to Llama 360',
      excerpt: 'Learn how Llama 360 can transform your banking data operations with its advanced AI capabilities.',
      thumbnail: 'https://via.placeholder.com/320x180?text=Blog+1',
      date: 'March 15, 2023',
      author: 'Alex Johnson',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How AI Systems Transform Data Pipelines',
      excerpt: 'Discover the latest innovations in AI-powered data pipeline management and how they're revolutionizing the banking sector.',
      thumbnail: 'https://via.placeholder.com/320x180?text=Blog+2',
      date: 'April 22, 2023',
      author: 'Sarah Williams',
      readTime: '8 min read'
    },
    {
      id: 3,
      title: 'Banking Data Product Use Cases',
      excerpt: 'Explore real-world applications of data products in retail banking and how they improve customer experiences.',
      thumbnail: 'https://via.placeholder.com/320x180?text=Blog+3',
      date: 'May 10, 2023',
      author: 'Michael Chen',
      readTime: '6 min read'
    },
  ]

  return (
    <section id="blogs" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-3xl font-poppins font-bold text-gray-900">Featured Blogs</h2>
        <p className="mb-8 text-center text-lg text-gray-600">
          Learn more about Llama 360 through these informative articles.
        </p>
        
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl">
              <div className="aspect-w-16 aspect-h-9 relative">
                <img 
                  src={blog.thumbnail} 
                  alt={blog.title} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{blog.date}</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">By {blog.author}</span>
                  <button 
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    onClick={() => alert('Full blog post would open here')}
                  >
                    Read More →
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
