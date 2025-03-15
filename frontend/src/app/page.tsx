import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Model Context Protocol</span>
            <span className="block text-primary-600 dark:text-primary-400">Fintech Server</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            A comprehensive financial technology platform implementing the Model Context Protocol (MCP) for enhanced security, transparency, and regulatory compliance in financial transactions and data management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              MCP Core Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our platform implements the essential components of the Model Context Protocol to ensure secure, transparent, and compliant financial operations.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Introduction to MCP */}
            <div className="col-span-full mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6 shadow-sm dark:border-primary-900 dark:bg-primary-950">
              <h3 className="text-xl font-bold text-primary-800 dark:text-primary-300">What is Model Context Protocol?</h3>
              <p className="mt-2 text-primary-700 dark:text-primary-400">
                Model Context Protocol (MCP) is a standardized framework for financial institutions that ensures all transactions and data operations maintain complete contextual information throughout their lifecycle. This enables enhanced security, regulatory compliance, and operational transparency while reducing fraud and simplifying audits.
              </p>
            </div>
            {/* Feature 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Context-Aware Transactions</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                MCP's contextual transaction framework ensures every financial operation carries complete metadata about its purpose, origin, and authorization, enabling better fraud detection and regulatory compliance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Immutable Audit Trails</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Our implementation of MCP's cryptographically secured audit trails provides tamper-proof records of all financial activities, ensuring data integrity and simplifying regulatory reporting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Regulatory Compliance</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                MCP's standardized compliance framework automatically generates reports for KYC, AML, and other regulatory requirements, reducing compliance costs while improving accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security and Compliance Callout Section */}
      <div className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Built to meet the strictest security standards and regulatory requirements in the financial industry
            </p>
          </div>
          
          <div className="mt-16">
            {/* Compliance Standards */}
            <div className="mb-12 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Compliance Standards
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our platform is certified and compliant with major financial and data protection regulations, ensuring your applications meet industry requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PCI-DSS */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600 dark:text-primary-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                      </svg>
                    </div>
                    <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">PCI-DSS</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Level 1 PCI-DSS certified for secure payment processing and handling of sensitive financial data.
                  </p>
                </div>
                
                {/* GDPR */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600 dark:text-primary-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </div>
                    <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">GDPR</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Fully GDPR compliant with built-in tools for data subject rights management and privacy controls.
                  </p>
                </div>
                
                {/* SOC 2 */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600 dark:text-primary-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                    </div>
                    <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">SOC 2</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    SOC 2 Type II certified, demonstrating our commitment to security, availability, and confidentiality.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Security Features */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Security Features
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our comprehensive security infrastructure protects your data and transactions at every level.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* MFA */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 0 1.242 4.136m6.758 1.364a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">Multi-Factor Authentication</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Supports TOTP, SMS, and hardware security keys for secure access to all MCP resources.
                      </p>
                    </div>
                  </div>
                  
                  {/* IP Whitelisting */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">IP Whitelisting</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Restrict API access to trusted IP addresses and networks for enhanced security.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  {/* Audit Logging */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">Comprehensive Audit Logging</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Immutable logs of all system and user activities for compliance and security monitoring.
                      </p>
                    </div>
                  </div>
                  
                  {/* Key Management */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">Secure Key Management</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Hardware-backed key storage with automatic rotation and revocation capabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              AI-Driven Fintech Solutions
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              See how our MCP Server enables powerful AI-driven financial technology applications
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Use Case 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Payments & Banking Automation</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Seamlessly automate bank transfers, balance inquiries, and transaction categorization through contextualized agent workflows.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Contextual transaction processing
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Automated reconciliation
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Intelligent categorization
                </li>
              </ul>
            </div>

            {/* Use Case 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">AI-powered Investment Management</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Enable AI agents to intelligently trade stocks and cryptocurrencies, monitor real-time portfolios, and optimize investments with market-driven context.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Market-aware decision making
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Portfolio optimization
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Real-time monitoring
                </li>
              </ul>
            </div>

            {/* Use Case 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Advanced Fraud Detection</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Integrate sophisticated real-time fraud analysis directly into transaction streams, allowing AI agents to instantly detect anomalies.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Real-time anomaly detection
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Pattern recognition
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Contextual risk assessment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Benefits Section */}
      <div className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Built for Developers
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our MCP Server provides everything developers need to build powerful, compliant fintech applications
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-8">
              {/* Benefit 1 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simple Integration</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Easy-to-use APIs, detailed SDKs, and developer-friendly documentation make integration straightforward for teams of any size.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">REST APIs</span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Python SDK</span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">JavaScript SDK</span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Detailed Docs</span>
                </div>
              </div>
              
              {/* Benefit 2 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Capabilities</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Leverage HTTP+SSE for real-time updates, transactions, and context synchronization, enabling responsive financial applications.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Server-Sent Events</span>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Websockets</span>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Real-time Updates</span>
                </div>
              </div>
              
              {/* Benefit 3 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Full MCP Compliance</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Adheres strictly to MCP standards, ensuring seamless interoperability with existing MCP-compatible platforms and future-proof implementations.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">MCP v1.0 Certified</span>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Interoperable</span>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Standards-Compliant</span>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-8">
              {/* Benefit 4 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Robust Security Infrastructure</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Out-of-the-box OAuth 2.1, JWT-based authentication, AES-256 encryption, and enterprise-ready security protocols protect sensitive financial data.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">OAuth 2.1</span>
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">JWT Auth</span>
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">AES-256</span>
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">HTTPS/TLS</span>
                </div>
              </div>
              
              {/* Benefit 5 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scalable Cloud Architecture</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Hosted on AWS, fully scalable, reliable, and ready to handle enterprise-grade transaction volumes with high availability and disaster recovery.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">AWS Cloud</span>
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">Auto-scaling</span>
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">High Availability</span>
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">Load Balancing</span>
                </div>
              </div>
              
              {/* Benefit 6 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comprehensive Documentation</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Extensive API references, tutorials, sample applications, and implementation guides to help you get started quickly and efficiently.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">API References</span>
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Tutorials</span>
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Sample Code</span>
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Implementation Guides</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a href="/docs" className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600">
              Explore Developer Documentation
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* AI-Agent Integration Showcase Section */}
      <div className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              AI-Agent Integration Showcase
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              See how AI agents seamlessly interact with the MCP server to deliver powerful fintech solutions
            </p>
          </div>

          {/* Architecture Diagrams */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              Architecture Diagrams
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Diagram 1: Authentication Flow */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Authentication Flow
                  </h4>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <div className="p-4 w-full">
                      <svg className="w-full" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* AI Agent */}
                        <rect x="20" y="80" width="100" height="60" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
                        <text x="70" y="115" textAnchor="middle" fill="#1E3A8A" className="text-sm font-medium">AI Agent</text>
                        
                        {/* MCP Server */}
                        <rect x="280" y="80" width="100" height="60" rx="4" fill="#A7F3D0" stroke="#10B981" strokeWidth="2"/>
                        <text x="330" y="115" textAnchor="middle" fill="#065F46" className="text-sm font-medium">MCP Server</text>
                        
                        {/* Auth Flow */}
                        <path d="M120 100 L280 100" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                        <text x="200" y="90" textAnchor="middle" fill="#4B5563" className="text-xs">1. OAuth Request</text>
                        
                        <path d="M280 120 L120 120" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                        <text x="200" y="140" textAnchor="middle" fill="#4B5563" className="text-xs">2. JWT Token</text>
                        
                        {/* Arrowhead marker */}
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280"/>
                          </marker>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secure OAuth 2.1 authentication with JWT token issuance for AI agents to securely access MCP endpoints.
                  </p>
                </div>
              </div>
              
              {/* Diagram 2: Real-time Updates */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Real-time Updates
                  </h4>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <div className="p-4 w-full">
                      <svg className="w-full" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* AI Agent */}
                        <rect x="20" y="80" width="100" height="60" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
                        <text x="70" y="115" textAnchor="middle" fill="#1E3A8A" className="text-sm font-medium">AI Agent</text>
                        
                        {/* MCP Server */}
                        <rect x="280" y="80" width="100" height="60" rx="4" fill="#A7F3D0" stroke="#10B981" strokeWidth="2"/>
                        <text x="330" y="115" textAnchor="middle" fill="#065F46" className="text-sm font-medium">MCP Server</text>
                        
                        {/* SSE Connection */}
                        <path d="M120 90 L280 90" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
                        <text x="200" y="80" textAnchor="middle" fill="#4B5563" className="text-xs">1. SSE Connection</text>
                        
                        <path d="M280 110 L120 110" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead2)"/>
                        <text x="200" y="130" textAnchor="middle" fill="#4B5563" className="text-xs">2. Real-time Updates</text>
                        
                        <path d="M280 130 L120 130" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead2)"/>
                        
                        {/* Arrowhead marker */}
                        <defs>
                          <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280"/>
                          </marker>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    HTTP+SSE enables real-time updates and context synchronization between AI agents and the MCP server.
                  </p>
                </div>
              </div>
              
              {/* Diagram 3: Secure Transaction Processing */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Secure Transaction Processing
                  </h4>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <div className="p-4 w-full">
                      <svg className="w-full" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* AI Agent */}
                        <rect x="20" y="60" width="100" height="40" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
                        <text x="70" y="85" textAnchor="middle" fill="#1E3A8A" className="text-sm font-medium">AI Agent</text>
                        
                        {/* MCP Server */}
                        <rect x="150" y="60" width="100" height="40" rx="4" fill="#A7F3D0" stroke="#10B981" strokeWidth="2"/>
                        <text x="200" y="85" textAnchor="middle" fill="#065F46" className="text-sm font-medium">MCP Server</text>
                        
                        {/* Banking System */}
                        <rect x="280" y="60" width="100" height="40" rx="4" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
                        <text x="330" y="85" textAnchor="middle" fill="#92400E" className="text-sm font-medium">Banking API</text>
                        
                        {/* Fraud Detection */}
                        <rect x="150" y="140" width="100" height="40" rx="4" fill="#FCA5A5" stroke="#EF4444" strokeWidth="2"/>
                        <text x="200" y="165" textAnchor="middle" fill="#7F1D1D" className="text-sm font-medium">Fraud Detection</text>
                        
                        {/* Flow */}
                        <path d="M120 70 L150 70" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
                        <path d="M250 70 L280 70" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
                        <path d="M250 90 L280 90" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead3)"/>
                        <path d="M200 100 L200 140" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowhead3)"/>
                        
                        {/* Arrowhead marker */}
                        <defs>
                          <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280"/>
                          </marker>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    End-to-end encrypted transaction processing with integrated fraud detection and compliance checks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              Interactive Demo
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-4xl bg-gray-100 dark:bg-gray-700 rounded-lg p-6 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="px-4 py-1 bg-white dark:bg-gray-600 rounded text-xs text-gray-600 dark:text-gray-300 font-mono">
                        https://api.mcpserver.com/demo
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Agent Console</h4>
                        <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs h-40 overflow-y-auto">
                          <div>{">"}Connecting to MCP Server...</div>
                          <div>{">"} Authentication successful</div>
                          <div>{">"} Establishing SSE connection</div>
                          <div>{">"} Connection established</div>
                          <div>{">"} Monitoring portfolio ID: 78A92B</div>
                          <div>{">"} [EVENT] Market alert: AAPL -2.3%</div>
                          <div>{">"} Analyzing impact on portfolio...</div>
                          <div>{">"} Rebalance recommendation ready</div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Portfolio Dashboard</h4>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded h-40 flex flex-col">
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Portfolio Performance</div>
                          <div className="flex-1 flex items-end">
                            <div className="w-1/5 bg-blue-500 dark:bg-blue-600 h-1/3 rounded-t"></div>
                            <div className="w-1/5 bg-blue-500 dark:bg-blue-600 h-1/2 rounded-t"></div>
                            <div className="w-1/5 bg-blue-500 dark:bg-blue-600 h-2/3 rounded-t"></div>
                            <div className="w-1/5 bg-red-500 dark:bg-red-600 h-1/4 rounded-t"></div>
                            <div className="w-1/5 bg-blue-500 dark:bg-blue-600 h-2/5 rounded-t"></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Alert Status:</div>
                            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded text-xs font-medium">Rebalance Needed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                        Try Interactive Demo
                      </button>
                    </div>
                  </div>
                  
                  <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 max-w-2xl text-center">
                    This interactive demo showcases AI agents managing investment portfolios, processing real-time market data, and making intelligent decisions using the MCP Server's secure infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a href="/demo" className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600">
              Explore Full Demo
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* API and SDK Documentation Section */}
      <div className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Developer Resources
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Everything you need to integrate with the MCP Server platform
            </p>
          </div>

          {/* Documentation Cards */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Quick-start Guides */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick-start Guides</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get up and running with our platform in minutes with step-by-step tutorials for common use cases.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">5-minute setup guide</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">First API call walkthrough</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Authentication setup</span>
                  </li>
                </ul>
                <a href="/docs/quickstart" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center">
                  View Quick-start Guides
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* API References */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API References</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive documentation for all MCP Server endpoints, parameters, and response formats.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">REST API documentation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">SSE event specifications</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">SDK method references</span>
                  </li>
                </ul>
                <a href="/docs/api" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium inline-flex items-center">
                  Explore API References
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Interactive Sandbox */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="h-12 w-12 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interactive Sandbox</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Test API calls, experiment with features, and prototype your integration in a safe environment.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">No-setup test environment</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Pre-populated test data</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Code snippet generator</span>
                  </li>
                </ul>
                <a href="/sandbox" className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium inline-flex items-center">
                  Launch Sandbox
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Code Sample */}
          <div className="mt-16 bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sample Integration Code</h3>
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                <pre className="whitespace-pre">{
`// Initialize the MCP client with your API key
const mcp = new MCPClient({
  apiKey: 'YOUR_API_KEY',
  environment: 'sandbox'
});

// Authenticate and establish SSE connection
await mcp.authenticate();
const events = mcp.connectToEvents();

// Listen for real-time updates
events.on('transaction', (data) => {
  console.log('New transaction:', data);
  
  // Process the transaction
  if (data.amount > 10000) {
    // Trigger fraud detection
    mcp.analyzeFraudRisk(data.id);
  }
});

// Execute a payment
const payment = await mcp.createPayment({
  amount: 500.00,
  currency: 'USD',
  source: 'account_12345',
  destination: 'account_67890',
  description: 'Invoice payment #123'
});

console.log('Payment created:', payment.id);`
                }</pre>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <a href="/docs/sdks" className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                </svg>
                SDK Downloads
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Download our SDKs for Python, JavaScript, Java, and more</p>
            </a>

            <a href="/docs/tutorials" className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Tutorials & Guides
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Step-by-step tutorials for common integration scenarios</p>
            </a>

            <a href="/docs/examples" className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                Code Examples
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Ready-to-use code examples for various programming languages</p>
            </a>

            <a href="/docs/community" className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Community & Support
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Join our developer community and get expert support</p>
            </a>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="my-12 rounded-2xl bg-primary-50 px-6 py-12 dark:bg-primary-950 md:my-20 md:px-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Ready to implement MCP in your financial operations?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start using our MCP-compliant platform today and experience enhanced security, simplified compliance, and improved operational transparency for your financial institution.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              Sign up for free
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Contact sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
