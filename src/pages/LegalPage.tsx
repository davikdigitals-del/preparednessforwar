import { useParams, Link } from "react-router-dom";
import { Shield, Scale, Lock, Cookie, AlertCircle, FileText, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const legalContent: Record<string, { 
  title: string; 
  icon: any;
  lastUpdated: string;
  sections: Array<{ heading?: string; content: string[] }>;
}> = {
  about: {
    title: "About Preparedness For War",
    icon: Info,
    lastUpdated: "June 2026",
    sections: [
      {
        content: [
          "Preparedness For War is an educational and awareness platform dedicated to helping individuals, families, organisations, and communities improve their readiness for emergencies, crises, and periods of uncertainty.",
          "Our goal is to provide practical, responsible, and accessible information that encourages resilience, preparedness, and informed decision-making. We believe that preparation is not driven by fear, but by knowledge, planning, and the ability to respond effectively when challenges arise.",
        ]
      },
      {
        heading: "Our Content Coverage",
        content: [
          "Our content may cover topics including: Emergency preparedness, Disaster readiness, Community resilience, First aid awareness, Crisis planning, Emergency communication, Risk management, and Survival knowledge and education.",
          "Preparedness For War does not promote violence, unlawful activity, or armed conflict. All content is provided solely for educational, informational, historical, and preparedness purposes.",
          "Our mission is to empower people with knowledge that helps them protect themselves, support their communities, and make informed decisions during emergencies.",
        ]
      }
    ]
  },
  terms: {
    title: "Terms of Service",
    icon: Scale,
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "1. Agreement to Terms",
        content: [
          "By accessing or using Preparedness For War (\"the Website\"), you agree to comply with and be bound by these Terms of Service.",
          "If you do not agree with these Terms, you should not use this Website.",
        ]
      },
      {
        heading: "2. Educational Purposes Only",
        content: [
          "All content published on this Website is intended solely for educational and informational purposes.",
          "Nothing on this Website constitutes professional legal, medical, military, security, financial, or emergency-response advice.",
          "Users should seek qualified professional guidance where appropriate.",
        ]
      },
      {
        heading: "3. User Conduct",
        content: [
          "You agree not to:",
          "• Use the Website for unlawful purposes",
          "• Attempt to gain unauthorised access to the Website",
          "• Upload malicious software or harmful code",
          "• Interfere with the operation or security of the Website",
          "• Impersonate another person or organisation",
          "• Violate any applicable laws or regulations",
        ]
      },
      {
        heading: "4. Intellectual Property",
        content: [
          "All Website content, including text, graphics, logos, designs, images, documents, and branding, is the intellectual property of Preparedness For War unless otherwise stated.",
          "No content may be copied, reproduced, distributed, modified, or republished without prior written permission.",
        ]
      },
      {
        heading: "5. Third-Party Links",
        content: [
          "The Website may contain links to external websites.",
          "Preparedness For War is not responsible for the content, security, accuracy, or privacy practices of third-party websites.",
          "Accessing third-party websites is at your own risk.",
        ]
      },
      {
        heading: "6. Disclaimer of Warranties",
        content: [
          "The Website is provided on an \"as is\" and \"as available\" basis.",
          "We make no guarantees regarding: Accuracy of information, Availability of services, Reliability of content, Website uptime, or Suitability for any particular purpose.",
        ]
      },
      {
        heading: "7. Limitation of Liability",
        content: [
          "To the maximum extent permitted by law, Preparedness For War shall not be liable for any direct, indirect, incidental, consequential, or special damages resulting from:",
          "• Use of the Website",
          "• Reliance upon Website content",
          "• Service interruptions",
          "• Technical issues",
          "• Third-party content",
        ]
      },
      {
        heading: "8. Indemnification",
        content: [
          "You agree to indemnify and hold harmless Preparedness For War, its owners, administrators, affiliates, and contributors from any claims, damages, liabilities, or expenses arising from your use of the Website.",
        ]
      },
      {
        heading: "9. Changes to Terms",
        content: [
          "We reserve the right to modify these Terms at any time.",
          "Updated versions will be posted on this page with a revised effective date.",
          "Continued use of the Website constitutes acceptance of any changes.",
        ]
      },
      {
        heading: "10. Governing Law",
        content: [
          "These Terms shall be governed and interpreted in accordance with the laws of the United Kingdom.",
        ]
      },
      {
        heading: "11. Contact",
        content: [
          "Questions regarding these Terms may be submitted through the contact details provided on the Website.",
        ]
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    icon: Lock,
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "1. Introduction",
        content: [
          "Preparedness For War respects your privacy and is committed to protecting your personal information.",
          "This Privacy Policy explains how we collect, use, store, and protect your data.",
        ]
      },
      {
        heading: "2. Information We Collect",
        content: [
          "Personal Information: We may collect name, email address, contact details, and information submitted through contact forms.",
          "Non-Personal Information: We may automatically collect IP address, browser type, device information, operating system, website usage statistics, referring pages, and cookies/analytics data.",
        ]
      },
      {
        heading: "3. How We Use Your Information",
        content: [
          "We use collected information to:",
          "• Operate and maintain the Website",
          "• Respond to enquiries",
          "• Improve user experience",
          "• Monitor Website performance",
          "• Protect Website security",
          "• Send communications where consent has been provided",
        ]
      },
      {
        heading: "4. Legal Basis for Processing (UK GDPR)",
        content: [
          "Where applicable, we process personal data under one or more of the following lawful bases:",
          "• Consent",
          "• Legitimate interests",
          "• Contractual necessity",
          "• Legal obligations",
        ]
      },
      {
        heading: "5. Cookies",
        content: [
          "The Website uses cookies and similar technologies to: Improve functionality, Analyse traffic, Remember preferences, and Enhance user experience.",
          "You may disable cookies through your browser settings.",
        ]
      },
      {
        heading: "6. Data Sharing",
        content: [
          "We do not sell personal data.",
          "Information may be shared with trusted service providers including: Hosting providers, Analytics services, Security services, and Email communication providers.",
          "Such providers process information only as necessary to provide their services.",
        ]
      },
      {
        heading: "7. Data Security",
        content: [
          "We implement reasonable technical and organisational measures designed to protect personal information from unauthorised access, misuse, disclosure, alteration, or destruction.",
          "However, no internet-based service can guarantee absolute security.",
        ]
      },
      {
        heading: "8. Data Retention",
        content: [
          "Personal data will be retained only for as long as necessary to fulfil legitimate business purposes or legal obligations.",
        ]
      },
      {
        heading: "9. Your Rights",
        content: [
          "Under applicable data protection laws, you may have the right to:",
          "• Access your personal information",
          "• Correct inaccurate information",
          "• Request deletion",
          "• Restrict processing",
          "• Object to processing",
          "• Withdraw consent",
          "• Request data portability",
        ]
      },
      {
        heading: "10. Children's Privacy",
        content: [
          "The Website is not directed toward children under 13 years of age.",
          "We do not knowingly collect personal information from children.",
        ]
      },
      {
        heading: "11. Updates to This Policy",
        content: [
          "We may update this Privacy Policy periodically.",
          "Any changes will be posted on this page with an updated effective date.",
        ]
      },
      {
        heading: "12. Contact Us",
        content: [
          "For privacy-related enquiries, please contact us using the information provided on the Website.",
        ]
      }
    ]
  },
  cookies: {
    title: "Cookie Policy",
    icon: Cookie,
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "What Are Cookies?",
        content: [
          "Cookies are small text files stored on your device when you visit a website.",
          "They help websites function properly and improve user experience.",
        ]
      },
      {
        heading: "Types of Cookies We Use",
        content: [
          "Essential Cookies: Required for basic Website functionality.",
          "Performance Cookies: Help us understand how visitors interact with the Website.",
          "Analytics Cookies: Provide anonymous usage data that helps improve our services.",
          "Preference Cookies: Remember settings and preferences for future visits.",
        ]
      },
      {
        heading: "Managing Cookies",
        content: [
          "Most web browsers allow you to:",
          "• View cookies",
          "• Delete cookies",
          "• Block cookies",
          "• Configure cookie preferences",
          "",
          "Disabling cookies may affect Website functionality.",
        ]
      },
      {
        heading: "Third-Party Cookies",
        content: [
          "Some third-party services integrated into the Website may place cookies on your device.",
          "These services maintain their own privacy and cookie policies.",
        ]
      },
      {
        heading: "Consent",
        content: [
          "By continuing to use the Website, you consent to our use of cookies in accordance with this Cookie Policy.",
        ]
      }
    ]
  },
  disclaimer: {
    title: "Disclaimer",
    icon: AlertCircle,
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "General Information",
        content: [
          "The information provided on Preparedness For War is intended for educational and informational purposes only.",
          "While we strive to provide accurate and current information, we make no guarantees regarding completeness, accuracy, reliability, or suitability.",
        ]
      },
      {
        heading: "No Professional Advice",
        content: [
          "Content on this Website does not constitute:",
          "• Legal advice",
          "• Medical advice",
          "• Security advice",
          "• Military advice",
          "• Financial advice",
          "• Emergency-response advice",
          "",
          "Users should consult qualified professionals before making decisions based on Website content.",
        ]
      },
      {
        heading: "Use at Your Own Risk",
        content: [
          "Any actions taken based upon information from this Website are undertaken entirely at your own risk.",
          "Preparedness For War shall not be liable for any loss, injury, damage, or consequence arising from the use of Website content.",
        ]
      },
      {
        heading: "External Links Disclaimer",
        content: [
          "The Website may link to external websites.",
          "We do not endorse, control, or guarantee the content or practices of any third-party website.",
        ]
      },
      {
        heading: "Availability Disclaimer",
        content: [
          "We do not guarantee uninterrupted access to the Website and reserve the right to modify, suspend, or discontinue services without notice.",
        ]
      },
      {
        heading: "Limitation of Liability",
        content: [
          "To the fullest extent permitted by law, Preparedness For War shall not be liable for any damages arising from the use of, or inability to use, the Website or its content.",
        ]
      },
      {
        heading: "Contact",
        content: [
          "Questions regarding this Disclaimer may be submitted through the contact information provided on the Website.",
        ]
      }
    ]
  }
};

