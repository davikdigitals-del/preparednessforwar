import { Shield, Heart, Users, AlertTriangle, BookOpen, Target, Lightbulb, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="border-b border-border bg-card">
        <div className="container py-12 md:py-20 max-w-5xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-alert/10 mb-4">
              <Shield className="w-10 h-10 text-alert" />
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl">
              About Preparedness For War
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              An educational and awareness platform dedicated to helping individuals, families, organisations, 
              and communities improve their readiness for emergencies, crises, and periods of uncertainty.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="container py-16 max-w-5xl">
        <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <Target className="w-8 h-8 text-alert flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">Our Mission</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                Our goal is to provide <span className="text-foreground font-semibold">practical, responsible, and accessible information</span> that 
                encourages resilience, preparedness, and informed decision-making.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                We believe that preparation is not driven by fear, but by <span className="text-foreground font-semibold">knowledge, planning, 
                and the ability to respond effectively</span> when challenges arise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Coverage */}
      <div className="bg-muted/30 py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">What We Cover</h2>
            <p className="text-muted-foreground text-lg">Our content spans essential topics for comprehensive preparedness</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: "Emergency Preparedness", description: "Essential planning for unexpected situations" },
              { icon: Shield, title: "Disaster Readiness", description: "Strategies for natural and man-made disasters" },
              { icon: Users, title: "Community Resilience", description: "Building strong, supportive networks" },
              { icon: Heart, title: "First Aid Awareness", description: "Life-saving knowledge and techniques" },
              { icon: BookOpen, title: "Crisis Planning", description: "Comprehensive response strategies" },
              { icon: Lightbulb, title: "Survival Education", description: "Practical skills and knowledge" },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <item.icon className="w-10 h-10 text-alert mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="container py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Our Core Values</h2>
          <p className="text-muted-foreground text-lg">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Education First",
              description: "All content is provided solely for educational, informational, historical, and preparedness purposes. We do not promote violence, unlawful activity, or armed conflict.",
              color: "text-blue-600"
            },
            {
              title: "Knowledge Over Fear",
              description: "We empower people with knowledge that helps them protect themselves, support their communities, and make informed decisions during emergencies.",
              color: "text-green-600"
            },
            {
              title: "Responsible Information",
              description: "We provide practical and responsible guidance that encourages resilience and informed decision-making without sensationalism.",
              color: "text-purple-600"
            },
            {
              title: "Community Support",
              description: "Our mission is to help individuals support their communities and work together to build stronger, more prepared societies.",
              color: "text-orange-600"
            },
          ].map((value, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6 md:p-8">
              <CheckCircle2 className={`w-8 h-8 ${value.color} mb-4`} />
              <h3 className="font-display font-bold text-xl mb-3">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-alert/5 border-y border-alert/20 py-12">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-alert/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-alert" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl md:text-2xl mb-3">Important Notice</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                <span className="font-semibold text-foreground">Preparedness For War does not promote violence, unlawful activity, or armed conflict.</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All content is provided solely for educational, informational, historical, and preparedness purposes. 
                Our mission is to empower people with knowledge that helps them protect themselves, support their communities, 
                and make informed decisions during emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container py-16 max-w-5xl text-center">
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">
          Join Our Community
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Start your preparedness journey today with access to comprehensive resources, 
          expert guidance, and a supportive community.
        </p>
      </div>
    </div>
  );
}
