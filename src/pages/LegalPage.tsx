import { useParams } from "react-router-dom";

const legalContent: Record<string, { title: string; content: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    content: [
      "This Privacy Policy describes how Preparedness Hub collects, uses, and shares your personal information when you use our platform.",
      "We collect information you provide directly, such as your name, email address, and country when creating an account. We also collect usage data including pages visited and content accessed.",
      "Your data is used to personalise your experience, provide country-specific content, and improve our platform. We do not sell your personal information to third parties.",
      "We use industry-standard security measures to protect your data. You can request deletion of your account and associated data at any time.",
      "For questions about this policy, contact our data protection team through the contact form.",
    ],
  },
  terms: {
    title: "Terms of Service",
    content: [
      "By using Preparedness Hub, you agree to these Terms of Service. Please read them carefully.",
      "Our platform provides informational content about emergency preparedness. This content is for educational purposes and should not replace professional advice or official government guidance.",
      "Users must be at least 16 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials.",
      "Content on this platform is protected by copyright. You may download materials for personal use but may not redistribute them commercially without permission.",
      "We reserve the right to modify or discontinue any part of the service. Continued use after changes constitutes acceptance of the updated terms.",
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    content: [
      "The information provided on Preparedness Hub is for general informational and educational purposes only.",
      "While we strive to provide accurate and up-to-date information, we make no representations or warranties about the completeness, accuracy, or reliability of any content.",
      "In an actual emergency, always follow instructions from official emergency services and government authorities. Our content supplements but does not replace official guidance.",
      "Preparedness Hub is not responsible for any actions taken based on the information provided on this platform. Users should exercise their own judgment and consult qualified professionals.",
      "Links to external resources are provided for convenience. We do not endorse or take responsibility for the content of external websites.",
    ],
  },
};

export default function LegalPage() {
  const { page } = useParams<{ page: string }>();
  const content = legalContent[page || "privacy"] || legalContent.privacy;

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-6">{content.title}</h1>
      <div className="space-y-4">
        {content.content.map((p, i) => (
          <p key={i} className="text-base text-muted-foreground leading-relaxed">{p}</p>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-8 pt-4 border-t border-border">
        Last updated: February 2026
      </p>
    </div>
  );
}
