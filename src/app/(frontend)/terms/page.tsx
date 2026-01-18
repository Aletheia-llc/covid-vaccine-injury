import Link from 'next/link'
import '../styles.css'

export const metadata = {
  title: 'Terms of Service | U.S. Covid Vaccine Injuries',
  description: 'Terms of Service for U.S. Covid Vaccine Injuries website.',
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
            <li><Link href="/#funnel">The Gap</Link></li>
            <li><Link href="/#comparison">Programs</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/resources">Data</Link></li>
            <li><Link href="/survey">Survey</Link></li>
          </ul>
          <Link href="/#action" className="nav-cta">Contact Congress</Link>
        </div>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <div className="legal-header">
            <h1>Terms of Service</h1>
            <p className="legal-updated">Last Updated: {lastUpdated}</p>
          </div>

          <div className="legal-content">
            {/* Quick Summary */}
            <section className="legal-section legal-summary">
              <h2>Quick Summary</h2>
              <table className="legal-table">
                <tbody>
                  <tr>
                    <th>What this site is</th>
                    <td>Educational advocacy for vaccine injury compensation reform</td>
                  </tr>
                  <tr>
                    <th>What it&apos;s NOT</th>
                    <td>Legal advice, medical advice, or government services</td>
                  </tr>
                  <tr>
                    <th>Your responsibility</th>
                    <td>Use the site lawfully and respectfully</td>
                  </tr>
                  <tr>
                    <th>Our responsibility</th>
                    <td>Provide accurate information to the best of our ability</td>
                  </tr>
                  <tr>
                    <th>Disputes</th>
                    <td>Governed by Wyoming law; informal resolution first</td>
                  </tr>
                </tbody>
              </table>
              <p className="legal-note"><em>Read the full terms below for complete details.</em></p>
            </section>

            {/* Table of Contents */}
            <section className="legal-section">
              <h2>Table of Contents</h2>
              <ol className="legal-toc">
                <li><a href="#agreement">Agreement to Terms</a></li>
                <li><a href="#about">About Our Site</a></li>
                <li><a href="#disclaimers">Important Disclaimers</a></li>
                <li><a href="#eligibility">Eligibility</a></li>
                <li><a href="#use">Your Use of the Site</a></li>
                <li><a href="#user-content">User Content</a></li>
                <li><a href="#ip">Intellectual Property</a></li>
                <li><a href="#third-party">Third-Party Links &amp; Services</a></li>
                <li><a href="#rep-lookup">Representative Lookup Tool</a></li>
                <li><a href="#liability">Limitation of Liability</a></li>
                <li><a href="#indemnification">Indemnification</a></li>
                <li><a href="#termination">Termination</a></li>
                <li><a href="#disputes">Dispute Resolution</a></li>
                <li><a href="#governing-law">Governing Law</a></li>
                <li><a href="#changes">Changes to These Terms</a></li>
                <li><a href="#severability">Severability</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ol>
            </section>

            {/* 1. Agreement to Terms */}
            <section className="legal-section" id="agreement">
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or using the website <a href="https://www.covidvaccineinjury.us">covidvaccineinjury.us</a> (the &quot;Site&quot;),
                you agree to be bound by these Terms of Service (&quot;Terms&quot;).
              </p>
              <p><strong>If you do not agree to these Terms, do not use the Site.</strong></p>
              <p>
                These Terms constitute a legally binding agreement between you and <strong>Aletheia LLC</strong>,
                a Wyoming limited liability company operating as &quot;U.S. Covid Vaccine Injuries&quot;
                (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or the &quot;Company&quot;).
              </p>
              <p>
                We may update these Terms from time to time. Your continued use of the Site after changes
                are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* 2. About Our Site */}
            <section className="legal-section" id="about">
              <h2>2. About Our Site</h2>

              <h3>What We Are</h3>
              <p>U.S. Covid Vaccine Injuries is a <strong>health policy advocacy organization</strong> dedicated to:</p>
              <ul>
                <li>Educating the public about COVID-19 vaccine injury compensation programs</li>
                <li>Advocating for the transfer of COVID-19 vaccine claims from the Countermeasures Injury Compensation Program (CICP) to the National Vaccine Injury Compensation Program (VICP)</li>
                <li>Providing tools to help citizens contact their elected representatives</li>
                <li>Collecting survey data to understand public sentiment and support advocacy efforts</li>
              </ul>

              <h3>What We Are NOT</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>We Are NOT</th>
                    <th>What This Means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>A law firm</strong></td>
                    <td>We cannot provide legal advice or represent you</td>
                  </tr>
                  <tr>
                    <td><strong>A medical provider</strong></td>
                    <td>We cannot diagnose, treat, or provide medical advice</td>
                  </tr>
                  <tr>
                    <td><strong>A government agency</strong></td>
                    <td>We are not affiliated with HRSA, HHS, or any government body</td>
                  </tr>
                  <tr>
                    <td><strong>A claims processor</strong></td>
                    <td>We cannot file claims or guarantee compensation</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 3. Important Disclaimers */}
            <section className="legal-section" id="disclaimers">
              <h2>3. Important Disclaimers</h2>

              <h3>No Legal Advice</h3>
              <p><strong>NOTHING ON THIS SITE CONSTITUTES LEGAL ADVICE.</strong></p>
              <p>
                The information provided is for educational and advocacy purposes only.
                It is not a substitute for professional legal counsel. If you have a vaccine injury claim or legal questions:
              </p>
              <ul>
                <li>Consult a licensed attorney in your jurisdiction</li>
                <li>Contact a lawyer who specializes in vaccine injury cases</li>
                <li>Review official government resources (HRSA, CICP, VICP)</li>
              </ul>
              <p>We make no representations about the outcome of any claim or legal proceeding.</p>

              <h3>No Medical Advice</h3>
              <p><strong>NOTHING ON THIS SITE CONSTITUTES MEDICAL ADVICE.</strong></p>
              <p>We do not:</p>
              <ul>
                <li>Diagnose medical conditions</li>
                <li>Recommend treatments</li>
                <li>Provide medical opinions on whether an injury is vaccine-related</li>
              </ul>
              <p>If you are experiencing health issues:</p>
              <ul>
                <li>Consult a licensed healthcare provider</li>
                <li>Seek emergency care if needed</li>
                <li>Do not delay treatment based on information from this Site</li>
              </ul>

              <h3>Information Accuracy</h3>
              <p>We strive to provide accurate, up-to-date information based on:</p>
              <ul>
                <li>Official government data (HRSA, GAO, CRS)</li>
                <li>Published research and reports</li>
                <li>Public records</li>
              </ul>
              <p>However:</p>
              <ul>
                <li>Information may become outdated</li>
                <li>We may make unintentional errors</li>
                <li>Laws and programs may change</li>
              </ul>
              <p><strong>Always verify information</strong> with official sources before making decisions.</p>

              <h3>No Guarantees</h3>
              <p>We do not guarantee that:</p>
              <ul>
                <li>Using our Site will result in compensation</li>
                <li>Contacting representatives will change legislation</li>
                <li>Survey participation will influence policy</li>
                <li>Any specific outcome will occur</li>
              </ul>
            </section>

            {/* 4. Eligibility */}
            <section className="legal-section" id="eligibility">
              <h2>4. Eligibility</h2>
              <p>To use this Site, you must:</p>
              <ul>
                <li>Be at least <strong>13 years old</strong></li>
                <li>If under 18, have parental or guardian consent</li>
                <li>Not be prohibited from using the Site under applicable law</li>
                <li>Agree to these Terms</li>
              </ul>
              <p>
                If you are using the Site on behalf of an organization, you represent that you have
                authority to bind that organization to these Terms.
              </p>
            </section>

            {/* 5. Your Use of the Site */}
            <section className="legal-section" id="use">
              <h2>5. Your Use of the Site</h2>

              <h3>Permitted Uses</h3>
              <p>You may use the Site to:</p>
              <ul>
                <li>Learn about vaccine injury compensation programs</li>
                <li>Complete our survey (voluntarily)</li>
                <li>Look up your congressional representatives</li>
                <li>Subscribe to email updates</li>
                <li>Share our content on social media (with attribution)</li>
                <li>Contact your representatives using our tools and templates</li>
              </ul>

              <h3>Prohibited Uses</h3>
              <p>You may NOT use the Site to:</p>
              <ul>
                <li>Violate any applicable law or regulation</li>
                <li>Harass, threaten, or harm others</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Impersonate another person or entity</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the Site&apos;s operation or security</li>
                <li>Scrape, crawl, or harvest data without permission</li>
                <li>Use automated systems (bots) to access the Site excessively</li>
                <li>Distribute malware, viruses, or harmful code</li>
                <li>Send spam or unsolicited communications</li>
                <li>Use the Site for commercial purposes without authorization</li>
                <li>Reproduce our content for commercial gain</li>
              </ul>

              <h3>Consequences of Violation</h3>
              <p>If you violate these Terms, we may:</p>
              <ul>
                <li>Remove your content</li>
                <li>Block your access to the Site</li>
                <li>Report illegal activity to law enforcement</li>
                <li>Pursue legal remedies</li>
              </ul>
            </section>

            {/* 6. User Content */}
            <section className="legal-section" id="user-content">
              <h2>6. User Content</h2>

              <h3>What Is User Content?</h3>
              <p>&quot;User Content&quot; includes any information you submit through:</p>
              <ul>
                <li>Survey responses</li>
                <li>Contact forms</li>
                <li>Email communications</li>
                <li>Comments or feedback</li>
              </ul>

              <h3>Your Responsibilities</h3>
              <p>By submitting User Content, you represent that:</p>
              <ul>
                <li>The information is truthful and accurate to the best of your knowledge</li>
                <li>You have the right to share the information</li>
                <li>The content does not violate any third party&apos;s rights</li>
                <li>The content does not contain illegal, defamatory, or harmful material</li>
              </ul>

              <h3>License Grant</h3>
              <p>
                By submitting User Content, you grant us a <strong>non-exclusive, royalty-free, worldwide license</strong> to:
              </p>
              <ul>
                <li>Use, store, and process your content for advocacy purposes</li>
                <li>Aggregate and anonymize data for research and public education</li>
                <li>Share anonymized, aggregate statistics publicly</li>
              </ul>
              <p><strong>We will NOT:</strong></p>
              <ul>
                <li>Publish your individual responses with identifying information without consent</li>
                <li>Sell your User Content to third parties</li>
                <li>Use your content for purposes unrelated to our advocacy mission</li>
              </ul>

              <h3>Feedback</h3>
              <p>
                If you provide suggestions, ideas, or feedback about our Site, you grant us the right
                to use that feedback without obligation to you.
              </p>
            </section>

            {/* 7. Intellectual Property */}
            <section className="legal-section" id="ip">
              <h2>7. Intellectual Property</h2>

              <h3>Our Content</h3>
              <p>
                The Site and its original content, features, and functionality are owned by Aletheia LLC
                and are protected by:
              </p>
              <ul>
                <li>Copyright law</li>
                <li>Trademark law</li>
                <li>Other intellectual property rights</li>
              </ul>
              <p>This includes:</p>
              <ul>
                <li>Website design and layout</li>
                <li>Text, graphics, and images we create</li>
                <li>Logos and branding</li>
                <li>Software and code</li>
                <li>Data visualizations and infographics</li>
              </ul>

              <h3>Limited License to You</h3>
              <p>We grant you a limited, non-exclusive, non-transferable license to:</p>
              <ul>
                <li>Access and view the Site for personal, non-commercial use</li>
                <li>Share links to our content</li>
                <li>Quote brief excerpts with attribution</li>
              </ul>

              <h3>Restrictions</h3>
              <p>You may NOT:</p>
              <ul>
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our trademarks or branding without authorization</li>
                <li>Remove copyright or attribution notices</li>
                <li>Create derivative works based on our content</li>
                <li>Use our content for commercial purposes</li>
              </ul>

              <h3>Government Data</h3>
              <p>
                Much of the data we present comes from public government sources (HRSA, GAO, CRS, etc.).
                This underlying government data is in the public domain. Our original analysis, presentation,
                and commentary remain our intellectual property.
              </p>

              <h3>DMCA / Copyright Complaints</h3>
              <p>If you believe content on our Site infringes your copyright, please contact us at:</p>
              <p><strong>Email:</strong> <a href="mailto:legal@covidvaccineinjury.us">legal@covidvaccineinjury.us</a></p>
              <p>Include:</p>
              <ul>
                <li>Description of the copyrighted work</li>
                <li>Location of the allegedly infringing content</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief</li>
                <li>Your signature (electronic is acceptable)</li>
              </ul>
            </section>

            {/* 8. Third-Party Links & Services */}
            <section className="legal-section" id="third-party">
              <h2>8. Third-Party Links &amp; Services</h2>

              <h3>External Links</h3>
              <p>Our Site may contain links to third-party websites, including:</p>
              <ul>
                <li>Government agencies (HRSA, Congress.gov, etc.)</li>
                <li>News articles and research</li>
                <li>Advocacy partner organizations</li>
                <li>Social media platforms</li>
              </ul>
              <p><strong>We are not responsible for:</strong></p>
              <ul>
                <li>The content, accuracy, or practices of third-party sites</li>
                <li>Any transactions you conduct with third parties</li>
                <li>Privacy practices of external websites</li>
              </ul>
              <p>Visiting third-party sites is at your own risk. Review their terms and privacy policies.</p>

              <h3>Third-Party Services</h3>
              <p>
                We use third-party services to operate the Site
                (see our <Link href="/privacy">Privacy Policy</Link> for details).
                These services have their own terms:
              </p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Their Terms</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Vercel</strong></td>
                    <td><a href="https://vercel.com/legal/terms" target="_blank" rel="noopener noreferrer">vercel.com/legal/terms</a></td>
                  </tr>
                  <tr>
                    <td><strong>Google Analytics</strong></td>
                    <td><a href="https://marketingplatform.google.com/about/analytics/terms/us/" target="_blank" rel="noopener noreferrer">google.com/analytics/terms</a></td>
                  </tr>
                  <tr>
                    <td><strong>Google Civic API</strong></td>
                    <td><a href="https://developers.google.com/terms" target="_blank" rel="noopener noreferrer">developers.google.com/terms</a></td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 9. Representative Lookup Tool */}
            <section className="legal-section" id="rep-lookup">
              <h2>9. Representative Lookup Tool</h2>

              <h3>How It Works</h3>
              <p>
                Our representative lookup tool uses your ZIP code to identify your congressional
                representatives via the Google Civic Information API.
              </p>

              <h3>Limitations</h3>
              <ul>
                <li>Results depend on Google&apos;s data accuracy</li>
                <li>District boundaries may change</li>
                <li>Contact information may become outdated</li>
                <li>We do not guarantee accuracy of representative information</li>
              </ul>

              <h3>Your Responsibility</h3>
              <ul>
                <li>Verify representative information before contacting</li>
                <li>You are solely responsible for communications you send to representatives</li>
                <li>We do not endorse any particular representative or political party</li>
              </ul>

              <h3>Message Templates</h3>
              <p>We provide suggested message templates for contacting representatives. These are:</p>
              <ul>
                <li>Starting points, not required scripts</li>
                <li>Editable and customizable by you</li>
                <li>Your responsibility once sent</li>
              </ul>
              <p>We are not responsible for any consequences of communications you send to elected officials.</p>
            </section>

            {/* 10. Limitation of Liability */}
            <section className="legal-section" id="liability">
              <h2>10. Limitation of Liability</h2>

              <h3>Disclaimer of Warranties</h3>
              <p>
                THE SITE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                EXPRESS OR IMPLIED.
              </p>
              <p>We disclaim all warranties, including but not limited to:</p>
              <ul>
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy or completeness of information</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of the Site</li>
              </ul>

              <h3>Limitation of Damages</h3>
              <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
              <p>
                Aletheia LLC, its officers, directors, employees, agents, and affiliates shall NOT be
                liable for any:
              </p>
              <ul>
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, or goodwill</li>
                <li>Damages arising from your use or inability to use the Site</li>
                <li>Damages arising from any content or conduct of third parties</li>
                <li>Damages related to any claim or legal proceeding</li>
              </ul>
              <p>
                <strong>IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED $100 USD</strong> or the amount you
                paid us (if any) in the 12 months preceding the claim, whichever is greater.
              </p>

              <h3>Exceptions</h3>
              <p>
                Some jurisdictions do not allow limitation of certain damages. In such cases, our
                liability is limited to the maximum extent permitted by law.
              </p>

              <h3>Basis of the Bargain</h3>
              <p>
                You acknowledge that we have set our prices (free) and entered into these Terms in
                reliance upon the disclaimers and limitations in this section, which form an essential
                basis of the bargain between us.
              </p>
            </section>

            {/* 11. Indemnification */}
            <section className="legal-section" id="indemnification">
              <h2>11. Indemnification</h2>
              <p>
                You agree to <strong>indemnify, defend, and hold harmless</strong> Aletheia LLC and its
                officers, directors, employees, agents, and affiliates from any claims, damages, losses,
                liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from:
              </p>
              <ul>
                <li>Your use of the Site</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any law or third-party rights</li>
                <li>User Content you submit</li>
                <li>Communications you send to third parties (including representatives)</li>
              </ul>
              <p>
                We reserve the right to assume exclusive defense of any claim subject to indemnification,
                and you agree to cooperate with our defense.
              </p>
            </section>

            {/* 12. Termination */}
            <section className="legal-section" id="termination">
              <h2>12. Termination</h2>

              <h3>By You</h3>
              <p>
                You may stop using the Site at any time. To delete your data,
                see our <Link href="/privacy">Privacy Policy</Link>.
              </p>

              <h3>By Us</h3>
              <p>
                We may suspend or terminate your access to the Site at any time, for any reason,
                without notice, including if we believe you have violated these Terms.
              </p>

              <h3>Effect of Termination</h3>
              <p>Upon termination:</p>
              <ul>
                <li>Your right to use the Site ceases immediately</li>
                <li>Provisions that should survive (disclaimers, limitations, indemnification) remain in effect</li>
                <li>We may delete your User Content (subject to our data retention policies)</li>
              </ul>
            </section>

            {/* 13. Dispute Resolution */}
            <section className="legal-section" id="disputes">
              <h2>13. Dispute Resolution</h2>

              <h3>Informal Resolution First</h3>
              <p>
                Before filing any formal legal action, you agree to contact us and attempt to resolve
                the dispute informally for at least <strong>30 days</strong>.
              </p>
              <p><strong>Email:</strong> <a href="mailto:legal@covidvaccineinjury.us">legal@covidvaccineinjury.us</a></p>
              <p><strong>Subject:</strong> &quot;Dispute Resolution Request&quot;</p>
              <p>Many concerns can be resolved quickly through direct communication.</p>

              <h3>Binding Arbitration</h3>
              <p>
                If informal resolution fails, any dispute shall be resolved by <strong>binding arbitration</strong> administered
                by the American Arbitration Association (AAA) under its Consumer Arbitration Rules.
              </p>
              <ul>
                <li>Arbitration will be conducted in Wyoming or remotely</li>
                <li>The arbitrator&apos;s decision is final and binding</li>
                <li>Judgment may be entered in any court of competent jurisdiction</li>
              </ul>

              <h3>Class Action Waiver</h3>
              <p><strong>YOU AGREE TO RESOLVE DISPUTES INDIVIDUALLY.</strong></p>
              <p>You waive any right to:</p>
              <ul>
                <li>Participate in a class action lawsuit</li>
                <li>Participate in class-wide arbitration</li>
                <li>Serve as a representative in any class proceeding</li>
              </ul>

              <h3>Exceptions</h3>
              <p>The following are NOT subject to arbitration:</p>
              <ul>
                <li>Claims that may be brought in small claims court</li>
                <li>Requests for injunctive relief to stop unauthorized use or abuse</li>
                <li>Claims related to intellectual property infringement</li>
              </ul>

              <h3>Opt-Out</h3>
              <p>
                You may opt out of arbitration by sending written notice within <strong>30 days</strong> of
                first using the Site to:
              </p>
              <p><strong>Email:</strong> <a href="mailto:legal@covidvaccineinjury.us">legal@covidvaccineinjury.us</a></p>
              <p><strong>Subject:</strong> &quot;Arbitration Opt-Out&quot;</p>
              <p>Include your name, address, and a clear statement that you opt out.</p>
            </section>

            {/* 14. Governing Law */}
            <section className="legal-section" id="governing-law">
              <h2>14. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the <strong>State of Wyoming</strong>, United States,
                without regard to conflict of law principles.
              </p>
              <p>
                If arbitration does not apply, you consent to the exclusive jurisdiction of state and
                federal courts located in Wyoming.
              </p>
            </section>

            {/* 15. Changes to These Terms */}
            <section className="legal-section" id="changes">
              <h2>15. Changes to These Terms</h2>
              <p>We may modify these Terms at any time by posting the revised version on this page.</p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Change Type</th>
                    <th>How We Notify You</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Minor changes</strong></td>
                    <td>Updated &quot;Last Updated&quot; date</td>
                  </tr>
                  <tr>
                    <td><strong>Material changes</strong></td>
                    <td>Email notice (if subscribed) + prominent Site notice</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>Your continued use</strong> of the Site after changes are posted constitutes acceptance.</p>
              <p>If you disagree with changes, your sole remedy is to stop using the Site.</p>
            </section>

            {/* 16. Severability */}
            <section className="legal-section" id="severability">
              <h2>16. Severability</h2>
              <p>If any provision of these Terms is found to be unenforceable or invalid:</p>
              <ul>
                <li>That provision will be modified to the minimum extent necessary to make it enforceable</li>
                <li>Or, if modification is not possible, it will be severed</li>
                <li>The remaining provisions will continue in full force and effect</li>
              </ul>
            </section>

            {/* 17. Contact Us */}
            <section className="legal-section" id="contact">
              <h2>17. Contact Us</h2>
              <p><strong>Questions about these Terms?</strong></p>
              <table className="legal-table">
                <tbody>
                  <tr>
                    <th>General inquiries</th>
                    <td><a href="mailto:info@covidvaccineinjury.us">info@covidvaccineinjury.us</a></td>
                  </tr>
                  <tr>
                    <th>Legal matters</th>
                    <td><a href="mailto:legal@covidvaccineinjury.us">legal@covidvaccineinjury.us</a></td>
                  </tr>
                  <tr>
                    <th>Privacy requests</th>
                    <td><a href="mailto:privacy@covidvaccineinjury.us">privacy@covidvaccineinjury.us</a></td>
                  </tr>
                </tbody>
              </table>
              <div className="legal-contact">
                <p><strong>Aletheia LLC</strong></p>
                <p>Operating as U.S. Covid Vaccine Injuries</p>
                <p>State of Incorporation: Wyoming</p>
              </div>
            </section>

            {/* Additional Provisions */}
            <section className="legal-section">
              <h2>Additional Provisions</h2>

              <h3>Entire Agreement</h3>
              <p>
                These Terms, together with our <Link href="/privacy">Privacy Policy</Link>, constitute the
                entire agreement between you and Aletheia LLC regarding your use of the Site.
              </p>

              <h3>Waiver</h3>
              <p>Our failure to enforce any provision of these Terms does not waive our right to enforce it later.</p>

              <h3>Assignment</h3>
              <p>
                You may not assign or transfer your rights under these Terms. We may assign our rights
                without restriction.
              </p>

              <h3>Headings</h3>
              <p>Section headings are for convenience only and do not affect interpretation.</p>

              <h3>Electronic Communications</h3>
              <p>
                By using the Site, you consent to receive electronic communications from us. You agree
                that all agreements, notices, and disclosures provided electronically satisfy any legal
                requirement that such communications be in writing.
              </p>

              <p className="legal-note">
                <em>
                  These Terms of Service are designed to be fair and transparent.
                  If you have questions, please contact us before using the Site.
                </em>
              </p>
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
