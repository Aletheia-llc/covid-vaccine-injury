import Link from 'next/link'
import '../styles.css'

export const metadata = {
  title: 'Privacy Policy | U.S. Covid Vaccine Injuries',
  description: 'Privacy Policy for U.S. Covid Vaccine Injuries website - how we collect, use, and protect your information.',
}

export default function PrivacyPolicyPage() {
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
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last Updated: {lastUpdated}</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2>Introduction</h2>
              <p>
                Aletheia LLC, operating as U.S. Covid Vaccine Injuries (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                visit our website covidvaccineinjuries.us (the &quot;Site&quot;) and use our services.
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Site, you acknowledge that you
                have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the
                terms of this Privacy Policy, please do not access the Site.
              </p>
            </section>

            <section className="legal-section">
              <h2>Information We Collect</h2>

              <h3>Information You Provide Directly</h3>
              <p>We may collect information that you voluntarily provide when you:</p>
              <ul>
                <li><strong>Complete our survey:</strong> Responses to questions about vaccine injury experiences, beliefs about compensation systems, ZIP code, and optionally your email address</li>
                <li><strong>Subscribe to updates:</strong> Name, email address, phone number (optional), and ZIP code (optional)</li>
                <li><strong>Use our representative lookup tool:</strong> ZIP code to find your congressional representatives</li>
                <li><strong>Contact us:</strong> Any information you include in correspondence with us</li>
              </ul>

              <h3>Information Collected Automatically</h3>
              <p>When you visit our Site, we may automatically collect certain information, including:</p>
              <ul>
                <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                <li><strong>Usage Information:</strong> Pages visited, time spent on pages, links clicked</li>
                <li><strong>Location Information:</strong> General geographic location based on IP address</li>
                <li><strong>Analytics Data:</strong> We use Google Analytics to understand how visitors interact with our Site</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li><strong>Advocacy and Research:</strong> To understand the impact of vaccine injury compensation policies and support reform efforts</li>
                <li><strong>Communication:</strong> To send updates about legislative developments, advocacy efforts, and relevant news (if you have opted in)</li>
                <li><strong>Site Improvement:</strong> To analyze usage patterns and improve our Site&apos;s functionality and content</li>
                <li><strong>Representative Lookup:</strong> To help you identify and contact your congressional representatives</li>
                <li><strong>Aggregate Analysis:</strong> To compile anonymous, aggregate statistics about survey responses and site usage</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>Information Sharing and Disclosure</h2>
              <p>We may share your information in the following circumstances:</p>

              <h3>Advocacy Partners</h3>
              <p>
                We may share information with allied advocacy organizations working on vaccine injury compensation reform.
                This sharing helps coordinate advocacy efforts and amplify the voices of affected individuals.
                We only partner with organizations that share our commitment to privacy and data protection.
              </p>

              <h3>Aggregate Data</h3>
              <p>
                We may share anonymous, aggregated data (such as survey statistics) publicly to support advocacy efforts.
                This data does not identify any individual.
              </p>

              <h3>Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid requests by
                public authorities (e.g., a court or government agency).
              </p>

              <h3>Service Providers</h3>
              <p>
                We may share information with third-party service providers who perform services on our behalf,
                such as web hosting, analytics, and email delivery. These providers are contractually obligated
                to protect your information.
              </p>
            </section>

            <section className="legal-section">
              <h2>Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar tracking technologies to:</p>
              <ul>
                <li>Analyze site traffic and usage patterns (via Google Analytics)</li>
                <li>Remember your preferences</li>
                <li>Understand how you interact with our Site</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Note that disabling cookies may affect
                the functionality of certain features on our Site.
              </p>

              <h3>Google Analytics</h3>
              <p>
                We use Google Analytics to collect information about how visitors use our Site. Google Analytics
                uses cookies to collect information such as how often users visit the Site, what pages they visit,
                and what other sites they visited prior to coming to our Site. We use this information to improve
                our Site. Google&apos;s ability to use and share information collected by Google Analytics is restricted
                by the <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Google Analytics Terms of Service</a> and
                the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
              </p>
            </section>

            <section className="legal-section">
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="legal-section">
              <h2>Data Retention</h2>
              <p>
                We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy,
                unless a longer retention period is required or permitted by law. Survey responses and subscriber information
                are retained to support ongoing advocacy efforts and to maintain historical records of public sentiment
                regarding vaccine injury compensation.
              </p>
            </section>

            <section className="legal-section">
              <h2>Your Rights and Choices</h2>
              <p>You have the following rights regarding your information:</p>
              <ul>
                <li><strong>Access:</strong> You may request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> You may request that we delete your personal information, subject to certain exceptions</li>
                <li><strong>Opt-Out:</strong> You may unsubscribe from our email communications at any time by clicking the unsubscribe link in any email or by contacting us</li>
              </ul>
              <p>To exercise any of these rights, please contact us at privacy@covidvaccineinjuries.us.</p>
            </section>

            <section className="legal-section">
              <h2>Children&apos;s Privacy</h2>
              <p>
                Our Site is not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us so we can delete such information.
              </p>
            </section>

            <section className="legal-section">
              <h2>California Privacy Rights</h2>
              <p>
                If you are a California resident, you may have additional rights under the California Consumer
                Privacy Act (CCPA), including the right to know what personal information we collect and how we
                use it, the right to request deletion, and the right to opt out of the sale of personal information.
                We do not sell personal information.
              </p>
            </section>

            <section className="legal-section">
              <h2>International Users</h2>
              <p>
                Our Site is operated in the United States. If you are located outside the United States, please
                be aware that information you provide to us will be transferred to and processed in the United States.
                By using our Site, you consent to this transfer and processing.
              </p>
            </section>

            <section className="legal-section">
              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review
                this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="legal-section">
              <h2>Contact Us</h2>
              <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
              <div className="legal-contact">
                <p><strong>Aletheia LLC</strong></p>
                <p><strong>Email:</strong> privacy@covidvaccineinjuries.us</p>
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