export default function LegalPage() {
  const { page } = useParams<{ page: string }>();
  const selectedPage = page || "about";
  const content = legalContent[selectedPage] || legalContent.about;
  const Icon = content.icon;

  const legalPages = [
    { key: "about", label: "About Us", icon: Info },
    { key: "terms", label: "Terms of Service", icon: Scale },
    { key: "privacy", label: "Privacy Policy", icon: Lock },
    { key: "cookies", label: "Cookie Policy", icon: Cookie },
    { key: "disclaimer", label: "Disclaimer", icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-8 md:py-12 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-alert/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-alert" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl">{content.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">Last updated: {content.lastUpdated}</p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {legalPages.map((legalPage) => {
              const PageIcon = legalPage.icon;
              const isActive = selectedPage === legalPage.key;
              return (
                <Link key={legalPage.key} to={`/legal/${legalPage.key}`}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    <PageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{legalPage.label}</span>
                    <span className="sm:hidden">{legalPage.key === "about" ? "About" : legalPage.key === "terms" ? "Terms" : legalPage.key === "privacy" ? "Privacy" : legalPage.key === "cookies" ? "Cookies" : "Disclaimer"}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 max-w-4xl">
        <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-sm">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {content.sections.map((section, idx) => (
              <div key={idx} className={idx > 0 ? "mt-8 pt-8 border-t border-border" : ""}>
                {section.heading && (
                  <h2 className="font-display font-bold text-xl md:text-2xl mb-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-alert flex-shrink-0" />
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-4">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-alert flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Questions or Concerns?</p>
              <p className="text-sm text-muted-foreground">
                If you have any questions about this {content.title.toLowerCase()}, please contact us through 
                the contact information provided on the Website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
