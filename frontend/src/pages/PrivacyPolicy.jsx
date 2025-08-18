import React from "react";

function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Privacy Policy</h2>
      <p>
        Chama Vault values your privacy. This policy explains how we collect, use, and protect your information.
      </p>
      <ul>
        <li>
          <strong>Information Collection:</strong> We collect personal information you provide when creating an account, such as your name, phone number, and group details.
        </li>
        <li>
          <strong>Use of Information:</strong> Your information is used to provide and improve our services, communicate with you, and ensure security.
        </li>
        <li>
          <strong>Sharing:</strong> We do not sell or share your personal information with third parties except as required by law or to provide our services.
        </li>
        <li>
          <strong>Security:</strong> We implement reasonable measures to protect your data, but cannot guarantee absolute security.
        </li>
        <li>
          <strong>Changes:</strong> We may update this policy. Continued use of our services means you accept the changes.
        </li>
        <li>
          <strong>Contact:</strong> For privacy questions, please <a href="/contact" style={{ color: "#1976d2" }}>contact us here</a>.
        </li>
      </ul>
    </div>
  );
}

export default PrivacyPolicy;