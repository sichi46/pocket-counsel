import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DisclaimerBanner() {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Legal Disclaimer:</strong> This application provides general legal information for educational purposes only. 
        It is not a substitute for professional legal advice. Always consult with a qualified lawyer for specific legal matters. 
        The information provided may not be complete, accurate, or up-to-date.
      </AlertDescription>
    </Alert>
  );
} 