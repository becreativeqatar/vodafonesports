import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/public/countdown-timer";
import { Calendar, MapPin, Clock, HelpCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-vodafone-gradient text-white py-6 md:py-32 min-h-[calc(100dvh-64px)] md:min-h-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* White Vodafone Logo */}
            <div className="flex justify-center mb-4 md:mb-8">
              <Image
                src="/images/vodafone-logo-white.png"
                alt="Vodafone"
                width={200}
                height={54}
                className="object-contain w-[140px] md:w-[200px] h-auto"
                priority
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 mb-3 md:mb-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                National Sport Day 2026
              </span>
              <span className="inline-block bg-white text-vodafone-red px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">
                10 February 2026
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-bold mb-3 md:mb-6">
              Sports Village
            </h1>
            <p className="text-base md:text-2xl text-white/90 mb-4 md:mb-8">
              Join us for an exciting day of sports and activities at Downtown
              Msheireb, Qatar
            </p>

            {/* Countdown Timer */}
            <div className="mb-5 md:mb-10">
              <CountdownTimer targetDate="2026-02-10T07:30:00+03:00" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-vodafone-red hover:bg-gray-100 text-base md:text-lg px-6 py-4 md:px-8 md:py-6"
              >
                <Link href="/register">Register Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white hover:text-vodafone-red text-base md:text-lg px-6 py-4 md:px-8 md:py-6"
              >
                <Link href="#event-info">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Section */}
      <section id="event-info" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-vodafone-grey mb-4">
              Event Details
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about Sports Village 2026
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-t-4 border-t-vodafone-red">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-vodafone-red/10 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-vodafone-red" />
                  </div>
                  <h3 className="font-semibold text-lg">Date</h3>
                </div>
                <p className="text-vodafone-grey">
                  Tuesday, 10 February 2026
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-secondary-aqua-blue">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-secondary-aqua-blue/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-secondary-aqua-blue" />
                  </div>
                  <h3 className="font-semibold text-lg">Time</h3>
                </div>
                <p className="text-vodafone-grey">7:30 AM - 4:30 PM</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-secondary-spring-green">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-secondary-spring-green/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-secondary-spring-green" />
                  </div>
                  <h3 className="font-semibold text-lg">Location</h3>
                </div>
                <a
                  href="https://share.google/wSJgqfIyYScjsx5uo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vodafone-red hover:underline"
                >
                  Downtown Msheireb, Barahat Msheireb
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-vodafone-grey mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about Sports Village 2026
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {/* FAQ items will be added here */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="bg-vodafone-red/10 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-vodafone-red" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-vodafone-grey mb-2">
                      FAQ content coming soon
                    </h3>
                    <p className="text-gray-600">
                      Frequently asked questions will be added here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Full width, no rounded corners, connects to footer */}
      <section className="bg-vodafone-gradient py-16 md:py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Register now and be part of Qatar&apos;s National Sport Day celebration.
            It&apos;s free and open to everyone!
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-vodafone-red hover:bg-gray-100 text-lg px-8 py-6"
          >
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
