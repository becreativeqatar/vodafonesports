import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationForm } from "@/components/forms/registration-form";

export default function RegisterPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-vodafone-grey mb-4">
              Register for Sports Village 2026
            </h1>
            <p className="text-gray-600">
              Fill in your details below to secure your spot at National Sport
              Day 2026
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration Form</CardTitle>
              <CardDescription>
                All fields marked with * are required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationForm />
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By registering, you agree to our terms and conditions. Your QR
              code will be sent to your email upon successful registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
