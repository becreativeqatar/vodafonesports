"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { registrationSchema, type RegistrationInput } from "@/lib/validations";
import { COUNTRIES } from "@/lib/countries";
import { AGE_GROUPS } from "@/lib/constants";
import { getQIDPrefillData } from "@/lib/qid-parser";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      qid: "",
      fullName: "",
      email: "",
      nationality: "",
      ageGroup: undefined,
      gender: undefined,
    },
  });

  const selectedAgeGroup = watch("ageGroup");
  const selectedGender = watch("gender");
  const selectedNationality = watch("nationality");

  // Handle QID blur to auto-populate nationality and age group
  const handleQIDBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const qid = e.target.value;
    if (qid.length === 11) {
      const { nationality, ageGroup } = getQIDPrefillData(qid);
      const newAutoFilled = new Set<string>();

      // Only update if we got valid data and the field is currently empty
      if (nationality && !selectedNationality) {
        setValue("nationality", nationality);
        newAutoFilled.add("nationality");
      }
      if (ageGroup && !selectedAgeGroup) {
        setValue("ageGroup", ageGroup);
        newAutoFilled.add("ageGroup");
      }

      // Show visual feedback and toast if any fields were auto-filled
      if (newAutoFilled.size > 0) {
        setAutoFilledFields(newAutoFilled);
        toast({
          title: "Fields auto-filled",
          description: "Nationality and age group detected from your QID. You can still change them if needed.",
        });

        // Clear the highlight after animation
        setTimeout(() => {
          setAutoFilledFields(new Set());
        }, 1500);
      }
    }
  };

  const onSubmit = async (data: RegistrationInput) => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Redirect to success page with registration data
      const params = new URLSearchParams({
        id: result.data.id,
        qrCode: result.data.qrCode,
        fullName: result.data.fullName,
        email: result.data.email,
      });
      router.push(`/success?${params.toString()}`);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* QID Field */}
      <div className="space-y-2">
        <Label htmlFor="qid">
          Qatar ID (QID) <span className="text-vodafone-red">*</span>
        </Label>
        <Input
          id="qid"
          type="text"
          placeholder="Enter your 11-digit QID"
          maxLength={11}
          {...register("qid", {
            onBlur: handleQIDBlur,
          })}
        />
        <p className="text-xs text-gray-500">
          Your QID must be exactly 11 digits (nationality and age group will be auto-filled)
        </p>
        {errors.qid && (
          <p className="text-sm text-vodafone-red">{errors.qid.message}</p>
        )}
      </div>

      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          Full Name <span className="text-vodafone-red">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-vodafone-red">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-vodafone-red">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          {...register("email")}
        />
        <p className="text-xs text-gray-500">
          Your QR code will be sent to this email
        </p>
        {errors.email && (
          <p className="text-sm text-vodafone-red">{errors.email.message}</p>
        )}
      </div>

      {/* Age Group Field */}
      <div className="space-y-2">
        <Label>
          Age Group <span className="text-vodafone-red">*</span>
        </Label>
        <Select
          value={selectedAgeGroup}
          onValueChange={(value) =>
            setValue("ageGroup", value as RegistrationInput["ageGroup"])
          }
        >
          <SelectTrigger
            className={autoFilledFields.has("ageGroup") ? "animate-autofill ring-2 ring-vodafone-red" : ""}
          >
            <SelectValue placeholder="Select your age group" />
          </SelectTrigger>
          <SelectContent>
            {AGE_GROUPS.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label} ({group.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.ageGroup && (
          <p className="text-sm text-vodafone-red">{errors.ageGroup.message}</p>
        )}
      </div>

      {/* Nationality Field */}
      <div className="space-y-2">
        <Label>
          Nationality <span className="text-vodafone-red">*</span>
        </Label>
        <Select
          value={selectedNationality}
          onValueChange={(value) => setValue("nationality", value)}
        >
          <SelectTrigger
            className={autoFilledFields.has("nationality") ? "animate-autofill ring-2 ring-vodafone-red" : ""}
          >
            <SelectValue placeholder="Select your nationality" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.nationality && (
          <p className="text-sm text-vodafone-red">
            {errors.nationality.message}
          </p>
        )}
      </div>

      {/* Gender Field */}
      <div className="space-y-2">
        <Label>
          Gender <span className="text-vodafone-red">*</span>
        </Label>
        <RadioGroup
          value={selectedGender}
          onValueChange={(value) =>
            setValue("gender", value as RegistrationInput["gender"])
          }
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MALE" id="male" />
            <Label htmlFor="male" className="cursor-pointer">
              Male
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FEMALE" id="female" />
            <Label htmlFor="female" className="cursor-pointer">
              Female
            </Label>
          </div>
        </RadioGroup>
        {errors.gender && (
          <p className="text-sm text-vodafone-red">{errors.gender.message}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I agree to the terms and conditions{" "}
            <span className="text-vodafone-red">*</span>
          </label>
          <p className="text-xs text-gray-500">
            By registering, you consent to the collection and use of your
            information for event purposes.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Register Now"
        )}
      </Button>
    </form>
  );
}
