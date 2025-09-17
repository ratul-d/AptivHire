import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AptivHire() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const styles = `
  /* Component-scoped styles - keep conflicts minimized */
  .aptivhire {
    --primary-black: #1a1a1a;
    --dark-gray: #333333;
    --medium-gray: #666666;
    --light-gray: #e9ecef;
    --white: #ffffff;
    --accent: #0066ff;
    --shadow: 0 8px 20px rgba(15,15,15,0.06);
    --radius: 10px;

    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: var(--primary-black);

    /* make the component fill the screen and let the footer sit at bottom */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f7f9fb;
    margin: 0; /* help avoid body gaps when possible */
  }

  /* very small reset scoped to the component */
  .aptivhire, .aptivhire * { box-sizing: border-box; }
  .aptivhire img, .aptivhire svg { max-width: 100%; height: auto; display: block; }

  /* Container: neutralize any global forced 100vh or heights */
  .aptivhire .container {
    max-width: flex;
    margin: 0 auto;
    padding: 0 20px;
    width: calc(100%);
    height: auto !important;
    min-height: 0 !important;
  }

  header.ah-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 0;
    gap: 12px;
    background: transparent;
  }

  .logo { font-weight: 750; font-size: 30px; letter-spacing: -0.02em; }

  nav.ah-nav ul { list-style: none; display: flex; gap: 18px; margin: 0; padding: 0; align-items: center; }
  nav.ah-nav a, nav.ah-nav button.nav-link { text-decoration: none; color: var(--medium-gray); font-weight: 600; background: none; border: none; cursor: pointer; font-size: 14px; }
  nav.ah-nav a:focus, nav.ah-nav button.nav-link:focus { outline: 3px solid rgba(0,102,255,0.12); outline-offset: 2px; }

  .btn, .btn-inline { border-radius: 8px; padding: 8px 14px; font-weight: 700; font-size: 14px; cursor: pointer; }
  .btn { background: var(--primary-black); color: white; border: 0; }
  .btn:focus { outline: 3px solid rgba(26,26,26,0.12); }
  .btn-outline { background: transparent; color: var(--primary-black); border: 1px solid var(--primary-black); }
  .btn-outline:hover {
      background: var(--primary-black);
      color: var(--white);
    }


  /* mobile nav button */
  .mobile-toggle { display: none; background: transparent; border: 0; font-size: 20px; }

  /* HERO */
  .hero { display: flex; gap: 28px; align-items: center; padding: 40px 0; background: linear-gradient(180deg,#ffffff 0%, #f7f9fb 100%); border-radius: 12px; }
  .hero-left { flex: 1; min-width: 0; }
  .hero h1 { margin: 0 0 12px 0; font-size: 40px; line-height: 1.08; }
  .hero p { margin: 0 0 20px 0; color: var(--medium-gray); font-size: 16px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; }

  .hero-illustration { flex: 1; display: flex; justify-content: center; align-items: center; }
  .hero-illustration .card { width: min(420px, 100%); border-radius: 12px; background: linear-gradient(180deg,#fbfdff,#f2f6fb); padding: 20px; box-shadow: var(--shadow); }

  /* FEATURES */
  .section { padding: 40px 0; }
  .section-title { text-align: center; font-size: 26px; margin-bottom: 24px; }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .feature { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 18px; text-align: center; min-height: 150px; display:flex; flex-direction:column; gap:10px; }
  .feature-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; background: rgba(26,26,26,0.04); }
  .feature h3 { margin: 6px 0 0 0; font-size: 15px; }
  .feature p { margin: 0; color: var(--medium-gray); font-size: 13px; flex:1; }

  /* HOW IT WORKS - adapted from base html */
  .how-it-works { background-color: var(--white); padding-top: 40px; padding-bottom: 40px; }
  .steps { display:flex; justify-content:space-between; max-width:1000px; margin: 0 auto; gap: 12px; align-items:stretch; }
  .step { text-align: center; flex:1; padding: 0 20px; position: relative; }
  .step:not(:last-child):after {
    content: "";
    position: absolute;
    top: 40px;
    right: -50px;
    width: 100px;
    height: 2px;
    background-color: var(--light-gray);
  }
  .step-number { width:80px; height:80px; border-radius:50%; background-color:var(--primary-black); color:var(--white); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; margin: 0 auto 20px; }

  /* fallback smaller variant in other parts of UI */
  .steps .step h3 { font-size: 18px; margin-bottom: 12px; }
  .steps .step p { color: var(--medium-gray); font-size: 14px; line-height: 1.6; }

  .cta { padding: 36px 0; text-align:center; }
  footer.ah-footer { margin-top: auto; background: var(--light-gray); color: white; padding: 20px 0; }
  .footer-content { display:flex; justify-content:space-between; align-items:center; gap:12px; }
  .footer-links { display:flex; gap:14px; }
  .footer-links a { color: rgba(0,0,0,0.85); text-decoration:none; font-size:14px; }

  /* small improvements */
  a, button { transition: all 160ms ease; }
  .visually-hidden { position:absolute !important; height:1px; width:1px; overflow:hidden; clip:rect(1px,1px,1px,1px); white-space:nowrap; }

  /* Responsive tweaks */
  @media (max-width: 1024px) {
    .features { grid-template-columns: repeat(2, 1fr); }
    .hero { flex-direction: column; text-align:center; }
    .hero-left { padding: 0 8px; }
    .hero-illustration { order: 2; }
  }

  @media (max-width: 768px) {
    nav.ah-nav ul { display: none; }
    .mobile-toggle { display: inline-flex; }
    .mobile-menu { display: none; }
    .mobile-menu.open { display: block; }
    .features { grid-template-columns: 1fr; }
    .steps { flex-direction: column; gap: 40px; max-width: 100%; }
    .step:not(:last-child):after { display: none; }
    .footer-content { flex-direction: column; gap:10px; text-align:center; }
    .container { padding: 0 16px; }
  }

  /* Focus-visible for keyboard users */
  :where(.aptivhire) :focus-visible { outline: 3px solid rgba(0,102,255,0.12); outline-offset: 2px; }

  `;

  return (
    <div className="aptivhire" aria-labelledby="aptiv-title">
      <style>{styles}</style>

      <div className="container">
        <header className="ah-header" role="banner">
          <div className="logo" id="aptiv-title">AptivHire</div>

          <nav className="ah-nav" role="navigation" aria-label="Main navigation">
            <button
              className="mobile-toggle"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(v => !v)}
            >
              ☰
            </button>

            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><button type="button" className="btn-outline" onClick={() => navigate('/auth')}>Login</button></li>
            </ul>

            {/* mobile menu (simple) */}
            <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="menu" aria-hidden={!mobileOpen} style={{marginTop:8}}>
              {mobileOpen && (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <a href="#features">Features</a>
                  <a href="#how-it-works">How it Works</a>
                  <button type="button" className="btn-outline" onClick={() => navigate('/auth')}>Login</button>
                </div>
              )}
            </div>
          </nav>
        </header>
      </div>

      <main>
        <div className="container">
          <section className="hero" aria-label="Hero">
            <div className="hero-left">
              <h1>Streamline your recruitment with AI-driven workflows</h1>
              <p>Automate screening, parsing, matching and scheduling — so your team hires faster and smarter. Built for recruiters and hiring teams of any size.</p>
              <div className="hero-actions">
                <button className="btn" onClick={() => navigate('/auth')}>Get Started</button>
              </div>
            </div>

            <div className="hero-illustration" aria-hidden="true">
              <div className="card" role="img" aria-label="Illustration: dashboard and candidate matching">
                <svg width="420" height="260" viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="8" y="8" width="404" height="244" rx="10" fill="#fff" stroke="#e6eefb"/>
                  <rect x="28" y="28" width="140" height="16" rx="6" fill="#1a1a1a" />
                  <circle cx="210" cy="100" r="36" fill="#e6eefb" />
                  <rect x="120" y="150" width="180" height="10" rx="5" fill="#e6eefb" />
                  <rect x="120" y="170" width="120" height="10" rx="5" fill="#edf3fb" />
                  <rect x="40" y="60" width="80" height="80" rx="8" fill="#f4f8fb" />
                </svg>
              </div>
            </div>
          </section>

          <section className="section" id="features" aria-labelledby="features-title">
            <h2 className="section-title" id="features-title">Key Features</h2>
            <div className="features" role="list">

              <article className="feature" role="listitem">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/> </svg>
                </div>
                <h3>Job description parsing</h3>
                <p>Extract skills, responsibilities and experience requirements automatically from free-text job descriptions.</p>
              </article>

              <article className="feature" role="listitem">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/> </svg>
                </div>
                <h3>CV extraction</h3>
                <p>Parse resumes into structured profiles (skills, experience, education, contact) for fast filtering and matching.</p>
              </article>

              <article className="feature" role="listitem">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/> <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M9 9H9.01M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> </svg>
                </div>
                <h3>AI-powered matching</h3>
                <p>Intelligent matching agent with explainable scoring and reasoned gaps to help recruiters make the right hire.</p>
              </article>

              <article className="feature" role="listitem">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/> </svg>
                </div>
                <h3>Interview scheduling</h3>
                <p>Schedule interviews automatically and notify candidates with calendar invites and reminders.</p>
              </article>

              <article className="feature" role="listitem">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/> </svg>
                </div>
                <h3>Dashboard analytics</h3>
                <p>Visualize pipeline metrics, time-to-hire, and conversion rates with easy-to-read dashboards.</p>
              </article>

              <article className="feature" role="listitem">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/> </svg>
                </div>
                <h3>Secure & compliant</h3>
                <p>Enterprise-grade security including JWT auth, encryption at rest, and data access controls to meet compliance needs.</p>
              </article>

            </div>
          </section>

          {/* HOW IT WORKS - updated to match base HTML structure + styles */}
          <section className="section how-it-works" id="how-it-works" aria-labelledby="how-title">
            <h2 className="section-title" id="how-title">How It Works</h2>
            <div className="steps" role="list">
              <div className="step" role="listitem">
                <div className="step-number">1</div>
                <h3>Upload Job Description</h3>
                <p>Paste your job description or upload a document. Our AI will extract key requirements automatically.</p>
              </div>
              <div className="step" role="listitem">
                <div className="step-number">2</div>
                <h3>Process Candidate CVs</h3>
                <p>Upload candidate CVs in PDF format. The system will parse and extract all relevant information.</p>
              </div>
              <div className="step" role="listitem">
                <div className="step-number">3</div>
                <h3>AI Matching</h3>
                <p>Our agent calculates compatibility scores and identifies missing skills or experience.</p>
              </div>
              <div className="step" role="listitem">
                <div className="step-number">4</div>
                <h3>Schedule Interviews</h3>
                <p>Select the best candidates and schedule interviews with automated email notifications.</p>
              </div>
            </div>
          </section>

          <section className="cta" aria-label="Call to action">
              <h2>Github Repository</h2>
              <p style={{ color: 'var(--medium-gray)', maxWidth: 680, margin: '8px auto 16px' }}>
                Explore the open-source code behind this project on GitHub.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <a href="https://github.com/ratul-d/AptivHire" target="_blank" rel="noopener noreferrer">
                  <button className="btn">View on GitHub</button>
                </a>
              </div>
            </section>

        </div>
      </main>

      <footer className="ah-footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <div className="logo">AptivHire</div>
            <div className="footer-links">
              <a href="https://github.com/ratul-d/AptivHire">Github</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
