import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Privacy Policy
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Last Updated: March 10, 2026
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to RVCE Utility ("we," "our," or "us"). We are committed
                to protecting your personal information and your right to
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                College Resource Management System.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold mb-2 mt-4">
                2.1 Personal Information
              </h3>
              <p className="text-gray-700 mb-2">
                When you use our service, we may collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  Name and email address (via GitHub OAuth authentication)
                </li>
                <li>GitHub profile information</li>
                <li>College-related information you provide</li>
                <li>Contribution and submission data</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                2.2 Google Drive Data
              </h3>
              <p className="text-gray-700">
                Our service integrates with Google Drive to manage academic
                resources. We access only the files and folders that are
                specifically shared with our service or that you explicitly
                grant us permission to access. We do not access your personal
                Google Drive files beyond what is necessary for the service
                functionality.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                2.3 Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information</li>
                <li>Usage statistics and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-2">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Provide and maintain our service</li>
                <li>Authenticate your identity via GitHub OAuth</li>
                <li>
                  Manage academic resources through Google Drive integration
                </li>
                <li>Process and track contributions and submissions</li>
                <li>
                  Send notifications about your contributions and requests
                </li>
                <li>Improve and optimize our service</li>
                <li>Communicate with you about updates or issues</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                4. Data Storage and Security
              </h2>
              <p className="text-gray-700 mb-2">
                We store your data using MongoDB, a secure database solution. We
                implement industry-standard security measures to protect your
                personal information, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Encrypted data transmission (SSL/TLS)</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and user permissions</li>
              </ul>
              <p className="text-gray-700 mt-2">
                However, no method of transmission over the internet is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                5. Third-Party Services
              </h2>
              <p className="text-gray-700 mb-2">Our service integrates with:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  <strong>Google Drive:</strong> For file storage and management
                </li>
                <li>
                  <strong>GitHub:</strong> For authentication (OAuth)
                </li>
                <li>
                  <strong>MongoDB:</strong> For data storage
                </li>
                <li>
                  <strong>Email Service (Gmail SMTP):</strong> For sending
                  notifications
                </li>
                <li>
                  <strong>Telegram:</strong> For administrative notifications
                </li>
              </ul>
              <p className="text-gray-700 mt-2">
                These third-party services have their own privacy policies. We
                recommend reviewing them:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    GitHub Privacy Statement
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                6. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-700 mb-2">
                We do not sell, trade, or rent your personal information. We may
                share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>With your explicit consent</li>
                <li>
                  To comply with legal obligations or respond to lawful requests
                </li>
                <li>
                  To protect our rights, property, or safety, or that of our
                  users
                </li>
                <li>
                  With service providers who assist in operating our service
                  (under strict confidentiality agreements)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal information</li>
                <li>Revoke Google Drive or GitHub access permissions</li>
                <li>Object to processing of your data</li>
                <li>Export your data</li>
              </ul>
              <p className="text-gray-700 mt-2">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:rvceutility@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  rvceutility@gmail.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information only for as long as
                necessary to fulfill the purposes outlined in this Privacy
                Policy, unless a longer retention period is required by law.
                When you delete your account or request data deletion, we will
                remove your information from our active databases within a
                reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700">
                Our service is intended for college students and educational
                purposes. We do not knowingly collect information from children
                under 13. If you believe we have collected information from a
                child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                10. Google API Services User Data Policy
              </h2>
              <p className="text-gray-700 mb-2">
                RVCE Utility's use and transfer of information received from
                Google APIs adheres to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <p className="text-gray-700">
                We only access the minimum necessary data from your Google Drive
                to provide our service functionality and do not use this data
                for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date. We encourage you
                to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-1 ml-4">
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:rvceutility@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    rvceutility@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Service:</strong> RVCE Utility - College Resource
                  Management System
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
