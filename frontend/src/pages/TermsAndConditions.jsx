import React, { useEffect } from "react";

function TermsAndConditions() {
  useEffect(() => {
    document.title = "Terms & Conditions - Jaza Nyumba | User Agreement";
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Terms & Conditions</h2>
      <ol>
        <li>
          <strong>Introduction</strong><br />
          Welcome to Jaza Nyumba ("us", "we", or "our")! Our platform enables users to manage group savings and investments. These Terms of Service ("Terms") govern your access and use of our website, app, and services.
        </li>
        <li>
          <strong>Acceptance of Terms</strong><br />
          By creating an account, accessing, or using our services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the Terms, do not use our services.
        </li>
        <li>
          <strong>User Accounts & Security</strong>
          <ul>
            <li>You must be at least 18 years old to create an account.</li>
            <li>You're responsible for maintaining account confidentiality and security.</li>
            <li>Notify us immediately of any unauthorized access or breach.</li>
          </ul>
        </li>
        <li>
          <strong>Intellectual Property</strong><br />
          Our services and content are protected by copyright, trademark, and other laws. You may not reproduce, modify, or distribute our intellectual property without permission.
        </li>
        <li>
          <strong>Disclaimers & Limitation of Liability</strong>
          <ul>
            <li>We provide services on an "as is" and "as available" basis without warranties of any kind.</li>
            <li>We're not liable for indirect, incidental, or consequential damages arising from use of our services.</li>
          </ul>
        </li>
        <li>
          <strong>Termination</strong><br />
          We may terminate or suspend your account and access to our services without notice if you breach these Terms.
        </li>
        <li>
          <strong>Governing Law</strong><br />
          These Terms shall be governed by and construed in accordance with Kenyan laws. Any disputes will be resolved through arbitration.
        </li>
        <li>
          <strong>Changes to Terms</strong><br />
          We reserve the right to modify these Terms at any time. Your continued use of our services after changes constitutes acceptance.
        </li>
        <li>
          <strong>Contact Us</strong><br />
          For questions or concerns, please <a href="/contact" style={{ color: "#1976d2" }}>contact us here</a>.
        </li>
      </ol>
    </div>
  );
}

export default TermsAndConditions;