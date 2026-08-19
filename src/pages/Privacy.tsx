import { Link } from "react-router-dom";
import { org } from "../data/org";
import "./Legal.css";

const updated = "August 18, 2026";

export function Privacy() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-inner">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>Last updated {updated}. Applies to {org.dbaName} (“ACAC,” “we,” “us”).</p>
        </div>
      </section>

      <section className="legal-body">
        <div className="legal-inner">
          <p className="legal-note">
            This page is a short privacy notice for the association website. It is not legal advice.
            Have counsel review it before you rely on it for compliance.
          </p>

          <h2>1. What we collect</h2>
          <p>Depending on how you use the site, we may collect:</p>
          <ul>
            <li>
              <strong>Membership application data:</strong> name, company, trade/specialty, phone,
              email, password, business details, professional references, and work-sample photos you
              upload for vetting
            </li>
            <li>
              <strong>Lounge activity:</strong> bid posts, discussion posts, and anonymous forum
              posts you choose to send
            </li>
            <li>
              <strong>Admin actions:</strong> approval/rejection decisions and related timestamps
            </li>
            <li>
              <strong>Basic technical data:</strong> browser storage needed to keep you signed in,
              and standard hosting logs if enabled by our providers
            </li>
          </ul>

          <h2>2. How we use information</h2>
          <ul>
            <li>Operate membership, login, and admin review</li>
            <li>Publish approved members in the public directory (name, company, trade, phone)</li>
            <li>
              Host anonymous member-forum posts for approved members only (poster identity is not
              shown)
            </li>
            <li>Improve site reliability and prevent abuse</li>
          </ul>

          <h2>3. Public vs members-only information</h2>
          <ul>
            <li>
              <strong>Public:</strong> association marketing content, permit links, and the vetted
              member directory fields listed above
            </li>
            <li>
              <strong>Members only:</strong> bid board, discussions, anonymous member forum, and
              admin tools
            </li>
          </ul>
          <p>
            Anonymous forum posts are not intended for public search engines or non-member visitors.
            Poster identity is not shown on the member-facing forum.
          </p>

          <h2>4. Anonymous forum and privacy</h2>
          <p>
            Forum posts may include names and business details that a member chooses to write. Do
            not submit sensitive identifiers (SSNs, financial account numbers, medical data, or
            children’s information). Admins may remove posts that include unnecessary personal data
            or misuse the forum.
          </p>

          <h2>5. Where data is stored</h2>
          <ul>
            <li>
              <strong>Demo / early mode:</strong> some data may be stored only in your browser
              (local storage) on your device
            </li>
            <li>
              <strong>Production mode:</strong> when cloud hosting is connected, membership and
              lounge data are stored with our database provider so accounts work across devices
            </li>
          </ul>
          <p>
            Current public site: {org.publicUrl}
          </p>

          <h2>6. Sharing</h2>
          <p>We do not sell personal information. We may share information:</p>
          <ul>
            <li>With approved members, when a feature is designed for member viewing</li>
            <li>With service providers who host the site or database</li>
            <li>If required by law, or to protect rights and safety</li>
          </ul>

          <h2>7. Retention</h2>
          <p>
            We keep membership and forum records while needed for association operations, dispute
            handling, and legal obligations. You may request correction or removal of your own
            membership profile by contacting ACAC; some records may be retained if required for
            integrity of prior admin decisions.
          </p>

          <h2>8. Security</h2>
          <p>
            We use reasonable administrative and technical safeguards. No online system is 100%
            secure. Use a unique password and do not share lounge access.
          </p>

          <h2>9. Children’s privacy</h2>
          <p>
            This site is intended for adults operating in the construction trades. It is not
            directed to children under 13.
          </p>

          <h2>10. Your choices</h2>
          <ul>
            <li>You can decline to apply for membership</li>
            <li>You can choose what to post in the lounge</li>
            <li>You can sign out and stop using member tools</li>
            <li>You may contact ACAC to update inaccurate profile information</li>
          </ul>

          <h2>11. Changes</h2>
          <p>
            We may update this Privacy Policy. The “Last updated” date will change when we do.
          </p>

          <h2>12. Contact</h2>
          <p>
            Privacy questions should go to the association organizers through the contact method
            published on the site once your support email is set.
          </p>

          <p className="legal-related">
            See also our <Link to="/terms">Terms of Use</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
