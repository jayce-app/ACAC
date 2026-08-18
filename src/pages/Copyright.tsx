import { company } from "../data/content";
import "./Copyright.css";

const year = new Date().getFullYear();

export function Copyright() {
  return (
    <div className="copyright-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Legal</p>
          <h1>Copyright</h1>
          <p>
            All photographs, video, branding, and site content on this website are owned by{" "}
            {company.legal} unless noted otherwise.
          </p>
        </div>
      </header>

      <section className="band band--copyright" aria-labelledby="copyright-claim-title">
        <div className="band__inner copyright-doc reveal">
          <p className="copyright-doc__lead">
            © {year} {company.legal}. All rights reserved.
          </p>

          <h2 id="copyright-claim-title">Ownership</h2>
          <p>
            {company.legal} (“we,” “us,” or “our”) owns and reserves all rights in the materials
            published on this website, including without limitation:
          </p>
          <ul>
            <li>
              Project photographs, job-site images, progress shots, and finished-work photos
              displayed in the Projects gallery and anywhere else on this site
            </li>
            <li>Video clips and motion footage of our work or crew</li>
            <li>
              Our name, logo, brand mark, wordmarks, trade dress, and related branding graphics
            </li>
            <li>
              Website text, layout, design, graphics, and other original content prepared for{" "}
              {company.name}
            </li>
          </ul>

          <h2>No unauthorized use</h2>
          <p>
            You may not copy, download for reuse, scrape, reproduce, distribute, publish, modify,
            create derivative works from, or commercially exploit any of the photos, video, logos,
            or other content on this site without prior written permission from {company.legal}.
          </p>
          <p>
            Viewing this website does not transfer any ownership or license. Fair use and other
            limited exceptions under applicable law are not waived where they legally apply, but
            wholesale reuse of our project images or branding is not permitted.
          </p>

          <h2>Photographs and project media</h2>
          <p>
            Images and video of buildings, site work, and related projects shown here were created
            for {company.legal} and are claimed as our copyrighted works. Client project appearances
            do not grant third parties the right to take or reuse those images from this website.
          </p>

          <h2>Trademarks</h2>
          <p>
            “{company.name},” “{company.legal},” and our geometric logo mark are trademarks or
            service marks of {company.legal}. Unauthorized use of our marks is prohibited.
          </p>

          <h2>Permission requests</h2>
          <p>
            To request permission to use a photograph, video, or branding asset, contact us at{" "}
            <a href={company.emailHref}>{company.email}</a> or{" "}
            <a href={company.phoneHref}>{company.phone}</a> and describe the intended use.
          </p>

          <h2>Reporting misuse</h2>
          <p>
            If you believe our photos, video, or branding are being used without authorization,
            please notify us at <a href={company.emailHref}>{company.email}</a> so we can address
            it.
          </p>

          <p className="copyright-doc__meta">
            {company.legal}
            <br />
            {company.address}, {company.city}
            <br />
            Last updated {year}
          </p>
        </div>
      </section>
    </div>
  );
}
