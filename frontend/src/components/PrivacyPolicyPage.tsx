import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface PrivacyPolicyPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function PrivacyPolicyPage({ isDark, onThemeToggle }: PrivacyPolicyPageProps) {
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Privacy Policy';
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
                Privacy Policy
              </h1>
            </div>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                This Privacy Policy describes Our policies and procedures on the collection, 
                use and disclosure of Your information when You use the Service and tells You 
                about Your privacy rights and how the law protects You.
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                We use Your Personal data to provide and improve the Service. By using the 
                Service, You agree to the collection and use of information in accordance with 
                this Privacy Policy.
              </p>

              {/* Interpretation and Definitions */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Interpretation and Definitions
                </h2>
                
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                  Interpretation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  The words of which the initial letter is capitalized have meanings defined 
                  under the following conditions. The following definitions shall have the same 
                  meaning regardless of whether they appear in singular or in plural.
                </p>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                  Definitions
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  For the purposes of this Privacy Policy:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                  <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                  <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to MyPortfolio.</li>
                  <li><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>
                  <li><strong>Country</strong> refers to: Ontario, Canada</li>
                  <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                  <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
                  <li><strong>Service</strong> refers to the Website.</li>
                  <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company.</li>
                  <li><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</li>
                  <li><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself.</li>
                  <li><strong>Website</strong> refers to MyPortfolio, accessible from your current domain</li>
                  <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                </ul>
              </section>

              {/* Collecting and Using Your Personal Data */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Collecting and Using Your Personal Data
                </h2>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                  Types of Data Collected
                </h3>

                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Personal Data
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  While using Our Service, We may ask You to provide Us with certain personally 
                  identifiable information that can be used to contact or identify You. 
                  Personally identifiable information may include, but is not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Usage Data</li>
                </ul>

                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Usage Data
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Usage Data is collected automatically when using the Service. Usage Data may include 
                  information such as Your Device's Internet Protocol address (e.g. IP address), browser 
                  type, browser version, the pages of our Service that You visit, the time and date of 
                  Your visit, the time spent on those pages, unique device identifiers and other 
                  diagnostic data.
                </p>

                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Information from Third-Party Social Media Services
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  The Company allows You to create an account and log in to use the Service through 
                  the following Third-party Social Media Services:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Google</li>
                  <li>Facebook</li>
                  <li>Instagram</li>
                  <li>Twitter</li>
                  <li>LinkedIn</li>
                </ul>
              </section>

              {/* Use of Your Personal Data */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Use of Your Personal Data
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  The Company may use Personal Data for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</li>
                  <li><strong>To manage Your Account</strong>: to manage Your registration as a user of the Service.</li>
                  <li><strong>For the performance of a contract</strong>: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.</li>
                  <li><strong>To contact You</strong>: To contact You by email regarding updates or informative communications related to the functionalities, products or contracted services.</li>
                  <li><strong>To provide You with news</strong>, special offers and general information about other goods, services and events which we offer.</li>
                  <li><strong>To manage Your requests</strong>: To attend and manage Your requests to Us.</li>
                  <li><strong>For business transfers</strong>: We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.</li>
                  <li><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.</li>
                </ul>
              </section>

              {/* Security of Your Personal Data */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Security of Your Personal Data
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  The security of Your Personal Data is important to Us, but remember that no method 
                  of transmission over the Internet, or method of electronic storage is 100% secure. 
                  While We strive to use commercially acceptable means to protect Your Personal Data, 
                  We cannot guarantee its absolute security.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Children's Privacy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Our Service does not address anyone under the age of 13. We do not knowingly 
                  collect personally identifiable information from anyone under the age of 13. 
                  If You are a parent or guardian and You are aware that Your child has provided 
                  Us with Personal Data, please contact Us.
                </p>
              </section>

              {/* Changes to this Privacy Policy */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Changes to this Privacy Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  We may update Our Privacy Policy from time to time. We will notify You of any 
                  changes by posting the new Privacy Policy on this page and update the "Last updated" 
                  date at the top of this Privacy Policy.
                </p>
              </section>

              {/* Contact Us */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, You can contact us:
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