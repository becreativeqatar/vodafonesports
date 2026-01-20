import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-vodafone-grey mb-8">
            Terms and Conditions
          </h1>

          <Card className="mb-6">
            <CardContent className="pt-6 prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: January 2026
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                1. Event Registration
              </h2>
              <p className="text-gray-600 mb-4">
                By registering for the Vodafone Sports Village event on National Sport Day 2026,
                you agree to abide by these terms and conditions. Registration is free and open
                to all participants. Each registration generates a unique QR code that serves as
                your entry pass to the event.
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                2. Personal Information
              </h2>
              <p className="text-gray-600 mb-4">
                We collect the following personal information during registration:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Date of birth</li>
                <li>Gender</li>
                <li>Company/Organization (optional)</li>
              </ul>
              <p className="text-gray-600 mb-4">
                This information is collected solely for event management purposes, including
                registration confirmation, event communication, and check-in verification.
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                3. Data Protection
              </h2>
              <p className="text-gray-600 mb-4">
                Vodafone Qatar is committed to protecting your personal data. Your information
                will be:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Stored securely and used only for event-related purposes</li>
                <li>Not shared with third parties without your consent, except as required by law</li>
                <li>Retained only for the duration necessary to fulfill the purposes outlined</li>
                <li>Processed in accordance with applicable data protection regulations</li>
              </ul>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                4. Event Participation
              </h2>
              <p className="text-gray-600 mb-4">
                By attending the Sports Village event, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Present your QR code at the entrance for check-in</li>
                <li>Follow all event rules and guidelines</li>
                <li>Comply with instructions from event staff and security personnel</li>
                <li>Participate in activities at your own risk</li>
                <li>Behave responsibly and respectfully towards other participants</li>
              </ul>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                5. Photography and Media
              </h2>
              <p className="text-gray-600 mb-4">
                By attending the event, you consent to being photographed or recorded. These
                images and recordings may be used by Vodafone Qatar for promotional purposes,
                including but not limited to social media, marketing materials, and press releases.
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                6. Liability
              </h2>
              <p className="text-gray-600 mb-4">
                Vodafone Qatar shall not be liable for any loss, injury, or damage to persons
                or property occurring during the event, except where such liability cannot be
                excluded by law. Participants are advised to take appropriate precautions and
                participate in activities suitable for their fitness level.
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                7. Event Changes
              </h2>
              <p className="text-gray-600 mb-4">
                Vodafone Qatar reserves the right to modify, postpone, or cancel the event
                due to unforeseen circumstances, including but not limited to weather conditions,
                safety concerns, or force majeure events. Registered participants will be
                notified of any changes via the email address provided during registration.
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                8. Contact Information
              </h2>
              <p className="text-gray-600 mb-4">
                For questions or concerns regarding these terms and conditions or your
                registration, please contact us through the official Vodafone Qatar channels.
              </p>

              <h2 className="text-xl font-semibold text-vodafone-grey mt-6 mb-3">
                9. Acceptance
              </h2>
              <p className="text-gray-600 mb-4">
                By completing your registration, you acknowledge that you have read, understood,
                and agree to be bound by these terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
