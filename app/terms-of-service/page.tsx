import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Terms of Service
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Last Updated: March 10, 2026
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                By accessing and using RVCE Utility ("Service," "Platform,"
                "we," "our," or "us"), you accept and agree to be bound by the
                terms and provisions of this agreement. If you do not agree to
                these Terms of Service, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                2. Description of Service
              </h2>
              <p className="text-gray-700 mb-2">
                RVCE Utility is a College Resource Management System that
                provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  Google Drive integration for managing academic resources and
                  files
                </li>
                <li>Contribution management system for user submissions</li>
                <li>Request tracking and approval workflows</li>
                <li>Resource organization and metadata management</li>
                <li>Notification services for updates and activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <h3 className="text-xl font-semibold mb-2 mt-4">
                3.1 Account Creation
              </h3>
              <p className="text-gray-700">
                To use certain features of our Service, you must authenticate
                using GitHub OAuth. You are responsible for maintaining the
                confidentiality of your account credentials and for all
                activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                3.2 Account Responsibilities
              </h3>
              <p className="text-gray-700 mb-2">You agree to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not impersonate others or misrepresent your affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Acceptable Use</h2>
              <h3 className="text-xl font-semibold mb-2 mt-4">
                4.1 Permitted Uses
              </h3>
              <p className="text-gray-700 mb-2">You may use the Service to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Access and manage academic resources</li>
                <li>Submit and manage contributions</li>
                <li>Collaborate with other users on educational content</li>
                <li>Organize and share college-related materials</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                4.2 Prohibited Activities
              </h3>
              <p className="text-gray-700 mb-2">You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Upload malicious software, viruses, or harmful code</li>
                <li>Violate any intellectual property rights or copyrights</li>
                <li>Share inappropriate, offensive, or illegal content</li>
                <li>
                  Attempt to gain unauthorized access to the service or other
                  users' accounts
                </li>
                <li>
                  Use the service for commercial purposes without authorization
                </li>
                <li>
                  Scrape, crawl, or use automated tools to access the service
                </li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Misuse Google Drive integration or exceed rate limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                5. Google Drive Integration
              </h2>
              <p className="text-gray-700 mb-2">
                By using our Google Drive integration, you acknowledge that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  You grant us permission to access only the specific files and
                  folders necessary for the service
                </li>
                <li>
                  You can revoke this access at any time through your Google
                  account settings
                </li>
                <li>
                  We will only access, modify, or delete files as directed by
                  you or as necessary for service functionality
                </li>
                <li>
                  You are responsible for any content you upload or share
                  through the service
                </li>
                <li>
                  You comply with Google's Terms of Service and API usage
                  policies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                6. User Content and Contributions
              </h2>
              <h3 className="text-xl font-semibold mb-2 mt-4">
                6.1 Content Ownership
              </h3>
              <p className="text-gray-700">
                You retain all rights to the content you submit or upload to the
                Service. However, by submitting content, you grant us a
                non-exclusive, worldwide, royalty-free license to use, store,
                display, and distribute your content solely for the purpose of
                providing and improving the Service.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                6.2 Content Responsibility
              </h3>
              <p className="text-gray-700 mb-2">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>The accuracy and legality of your submitted content</li>
                <li>
                  Ensuring you have rights to upload and share the content
                </li>
                <li>Respecting copyright and intellectual property laws</li>
                <li>The quality and appropriateness of your contributions</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                6.3 Content Moderation
              </h3>
              <p className="text-gray-700">
                We reserve the right to review, moderate, or remove any content
                that violates these Terms of Service or is deemed inappropriate,
                without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Privacy</h2>
              <p className="text-gray-700">
                Your use of the Service is also governed by our Privacy Policy.
                Please review our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                8. Intellectual Property
              </h2>
              <p className="text-gray-700">
                The Service, including its design, features, functionality, and
                all content (excluding user-generated content), is owned by RVCE
                Utility and is protected by copyright, trademark, and other
                intellectual property laws. You may not copy, modify,
                distribute, or reverse engineer any part of the Service without
                our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                9. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 mb-2">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
                NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  Warranties of merchantability or fitness for a particular
                  purpose
                </li>
                <li>
                  Warranties that the service will be uninterrupted or
                  error-free
                </li>
                <li>
                  Warranties regarding the accuracy or reliability of content
                </li>
                <li>
                  Warranties that the service will meet your specific
                  requirements
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RVCE UTILITY SHALL NOT
                BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
                GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                <li>Your use or inability to use the Service</li>
                <li>Unauthorized access to your data or account</li>
                <li>Any conduct or content of third parties on the Service</li>
                <li>Any content obtained from the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                11. Indemnification
              </h2>
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless RVCE Utility
                and its officers, directors, employees, and agents from any
                claims, liabilities, damages, losses, and expenses (including
                legal fees) arising out of or related to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms of Service</li>
                <li>Your violation of any rights of another party</li>
                <li>Your uploaded content or contributions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                12. Service Modifications and Termination
              </h2>
              <h3 className="text-xl font-semibold mb-2 mt-4">
                12.1 Service Changes
              </h3>
              <p className="text-gray-700">
                We reserve the right to modify, suspend, or discontinue the
                Service (or any part thereof) at any time, with or without
                notice, for any reason.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">
                12.2 Account Termination
              </h3>
              <p className="text-gray-700">
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice, if you breach these
                Terms of Service or engage in prohibited activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                13. Third-Party Services
              </h2>
              <p className="text-gray-700">
                Our Service integrates with third-party services (Google Drive,
                GitHub, MongoDB, etc.). Your use of these third-party services
                is governed by their respective terms and policies. We are not
                responsible for any third-party services or their content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Governing Law</h2>
              <p className="text-gray-700">
                These Terms of Service shall be governed by and construed in
                accordance with the laws of India, without regard to its
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                15. Dispute Resolution
              </h2>
              <p className="text-gray-700">
                Any disputes arising out of or relating to these Terms of
                Service or the Service shall be resolved through good faith
                negotiation. If a dispute cannot be resolved through
                negotiation, it shall be submitted to arbitration in accordance
                with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">16. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms of Service is found to be
                invalid or unenforceable, the remaining provisions shall
                continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                17. Changes to Terms
              </h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms of Service at any
                time. We will notify users of any material changes by posting
                the updated terms on this page and updating the "Last Updated"
                date. Your continued use of the Service after changes are posted
                constitutes your acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                18. Contact Information
              </h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about these Terms of Service, please
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

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                19. Entire Agreement
              </h2>
              <p className="text-gray-700">
                These Terms of Service, together with our Privacy Policy,
                constitute the entire agreement between you and RVCE Utility
                regarding the use of the Service and supersede any prior
                agreements.
              </p>
            </section>

            <section className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 text-sm">
                By using RVCE Utility, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
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
