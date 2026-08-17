import { Link } from "react-router-dom";
import { org } from "../data/org";
import "./Legal.css";

const updated = "August 16, 2026";

export function Terms() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-inner">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Use</h1>
          <p>Last updated {updated}. Applies to {org.dbaName} (“ACAC,” “we,” “us”).</p>
        </div>
      </section>

      <section className="legal-body">
        <div className="legal-inner">
          <p className="legal-note">
            This page is a practical starting template for a contractor association website. It is
            not legal advice. Have a Texas attorney review and customize it for your DBA before you
            rely on it.
          </p>

          <h2>1. Who may use this site</h2>
          <p>
            The public pages (home, member directory, education calendar, permits, and these legal
            pages) are available to visitors. Membership tools — including the Members Lounge, bid
            board, discussion boards, and the anonymous blacklist board — are limited to approved
            members and administrators.
          </p>

          <h2>2. A hub — curated education, no work warranty</h2>
          <p>
            ACAC is a hub for contractors and customers to meet and network. We may publish a
            calendar of third-party seminars and classes; we do not teach those courses ourselves
            and do not warranty or guarantee them. Listing a member does not mean ACAC warrants or
            guarantees their work, insurance, licensing, pricing, timelines, or fitness for any
            project. Visitors and members must independently verify credentials and contracts before
            hiring or working together.
          </p>

          <h2>3. Member conduct</h2>
          <p>Members agree to:</p>
          <ul>
            <li>Provide accurate information in applications and posts</li>
            <li>Use the lounge for legitimate trade networking and peer support</li>
            <li>Avoid harassment, threats, illegal content, or spam</li>
            <li>
              Post on the blacklist board only with firsthand, factual information they believe to be
              true
            </li>
          </ul>

          <h2>4. Anonymous blacklist board (important)</h2>
          <p>
            The blacklist board is an <strong>internal, members-only, anonymous, post-only</strong>{" "}
            forum. There are no replies or comments. It is not a public consumer complaint board and
            is not a court finding.
          </p>
          <ul>
            <li>
              <strong>ACAC does not bear any responsibility</strong> for what members post on this
              board. Posts are the sole responsibility of the individual who submits them.
            </li>
            <li>
              ACAC does not verify, endorse, warrant, or guarantee the accuracy of any post. Members
              must independently verify information before acting on it.
            </li>
            <li>
              Posts appear without the poster’s name. False, exaggerated, speculative, or malicious
              posts can create defamation and other legal risk for the submitting member.
            </li>
            <li>
              Do not include Social Security numbers, driver’s license numbers, bank details, medical
              information, or other sensitive personal data.
            </li>
            <li>
              Prefer documented business facts (dates, unpaid invoices, abandoned jobs) over
              opinions, insults, or rumors.
            </li>
          </ul>
          <p>
            ACAC may remove or archive posts at any time, and may suspend members who misuse the
            board.
          </p>

          <h2>5. User content license</h2>
          <p>
            By posting content (including bids, discussions, and reports), you grant ACAC a
            non-exclusive license to host, display, and moderate that content for association
            purposes.
          </p>

          <h2>6. Third-party links</h2>
          <p>
            Permit and municipality links are provided for convenience. ACAC does not control those
            sites and is not responsible for their content or availability.
          </p>

          <h2>7. Disclaimer of warranties</h2>
          <p>
            The site and membership tools are provided “as is.” To the fullest extent allowed by
            law, ACAC disclaims warranties of merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>

          <h2>8. Limitation of liability</h2>
          <p>
            To the fullest extent allowed by law, ACAC and its organizers are not liable for
            indirect, incidental, special, consequential, or punitive damages, or for decisions made
            by members or the public based on directory listings, bids, discussions, or anonymous
            blacklist board posts. ACAC does not bear responsibility for content posted by members on
            the blacklist board.
          </p>

          <h2>9. Indemnity</h2>
          <p>
            If you submit false or unlawful content — including defamatory blacklist board posts —
            you agree to defend and indemnify ACAC against related claims, damages, and expenses.
          </p>

          <h2>10. Changes</h2>
          <p>
            We may update these Terms. Continued use of the site after changes means you accept the
            updated Terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these Terms: use the association contact email once published on the
            site, or reach the organizers through your membership application channel.
          </p>

          <p className="legal-related">
            See also our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
