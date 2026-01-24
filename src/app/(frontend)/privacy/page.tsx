'use client'

import '../styles.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 18, 2026'

  return (
    <div>
      <Header />

      <main className="legal-page">
        <div className="legal-container">
          <div className="legal-header">
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last Updated: {lastUpdated}</p>
          </div>

          <div className="legal-content">
            {/* Quick Summary */}
            <section className="legal-section legal-summary">
              <h2>Quick Summary</h2>
              <p><strong>We respect your privacy.</strong> Here&apos;s the short version:</p>
              <table className="legal-table">
                <tbody>
                  <tr>
                    <th>What we collect</th>
                    <td>Survey responses, email (if you opt in), ZIP code for rep lookup</td>
                  </tr>
                  <tr>
                    <th>Why</th>
                    <td>To support vaccine injury compensation reform and keep you informed</td>
                  </tr>
                  <tr>
                    <th>Who sees it</th>
                    <td>Only us and essential service providers—we never sell your data</td>
                  </tr>
                  <tr>
                    <th>Your control</th>
                    <td>You can access, correct, or delete your data anytime</td>
                  </tr>
                  <tr>
                    <th>Contact</th>
                    <td><a href="mailto:privacy@covidvaccineinjury.us">privacy@covidvaccineinjury.us</a></td>
                  </tr>
                </tbody>
              </table>
              <p className="legal-note"><em>Read the full policy below for complete details.</em></p>
            </section>

            {/* Table of Contents */}
            <section className="legal-section">
              <h2>Table of Contents</h2>
              <ol className="legal-toc">
                <li><a href="#who-we-are">Who We Are</a></li>
                <li><a href="#information-we-collect">Information We Collect</a></li>
                <li><a href="#how-we-use">How We Use Your Information</a></li>
                <li><a href="#sensitive-health">Sensitive Health Information</a></li>
                <li><a href="#information-sharing">Information Sharing</a></li>
                <li><a href="#third-party">Third-Party Services</a></li>
                <li><a href="#cookies">Cookies &amp; Analytics</a></li>
                <li><a href="#data-security">Data Security</a></li>
                <li><a href="#data-retention">Data Retention</a></li>
                <li><a href="#your-rights">Your Rights</a></li>
                <li><a href="#state-privacy">State Privacy Rights</a></li>
                <li><a href="#childrens-privacy">Children&apos;s Privacy</a></li>
                <li><a href="#international">International Users</a></li>
                <li><a href="#changes">Changes to This Policy</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ol>
            </section>

            {/* 1. Who We Are */}
            <section className="legal-section" id="who-we-are">
              <h2>1. Who We Are</h2>
              <p>
                Aletheia LLC, operating as <strong>U.S. Covid Vaccine Injuries</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;),
                operates the website <a href="https://www.covidvaccineinjury.us">covidvaccineinjury.us</a> (the &quot;Site&quot;).
              </p>
              <p>
                We are a health policy advocacy organization working to reform COVID-19 vaccine injury compensation
                in the United States. We are not a healthcare provider, law firm, or government agency.
              </p>
              <p>
                <strong>Our mission:</strong> Advocate for transferring COVID-19 vaccine injury claims from the
                Countermeasures Injury Compensation Program (CICP) to the National Vaccine Injury Compensation Program (VICP).
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section className="legal-section" id="information-we-collect">
              <h2>2. Information We Collect</h2>

              <h3>Information You Provide Directly</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Data Type</th>
                    <th>When Collected</th>
                    <th>Required?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Survey responses</strong></td>
                    <td>When you complete our survey</td>
                    <td>Voluntary</td>
                  </tr>
                  <tr>
                    <td><strong>Email address</strong></td>
                    <td>When you subscribe to updates</td>
                    <td>Voluntary</td>
                  </tr>
                  <tr>
                    <td><strong>ZIP code</strong></td>
                    <td>Representative lookup or survey</td>
                    <td>Voluntary</td>
                  </tr>
                  <tr>
                    <td><strong>Injury details</strong></td>
                    <td>Survey questions about your experience</td>
                    <td>Voluntary</td>
                  </tr>
                  <tr>
                    <td><strong>Contact messages</strong></td>
                    <td>When you email or message us</td>
                    <td>Voluntary</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>Important:</strong> All information you provide is voluntary. You can use our educational resources without providing any personal information.</p>

              <h3>Information Collected Automatically</h3>
              <p>When you visit our Site, we automatically collect:</p>
              <ul>
                <li><strong>Device information:</strong> Browser type, operating system, screen size</li>
                <li><strong>Usage data:</strong> Pages visited, time on site, referring URL</li>
                <li><strong>IP address:</strong> Used to determine general geographic location (city/region level)</li>
                <li><strong>Cookies:</strong> Small files stored on your device (see <a href="#cookies">Cookies &amp; Analytics</a>)</li>
              </ul>

              <h3>Information We Do NOT Collect</h3>
              <ul>
                <li>Social Security numbers</li>
                <li>Medical records or documentation</li>
                <li>Financial information or payment details</li>
                <li>Biometric data</li>
                <li>Precise geolocation (GPS)</li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
            <section className="legal-section" id="how-we-use">
              <h2>3. How We Use Your Information</h2>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Purpose</th>
                    <th>Legal Basis</th>
                    <th>Data Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Advocacy &amp; research</strong></td>
                    <td>Legitimate interest</td>
                    <td>Aggregate survey data</td>
                  </tr>
                  <tr>
                    <td><strong>Email updates</strong></td>
                    <td>Your consent</td>
                    <td>Email address</td>
                  </tr>
                  <tr>
                    <td><strong>Representative lookup</strong></td>
                    <td>Service delivery</td>
                    <td>ZIP code (not stored)</td>
                  </tr>
                  <tr>
                    <td><strong>Site improvement</strong></td>
                    <td>Legitimate interest</td>
                    <td>Analytics data</td>
                  </tr>
                  <tr>
                    <td><strong>Respond to inquiries</strong></td>
                    <td>Service delivery</td>
                    <td>Contact information</td>
                  </tr>
                  <tr>
                    <td><strong>Legal compliance</strong></td>
                    <td>Legal obligation</td>
                    <td>As required</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>We do NOT use your information to:</strong></p>
              <ul>
                <li>Sell to third parties</li>
                <li>Target advertising</li>
                <li>Make automated decisions about you</li>
                <li>Contact you without consent</li>
              </ul>
            </section>

            {/* 4. Sensitive Health Information */}
            <section className="legal-section" id="sensitive-health">
              <h2>4. Sensitive Health Information</h2>
              <p>Our survey may collect information about your health experiences, including:</p>
              <ul>
                <li>Whether you experienced a vaccine-related injury</li>
                <li>Types of symptoms or conditions</li>
                <li>Whether you filed a compensation claim</li>
                <li>Claim outcomes</li>
              </ul>

              <h3>How we protect this information:</h3>
              <ol>
                <li><strong>Anonymization:</strong> Survey responses are stored separately from identifying information when possible</li>
                <li><strong>Aggregation:</strong> We only publish aggregate statistics (e.g., &quot;73% of respondents experienced X&quot;)</li>
                <li><strong>No medical advice:</strong> We do not use this information to provide medical advice or diagnosis</li>
                <li><strong>Limited access:</strong> Only authorized team members can access individual responses</li>
                <li><strong>Encryption:</strong> Health-related data is encrypted in transit and at rest</li>
              </ol>
              <p><strong>Your choice:</strong> You can skip any survey question you&apos;re not comfortable answering.</p>
            </section>

            {/* 5. Information Sharing */}
            <section className="legal-section" id="information-sharing">
              <h2>5. Information Sharing</h2>

              <h3>We Share Information With:</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>What We Share</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Service providers</strong></td>
                    <td>Technical data</td>
                    <td>Hosting, email delivery, analytics</td>
                  </tr>
                  <tr>
                    <td><strong>Advocacy partners</strong></td>
                    <td>Aggregate data only</td>
                    <td>Coordinated reform efforts</td>
                  </tr>
                  <tr>
                    <td><strong>Public</strong></td>
                    <td>Anonymous statistics</td>
                    <td>Educational content, advocacy</td>
                  </tr>
                  <tr>
                    <td><strong>Legal authorities</strong></td>
                    <td>As required by law</td>
                    <td>Legal compliance</td>
                  </tr>
                </tbody>
              </table>

              <h3>We Do NOT:</h3>
              <ul>
                <li>Sell your personal information</li>
                <li>Share individual survey responses publicly</li>
                <li>Provide your contact info to political campaigns</li>
                <li>Share data with advertisers</li>
              </ul>

              <h3>Advocacy Partners</h3>
              <p>We work with allied organizations advocating for vaccine injury compensation reform, such as:</p>
              <ul>
                <li><a href="https://react19.org" target="_blank" rel="noopener noreferrer">React19.org</a></li>
                <li>Vaccine Injured Petitioners Bar Association</li>
                <li>Other 501(c)(3) and 501(c)(4) health advocacy groups</li>
              </ul>
              <p>
                When we share with partners, we share <strong>aggregate, anonymized data only</strong> (e.g., &quot;12,000 survey
                respondents support VICP transfer&quot;). We do not share your email, name, or individual responses without
                your explicit consent.
              </p>
            </section>

            {/* 6. Third-Party Services */}
            <section className="legal-section" id="third-party">
              <h2>6. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Purpose</th>
                    <th>Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Vercel</strong></td>
                    <td>Website hosting</td>
                    <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></td>
                  </tr>
                  <tr>
                    <td><strong>Payload CMS</strong></td>
                    <td>Content management &amp; survey storage</td>
                    <td><a href="https://payloadcms.com/privacy" target="_blank" rel="noopener noreferrer">payloadcms.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td><strong>Google Analytics</strong></td>
                    <td>Site usage analytics</td>
                    <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td><strong>Google Civic API</strong></td>
                    <td>Representative lookup</td>
                    <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></td>
                  </tr>
                </tbody>
              </table>
              <p>These providers are contractually obligated to:</p>
              <ul>
                <li>Process data only as we instruct</li>
                <li>Maintain appropriate security measures</li>
                <li>Not use your data for their own purposes</li>
              </ul>
            </section>

            {/* 7. Cookies & Analytics */}
            <section className="legal-section" id="cookies">
              <h2>7. Cookies &amp; Analytics</h2>

              <h3>What Are Cookies?</h3>
              <p>Cookies are small text files stored on your device that help us understand how you use our Site.</p>

              <h3>Cookies We Use</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Cookie Type</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                    <th>Required?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Essential</strong></td>
                    <td>Site functionality</td>
                    <td>Session</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td><strong>Analytics</strong></td>
                    <td>Usage statistics</td>
                    <td>2 years</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td><strong>Preferences</strong></td>
                    <td>Remember your choices</td>
                    <td>1 year</td>
                    <td>No</td>
                  </tr>
                </tbody>
              </table>

              <h3>Google Analytics</h3>
              <p>We use Google Analytics 4 to understand:</p>
              <ul>
                <li>How many people visit our Site</li>
                <li>Which pages are most viewed</li>
                <li>How visitors find us (search, social, direct)</li>
                <li>General geographic distribution of visitors</li>
              </ul>
              <p><strong>What Google Analytics collects:</strong></p>
              <ul>
                <li>Pages viewed and time on page</li>
                <li>Device and browser information</li>
                <li>Approximate location (city level)</li>
                <li>Referring website</li>
              </ul>
              <p><strong>What it does NOT collect:</strong></p>
              <ul>
                <li>Your name or email</li>
                <li>Survey responses</li>
                <li>Any information you type into forms</li>
              </ul>

              <h3>Managing Cookies</h3>
              <p>You can control cookies through:</p>
              <ol>
                <li><strong>Browser settings:</strong> Most browsers let you block or delete cookies</li>
                <li><strong>Google Analytics opt-out:</strong> Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
                <li><strong>Do Not Track:</strong> We honor Do Not Track browser signals</li>
              </ol>
              <p><strong>Note:</strong> Blocking essential cookies may affect Site functionality.</p>
            </section>

            {/* 8. Data Security */}
            <section className="legal-section" id="data-security">
              <h2>8. Data Security</h2>
              <p>We implement industry-standard security measures:</p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Encryption in transit</strong></td>
                    <td>All data transmitted via HTTPS/TLS</td>
                  </tr>
                  <tr>
                    <td><strong>Encryption at rest</strong></td>
                    <td>Database encryption for stored data</td>
                  </tr>
                  <tr>
                    <td><strong>Access controls</strong></td>
                    <td>Role-based access, principle of least privilege</td>
                  </tr>
                  <tr>
                    <td><strong>Secure hosting</strong></td>
                    <td>Enterprise-grade cloud infrastructure</td>
                  </tr>
                  <tr>
                    <td><strong>Regular updates</strong></td>
                    <td>Security patches applied promptly</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>No system is 100% secure.</strong> While we take reasonable precautions, we cannot guarantee
                absolute security. If you believe your data has been compromised, contact us immediately.
              </p>
            </section>

            {/* 9. Data Retention */}
            <section className="legal-section" id="data-retention">
              <h2>9. Data Retention</h2>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Data Type</th>
                    <th>Retention Period</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Survey responses</strong></td>
                    <td>7 years or until legislation passes</td>
                    <td>Historical advocacy record</td>
                  </tr>
                  <tr>
                    <td><strong>Email subscribers</strong></td>
                    <td>Until you unsubscribe + 30 days</td>
                    <td>Communication + grace period</td>
                  </tr>
                  <tr>
                    <td><strong>Analytics data</strong></td>
                    <td>26 months</td>
                    <td>Google Analytics default</td>
                  </tr>
                  <tr>
                    <td><strong>Contact inquiries</strong></td>
                    <td>3 years</td>
                    <td>Follow-up and records</td>
                  </tr>
                  <tr>
                    <td><strong>ZIP code lookups</strong></td>
                    <td>Not stored</td>
                    <td>Processed in real-time only</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>After retention periods expire,</strong> data is either deleted or anonymized so it can no longer identify you.</p>
              <p><strong>You can request early deletion</strong> at any time (see <a href="#your-rights">Your Rights</a>).</p>
            </section>

            {/* 10. Your Rights */}
            <section className="legal-section" id="your-rights">
              <h2>10. Your Rights</h2>
              <p>You have the right to:</p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Right</th>
                    <th>Description</th>
                    <th>How to Exercise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Access</strong></td>
                    <td>Get a copy of your data</td>
                    <td>Email us</td>
                  </tr>
                  <tr>
                    <td><strong>Correction</strong></td>
                    <td>Fix inaccurate information</td>
                    <td>Email us</td>
                  </tr>
                  <tr>
                    <td><strong>Deletion</strong></td>
                    <td>Have your data removed</td>
                    <td>Email us</td>
                  </tr>
                  <tr>
                    <td><strong>Portability</strong></td>
                    <td>Receive data in a common format</td>
                    <td>Email us</td>
                  </tr>
                  <tr>
                    <td><strong>Opt-out</strong></td>
                    <td>Stop receiving emails</td>
                    <td>Unsubscribe link or email us</td>
                  </tr>
                  <tr>
                    <td><strong>Withdraw consent</strong></td>
                    <td>Change your mind anytime</td>
                    <td>Email us</td>
                  </tr>
                </tbody>
              </table>

              <h3>How to Exercise Your Rights</h3>
              <p><strong>Email:</strong> <a href="mailto:privacy@covidvaccineinjury.us">privacy@covidvaccineinjury.us</a></p>
              <p><strong>Subject line:</strong> &quot;Privacy Request - [Your Request Type]&quot;</p>
              <p><strong>What to include:</strong></p>
              <ul>
                <li>Your name (if you provided it)</li>
                <li>Email address associated with your data</li>
                <li>Specific request (access, deletion, etc.)</li>
              </ul>
              <p><strong>Response time:</strong> We will respond within 30 days. Complex requests may take up to 45 days, and we&apos;ll notify you if we need more time.</p>
              <p><strong>Verification:</strong> We may ask you to verify your identity to protect against unauthorized requests.</p>
            </section>

            {/* 11. State Privacy Rights */}
            <section className="legal-section" id="state-privacy">
              <h2>11. State Privacy Rights</h2>

              <h3>California Residents (CCPA/CPRA)</h3>
              <p>If you are a California resident, you have additional rights:</p>
              <ul>
                <li><strong>Right to know:</strong> What personal information we collect and why</li>
                <li><strong>Right to delete:</strong> Request deletion of your data</li>
                <li><strong>Right to opt-out of sale:</strong> We do not sell personal information</li>
                <li><strong>Right to non-discrimination:</strong> We won&apos;t treat you differently for exercising your rights</li>
                <li><strong>Right to correct:</strong> Fix inaccurate information</li>
                <li><strong>Right to limit sensitive data use:</strong> Control how we use health-related information</li>
              </ul>
              <p>
                <strong>To exercise California rights:</strong> Email <a href="mailto:privacy@covidvaccineinjury.us">privacy@covidvaccineinjury.us</a> with
                &quot;California Privacy Request&quot; in the subject line.
              </p>

              <h3>Virginia, Colorado, Connecticut, Utah Residents</h3>
              <p>Similar rights apply under your state&apos;s privacy laws. Contact us using the same process.</p>
            </section>

            {/* 12. Children's Privacy */}
            <section className="legal-section" id="childrens-privacy">
              <h2>12. Children&apos;s Privacy</h2>
              <p>Our Site is <strong>not intended for children under 13.</strong></p>
              <p>
                We do not knowingly collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided information to us, please contact us immediately
                at <a href="mailto:privacy@covidvaccineinjury.us">privacy@covidvaccineinjury.us</a> and we will delete it.
              </p>
              <p>If you are between 13 and 18, please get your parent or guardian&apos;s permission before providing any personal information.</p>
            </section>

            {/* 13. International Users */}
            <section className="legal-section" id="international">
              <h2>13. International Users</h2>
              <p>Our Site is operated in the <strong>United States</strong> and intended primarily for U.S. residents.</p>
              <p>If you access our Site from outside the United States:</p>
              <ul>
                <li>Your information will be transferred to and processed in the U.S.</li>
                <li>U.S. privacy laws may differ from your country&apos;s laws</li>
                <li>By using our Site, you consent to this transfer</li>
              </ul>
              <p>
                <strong>For EU/UK residents:</strong> We process data based on legitimate interest for advocacy purposes
                and your consent for communications. You may have additional rights under GDPR—contact us to exercise them.
              </p>
            </section>

            {/* 14. Changes to This Policy */}
            <section className="legal-section" id="changes">
              <h2>14. Changes to This Policy</h2>
              <p>We may update this Privacy Policy to reflect:</p>
              <ul>
                <li>Changes in our practices</li>
                <li>New features or services</li>
                <li>Legal or regulatory requirements</li>
              </ul>
              <p><strong>How we notify you:</strong></p>
              <ul>
                <li><strong>Minor changes:</strong> Updated &quot;Last Updated&quot; date</li>
                <li><strong>Material changes:</strong> Email notification (if you&apos;re subscribed) and prominent notice on our Site</li>
              </ul>
              <p><strong>Your continued use</strong> of our Site after changes constitutes acceptance of the updated policy.</p>
            </section>

            {/* 15. Contact Us */}
            <section className="legal-section" id="contact">
              <h2>15. Contact Us</h2>
              <p><strong>Questions about this Privacy Policy?</strong></p>
              <table className="legal-table">
                <tbody>
                  <tr>
                    <th>Email</th>
                    <td><a href="mailto:privacy@covidvaccineinjury.us">privacy@covidvaccineinjury.us</a></td>
                  </tr>
                  <tr>
                    <th>Website</th>
                    <td><a href="https://www.covidvaccineinjury.us">covidvaccineinjury.us</a></td>
                  </tr>
                </tbody>
              </table>
              <div className="legal-contact">
                <p><strong>Aletheia LLC</strong></p>
                <p>Operating as U.S. Covid Vaccine Injuries</p>
              </div>
              <p>We aim to respond to all privacy inquiries within 5 business days.</p>
              <p className="legal-note">
                <em>This Privacy Policy was drafted to be transparent and easy to understand. If anything is unclear, please don&apos;t hesitate to ask.</em>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
