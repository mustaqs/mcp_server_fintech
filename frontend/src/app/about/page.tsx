'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            About MCP Fintech
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Our Mission
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Empowering financial innovation with secure, compliant technology.
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    MCP Fintech is a cutting-edge financial technology platform designed to meet the complex needs of modern financial institutions. Our platform combines robust security features with intuitive user interfaces to deliver a seamless experience for both financial professionals and their clients.
                  </p>
                  
                  <h3>Core Values</h3>
                  <ul>
                    <li><strong>Security:</strong> We prioritize the protection of sensitive financial data with industry-leading security measures.</li>
                    <li><strong>Compliance:</strong> Our platform is built with regulatory compliance at its core, ensuring adherence to financial regulations.</li>
                    <li><strong>Innovation:</strong> We continuously evolve our technology to address emerging challenges in the financial sector.</li>
                    <li><strong>Accessibility:</strong> We believe in making financial tools accessible to everyone, regardless of technical expertise.</li>
                  </ul>
                  
                  <h3>Our Technology</h3>
                  <p>
                    The MCP Fintech platform is built on a modern technology stack that ensures reliability, scalability, and performance. Our architecture includes:
                  </p>
                  <ul>
                    <li>Secure authentication and authorization systems</li>
                    <li>Real-time financial data processing</li>
                    <li>Advanced analytics and reporting tools</li>
                    <li>Seamless integration capabilities with existing financial systems</li>
                    <li>Comprehensive audit logging and monitoring</li>
                  </ul>
                  
                  <h3>Join Us</h3>
                  <p>
                    Whether you're a financial institution looking to modernize your technology infrastructure or a developer interested in building on our platform, we invite you to join the MCP Fintech ecosystem.
                  </p>
                  
                  <div className="mt-6">
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      Get Started Today
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Team Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Our Team
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Meet the experts behind MCP Fintech.
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="aspect-w-3 aspect-h-2">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sarah Johnson</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Chief Executive Officer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6 sm:mt-0">
                    <div className="aspect-w-3 aspect-h-2">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Michael Chen</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Chief Technology Officer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6 sm:mt-0">
                    <div className="aspect-w-3 aspect-h-2">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Olivia Rodriguez</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Chief Financial Officer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Contact Us
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Get in touch with our team.
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        autoComplete="given-name"
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        autoComplete="family-name"
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      ></textarea>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
