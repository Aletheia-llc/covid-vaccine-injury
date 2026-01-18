import Link from 'next/link'
import '../styles.css'

export const metadata = {
  title: 'Terms of Service | U.S. Covid Vaccine Injuries',
  description: 'Terms of Service for U.S. Covid Vaccine Injuries website - rules and guidelines for using our services.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 18, 2026'

  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span>U.S. Covid Vaccine Injuries</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/#data">Data</Link></li>
            <li><Link href="/#comparison">Programs</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/resources">Resources</Link></li>
            <li><Link href="/survey">Survey</Link></li>
          </ul>
          <Link href="/#action" className="nav-cta">Take Action</Link>
        </div>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <div className="legal-header">
            <h1>Terms of Service</h1>
            <p className="legal-updated">Last Updated: {lastUpdated}</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2>Agreement to Terms</h2>
              <p>
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Aletheia LLC,
                operating as U.S. Covid Vaccine Injuries (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), concerning your access to
                and use of the covidvaccineinjuries.us website and any related services (collectively, the &quot;Site&quot;).
              </p>
              <p>
                By accessing or using the Site, you agree to be bound by these Terms. If you do not agree to all
                of these Terms, you are prohibited from using the Site and must discontinue use immediately.
              </p>
            </section>

            <section className="legal-section">
              <h2>Description of Services</h2>
              <p>The Site provides:</p>
              <ul>
                <li>Educational information about vaccine injury compensation programs (CICP and VICP)</li>
                <li>Data visualizations and analysis regarding compensation statistics</li>
                <li>Tools to help users contact their congressional representatives</li>
                <li>Surveys to gather information about experiences with vaccine injury compensation</li>
                <li>Resources and links to official government sources and advocacy materials</li>
                <li>Email subscription services for advocacy updates</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>Important Disclaimers</h2>

              <h3>Not Legal Advice</h3>
              <p>
                <strong>The information provided on this Site is for general informational and educational purposes only
                and does not constitute legal advice.</strong> Nothing on this Site should be construed as legal counsel
                or as creating an attorney-client relationship. If you need legal advice regarding a vaccine injury
                claim or any other legal matter, you should consult with a qualified attorney licensed in your jurisdiction.
              </p>

              <h3>Not Medical Advice</h3>
              <p>
                <strong>The information provided on this Site is not intended to be a substitute for professional medical
                advice, diagnosis, or treatment.</strong> Always seek the advice of your physician or other qualified
                health provider with any questions you may have regarding a medical condition. Never disregard
                professional medical advice or delay in seeking it because of something you have read on this Site.
              </p>

              <h3>No Guarantee of Accuracy</h3>
              <p>
                While we strive to provide accurate and up-to-date information, we make no representations or warranties
                of any kind, express or implied, about the completeness, accuracy, reliability, or availability of
                the information, data, or statistics presented on this Site. Government data and statistics may change,
                and there may be delays in updating our content to reflect such changes.
              </p>
            </section>

            <section className="legal-section">
              <h2>User Responsibilities</h2>
              <p>By using the Site, you agree to:</p>
              <ul>
                <li>Provide accurate and truthful information when completing surveys or forms</li>
                <li>Use the Site only for lawful purposes and in accordance with these Terms</li>
                <li>Not attempt to interfere with, compromise, or disrupt the Site&apos;s systems or security</li>
                <li>Not use the Site to transmit any harmful, threatening, abusive, or unlawful content</li>
                <li>Not use automated systems (bots, scrapers, etc.) to access the Site without our express permission</li>
                <li>Not impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>Intellectual Property Rights</h2>
              <p>
                The Site and its entire contents, features, and functionality (including but not limited to all information,
                software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof)
                are owned by Aletheia LLC, its licensors, or other providers and are protected by United States and
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You may access and use the Site for your personal, non-commercial use only. You may share links to
                the Site and quote limited portions of content with proper attribution. You may not reproduce, distribute,
                modify, create derivative works of, publicly display, publicly perform, republish, or transmit substantial
                portions of the Site without our prior written consent.
              </p>
            </section>

            <section className="legal-section">
              <h2>Third-Party Links and Content</h2>
              <p>
                The Site may contain links to third-party websites and resources, including government websites,
                advocacy organizations, and news sources. These links are provided for your convenience only.
                We have no control over the contents of those sites or resources and accept no responsibility
                for them or for any loss or damage that may arise from your use of them.
              </p>
              <p>
                If you decide to access any third-party websites linked to from the Site, you do so entirely at
                your own risk and subject to the terms and conditions of use for such websites.
              </p>
            </section>

            <section className="legal-section">
              <h2>Representative Lookup Tool</h2>
              <p>
                Our representative lookup tool uses third-party data sources to help you identify your congressional
                representatives based on your ZIP code. We do not guarantee the accuracy or completeness of this
                information, as congressional districts and representative information may change. For the most
                accurate and up-to-date information, please verify with official government sources such as
                house.gov and senate.gov.
              </p>
            </section>

            <section className="legal-section">
              <h2>Survey and User Submissions</h2>
              <p>
                By submitting information through our surveys or forms, you grant us a non-exclusive, royalty-free,
                perpetual, irrevocable right to use, reproduce, modify, and distribute such information for advocacy,
                research, and educational purposes. Survey responses may be shared in aggregate, anonymous form.
              </p>
              <p>
                You represent and warrant that any information you submit is accurate to the best of your knowledge
                and does not violate any third party&apos;s rights or any applicable laws.
              </p>
            </section>

            <section className="legal-section">
              <h2>Limitation of Liability</h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ALETHEIA LLC, ITS AFFILIATES, OFFICERS,
                DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
                INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use the Site</li>
                <li>Any conduct or content of any third party on the Site</li>
                <li>Any content obtained from the Site</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                <li>Any decisions or actions taken based on information provided on the Site</li>
              </ul>
              <p>
                THE SITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT ANY WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section className="legal-section">
              <h2>Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Aletheia LLC and its officers, directors, employees,
                and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs,
                expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to your violation
                of these Terms or your use of the Site.
              </p>
            </section>

            <section className="legal-section">
              <h2>Governing Law and Jurisdiction</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States
                and the State in which Aletheia LLC is incorporated, without regard to its conflict of law provisions.
              </p>
              <p>
                Any legal suit, action, or proceeding arising out of or related to these Terms or the Site shall
                be instituted exclusively in the federal or state courts located in the jurisdiction of Aletheia LLC,
                and you waive any objection to the exercise of jurisdiction over you by such courts.
              </p>
            </section>

            <section className="legal-section">
              <h2>Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify
                you by updating the &quot;Last Updated&quot; date at the top of these Terms. Your continued use of the Site
                after any such changes constitutes your acceptance of the new Terms.
              </p>
              <p>
                It is your responsibility to review these Terms periodically for changes. If you do not agree to
                the modified Terms, you must stop using the Site.
              </p>
            </section>

            <section className="legal-section">
              <h2>Termination</h2>
              <p>
                We may terminate or suspend your access to the Site immediately, without prior notice or liability,
                for any reason whatsoever, including without limitation if you breach these Terms. Upon termination,
                your right to use the Site will immediately cease.
              </p>
            </section>

            <section className="legal-section">
              <h2>Severability</h2>
              <p>
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be
                changed and interpreted to accomplish the objectives of such provision to the greatest extent
                possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="legal-section">
              <h2>Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and
                Aletheia LLC regarding your use of the Site and supersede all prior and contemporaneous agreements,
                representations, and understandings.
              </p>
            </section>

            <section className="legal-section">
              <h2>Contact Us</h2>
              <p>If you have questions or concerns about these Terms of Service, please contact us at:</p>
              <div className="legal-contact">
                <p><strong>Aletheia LLC</strong></p>
                <p><strong>Email:</strong> legal@covidvaccineinjuries.us</p>
                <p><strong>Website:</strong> covidvaccineinjuries.us</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-logo">
          <span>U.S. Covid Vaccine Injuries</span>
        </div>
        <p className="footer-text">Advocating for fair compensation for all vaccine-injured Americans.</p>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
