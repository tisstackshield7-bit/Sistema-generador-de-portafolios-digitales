import { Link } from "react-router-dom";

export default function AuthMiniFooter() {
  return (
    <footer className="auth-mini-footer">
      <div className="page-section auth-mini-footer-inner">
        <p>© 2026 SpherLink</p>
        <div className="auth-mini-footer-links">
          <Link to="/">Inicio</Link>
          <span>Privacidad</span>
          <span>Terminos</span>
        </div>
      </div>
    </footer>
  );
}
