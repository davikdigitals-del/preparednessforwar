import { Shield, Users, Globe, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-4">About Preparedness Hub</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Preparedness Hub is a comprehensive platform dedicated to empowering individuals, families, and communities 
        across the UK and NATO member countries with the knowledge, tools, and resources needed to prepare for emergencies.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          { icon: Shield, title: "Our Mission", text: "To make survival knowledge accessible to everyone, providing verified, authoritative guidance for emergency preparedness." },
          { icon: Users, title: "Community", text: "Building a network of prepared citizens who can support each other during times of crisis." },
          { icon: Globe, title: "NATO Coverage", text: "Serving all 31 NATO member nations with country-specific directives, alerts, and preparedness information." },
          { icon: BookOpen, title: "Education", text: "Comprehensive training programmes, courses, and an ever-growing encyclopaedia of survival knowledge." },
        ].map(item => (
          <div key={item.title} className="bg-card border border-border rounded-sm p-6">
            <item.icon className="w-8 h-8 text-alert mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted rounded-sm p-6">
        <h2 className="font-display font-bold text-xl mb-3">Disclaimer</h2>
        <p className="text-sm text-muted-foreground">
          Preparedness Hub provides informational content only. Always follow official government guidance and 
          consult qualified professionals for medical, legal, or security advice. The information on this platform 
          should complement, not replace, official emergency services.
        </p>
      </div>
    </div>
  );
}
