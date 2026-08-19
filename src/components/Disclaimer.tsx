import { Link } from "react-router-dom";
import { hubDisclaimer } from "../data/content";
import "./Disclaimer.css";

type Props = {
  compact?: boolean;
};

export function Disclaimer({ compact = false }: Props) {
  if (compact) {
    return (
      <p className="disclaimer disclaimer--compact">
        {hubDisclaimer.text}{" "}
        <Link to="/terms">See Terms</Link>.
      </p>
    );
  }

  return (
    <aside className="disclaimer" aria-labelledby="disclaimer-title">
      <p className="disclaimer__eyebrow">Please note</p>
      <h2 id="disclaimer-title">{hubDisclaimer.title}</h2>
      <p>{hubDisclaimer.text}</p>
      <p className="disclaimer__more">
        Full details are in our <Link to="/terms">Terms of Use</Link>.
      </p>
    </aside>
  );
}
