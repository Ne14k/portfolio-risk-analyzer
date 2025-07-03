import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface TermsOfServicePageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function TermsOfServicePage({ isDark, onThemeToggle }: TermsOfServicePageProps) {
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Terms of Service';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                MyPortfolioTracker
              </h1>
            </Link>
            
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Terms of Service
              </h1>
            </div>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                These Terms of Service ("Terms") govern your use of the MyPortfolio website 
                and services (the "Service") operated by MyPortfolio ("us", "we", or "our").
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                By accessing or using our Service, you agree to be bound by these Terms. 
                If you disagree with any part of these terms, then you may not access the Service.
              </p>

              {/* Acceptance of Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  By creating an account or using the Service, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms and our Privacy Policy. These 
                  Terms apply to all users of the Service.
                </p>
              </section>

              {/* Service Description */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Service Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  MyPortfolio is an educational portfolio analysis tool that provides:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Portfolio risk assessment and analytics</li>
                  <li>Monte Carlo simulations for portfolio forecasting</li>
                  <li>Portfolio optimization recommendations</li>
                  <li>Market crash scenario testing</li>
                  <li>Educational content about investment principles</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  <strong>Important:</strong> This Service is for educational and informational 
                  purposes only and does not constitute financial, investment, or professional advice.
                </p>
              </section>

              {/* User Accounts */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. User Accounts
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  To access certain features of the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Be at least 18 years old or have parental consent to use the Service</li>
                </ul>
              </section>

              {/* Acceptable Use */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Acceptable Use
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any harmful, threatening, or offensive content</li>
                  <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                  <li>Interfere with the proper working of the Service</li>
                  <li>Use automated scripts or bots to access the Service</li>
                  <li>Reverse engineer or attempt to extract source code from the Service</li>
                </ul>
              </section>

              {/* Financial Disclaimer */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Financial Disclaimer
                </h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    Important Financial Disclaimer
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                    The information provided by MyPortfolio is for educational purposes only and 
                    should not be considered as financial, investment, or professional advice. 
                    Past performance does not guarantee future results. All investment decisions 
                    should be made in consultation with qualified financial advisors.
                  </p>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  You acknowledge and agree that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>We are not licensed financial advisors or investment professionals</li>
                  <li>Our analysis tools are educational simulations and may not reflect real market conditions</li>
                  <li>Investment decisions made based on our Service are solely your responsibility</li>
                  <li>You should consult with qualified professionals before making investment decisions</li>
                  <li>We do not guarantee the accuracy of market data or analysis results</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Intellectual Property Rights
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are and will 
                  remain the exclusive property of MyPortfolio and its licensors. The Service is 
                  protected by copyright, trademark, and other laws. You may not reproduce, 
                  distribute, or create derivative works from our content without explicit permission.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  To the maximum extent permitted by law, MyPortfolio shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, including but 
                  not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Loss of profits or investment losses</li>
                  <li>Loss of data or business interruption</li>
                  <li>Costs of procurement of substitute services</li>
                  <li>Any damages arising from your use of the Service</li>
                </ul>
              </section>

              {/* Service Availability */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Service Availability
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We strive to maintain the availability of our Service, but we do not guarantee 
                  uninterrupted access. The Service may be temporarily unavailable due to 
                  maintenance, updates, or circumstances beyond our control.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Termination
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the Service immediately, 
                  without prior notice, if you breach these Terms. You may also terminate your 
                  account at any time by contacting us or deleting your account through the Service.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Changes to Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We reserve the right to modify these Terms at any time. We will notify users of 
                  significant changes by posting the new Terms on this page and updating the "Last 
                  updated" date. Your continued use of the Service after such modifications 
                  constitutes acceptance of the updated Terms.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  11. Governing Law
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of 
                  Ontario, Canada, without regard to its conflict of law provisions. Any disputes 
                  arising from these Terms or your use of the Service shall be resolved in the 
                  courts of Ontario, Canada.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  12. Contact Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                  <li>By email: myportfoliotrackapp@gmail.com</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}