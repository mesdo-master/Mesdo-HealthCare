import React from 'react';

const HomePage = () => {
  return (
    <div className="bg-[#0f0f0f] font-sans text-gray-100 pl-20 ">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-[#1f1c2c] to-[#928dab] text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
            Elevate Your Professional Journey
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 text-gray-300">
            Connect with industry leaders, unlock career opportunities, and build a network that propels your success.
          </p>
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white py-4 px-10 rounded-full shadow-xl hover:shadow-cyan-500/40 transition duration-300 transform hover:scale-105">
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Why Choose Mesdo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                iconColor: 'text-cyan-400',
                title: 'Global Connections',
                desc: 'Expand your network and collaborate with professionals from around the world.',
                path: 'M3 7h18M3 12h18M3 17h18',
              },
              {
                iconColor: 'text-purple-400',
                title: 'Career Growth',
                desc: 'Access tools and resources that empower you to advance in your career.',
                path: 'M11 19l-7-7 7-7',
              },
              {
                iconColor: 'text-yellow-400',
                title: 'Collaborate & Learn',
                desc: 'Engage with industry experts, share insights, and grow together.',
                path: 'M12 8v4l3 3',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-8 bg-[#222] rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition duration-300 text-center transform hover:-translate-y-2"
              >
                <div className="mb-6">
                  <svg className={`w-14 h-14 mx-auto ${item.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.path}></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#121212]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                quote: 'Mesdo transformed my career by connecting me with mentors who guided me to new heights.',
                name: 'Sarah Thompson',
                role: 'Senior Developer',
                img: 'https://randomuser.me/api/portraits/women/1.jpg',
              },
              {
                quote: 'The networking opportunities on Mesdo are unmatched. I found my dream job through a connection here!',
                name: 'James Rodriguez',
                role: 'Marketing Director',
                img: 'https://randomuser.me/api/portraits/men/2.jpg',
              },
            ].map((testimonial, index) => (
              <div key={index} className="p-8 bg-[#1e1e1e] rounded-xl shadow-md hover:shadow-cyan-500/10 transition">
                <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.img}
                    alt="User"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#1f1c2c] to-[#928dab] text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Join Mesdo Today</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90 text-gray-200">
            Start building meaningful connections and take your professional journey to the next level.
          </p>
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white py-4 px-10 rounded-full shadow-xl hover:shadow-cyan-400/40 transition duration-300 transform hover:scale-105">
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#1a1a1a] py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">Mesdo</h3>
              <p className="text-gray-400">
                Empowering professionals to connect, learn, and grow together.
              </p>
            </div>
            {[
              {
                title: 'Links',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                ],
              },
              {
                title: 'Support',
                links: [
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Terms', href: '#terms' },
                  { label: 'Privacy', href: '#privacy' },
                ],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-lg font-semibold mb-6 text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} className="text-gray-400 hover:text-cyan-400 transition">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.56v14.88A4.56 4.56 0 0 1 19.44 24H4.56A4.56 4.56 0 0 1 0 19.44V4.56A4.56 4.56 0 0 1 4.56 0h14.88A4.56 4.56 0 0 1 24 4.56zM9.6 18.72v-7.92H6.96v7.92H9.6zm0-9.6c.96 0 1.68-.72 1.68-1.68s-.72-1.68-1.68-1.68-1.68.72-1.68 1.68.72 1.68 1.68 1.68zm9.6 9.6v-4.56c0-2.4-1.44-3.6-3.36-3.6-1.44 0-2.4.72-2.88 1.44v-1.2h-2.64v7.92h2.64v-4.56c0-.72.24-1.44 1.2-1.44 1.2 0 1.44.72 1.44 1.68v4.32h2.64z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.04 0H.96A.96.96 0 0 0 0 .96v22.08c0 .528.432.96.96.96h12.48v-9.6h-3.36v-3.84h3.36V8.16c0-3.36 2.16-5.28 5.28-5.28 1.44 0 2.88.24 2.88.24v3.36h-1.68c-1.68 0-2.16.816-2.16 2.16v2.88h4.32l-.72 3.84h-3.6v9.6h7.2a.96.96 0 0 0 .96-.96V.96A.96.96 0 0 0 23.04 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-12 text-sm">
            &copy; 2025 Mesdo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
