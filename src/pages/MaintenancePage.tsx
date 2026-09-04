import { Wrench, Clock } from "lucide-react";

interface MaintenancePageProps {
  message?: string;
  estimatedBack?: string;
}

export default function MaintenancePage({ 
  message = "Site is under maintenance. We will be back soon.",
  estimatedBack 
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-blue-900 flex items-center justify-center rounded-lg shadow-lg">
              <span className="font-display font-bold text-2xl text-white">PH</span>
            </div>
            <span className="font-display font-black text-3xl tracking-tight text-gray-900">
              preparedness<span className="font-light">for</span>war
            </span>
          </div>
        </div>

        {/* Maintenance Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <Wrench className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          {message}
        </p>

        {/* Estimated Time */}
        {estimatedBack && (
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md mb-8">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Expected back: <span className="text-blue-600 font-semibold">{estimatedBack}</span>
            </span>
          </div>
        )}

        {/* What you can do */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What's happening?
          </h2>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>We're upgrading our systems to serve you better</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Your data is safe and secure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>We'll be back online shortly</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-500">
          Need urgent help? Contact us at{" "}
          <a href="mailto:support@preparednessforwar.com" className="text-blue-600 hover:underline">
            support@preparednessforwar.com
          </a>
        </p>
      </div>
    </div>
  );
}
