"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { registrationSchema, type RegistrationInput, type FamilyMemberInput } from "@/lib/validations";
import { COUNTRIES } from "@/lib/countries";
import { AGE_GROUPS } from "@/lib/constants";
import { getQIDPrefillData } from "@/lib/qid-parser";
import { Loader2, Plus, X, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberInput[]>([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newMember, setNewMember] = useState<Partial<FamilyMemberInput>>({
    qid: "",
    fullName: "",
    ageGroup: undefined,
    gender: undefined,
  });

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

  const handleAddFamilyMember = () => {
    if (!newMember.qid || newMember.qid.length !== 11) {
      toast({
        title: "Invalid QID",
        description: "Please enter a valid 11-digit QID for the family member.",
        variant: "destructive",
      });
      return;
    }
    if (!newMember.fullName || newMember.fullName.length < 3) {
      toast({
        title: "Invalid Name",
        description: "Please enter the family member's full name.",
        variant: "destructive",
      });
      return;
    }
    if (!newMember.ageGroup) {
      toast({
        title: "Age Group Required",
        description: "Please select an age group for the family member.",
        variant: "destructive",
      });
      return;
    }
    if (!newMember.gender) {
      toast({
        title: "Gender Required",
        description: "Please select a gender for the family member.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate QID
    if (familyMembers.some((m) => m.qid === newMember.qid)) {
      toast({
        title: "Duplicate QID",
        description: "This family member has already been added.",
        variant: "destructive",
      });
      return;
    }

    setFamilyMembers([...familyMembers, newMember as FamilyMemberInput]);
    setNewMember({ qid: "", fullName: "", ageGroup: undefined, gender: undefined });
    setShowAddFamily(false);
    toast({
      title: "Family member added",
      description: `${newMember.fullName} has been added to your registration.`,
    });
  };

  const handleRemoveFamilyMember = (qid: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.qid !== qid));
  };

  const handleNewMemberQIDBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const qid = e.target.value;
    if (qid.length === 11) {
      const { ageGroup } = getQIDPrefillData(qid);
      if (ageGroup && !newMember.ageGroup) {
        setNewMember((prev) => ({ ...prev, ageGroup }));
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

    // Check if primary QID conflicts with family members
    if (familyMembers.some((m) => m.qid === data.qid)) {
      toast({
        title: "Duplicate QID",
        description: "Your QID cannot be the same as a family member's QID.",
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
        body: JSON.stringify({
          ...data,
          familyMembers: familyMembers.length > 0 ? familyMembers : undefined,
        }),
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
      // Add family count if there are family members
      if (result.data.familyCount && result.data.familyCount > 0) {
        params.set("familyCount", result.data.familyCount.toString());
      }
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

      {/* Family Members Section */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-vodafone-red" />
              <h3 className="font-semibold">Family Members</h3>
              {familyMembers.length > 0 && (
                <span className="text-xs bg-vodafone-red text-white px-2 py-0.5 rounded-full">
                  {familyMembers.length}
                </span>
              )}
            </div>
            {!showAddFamily && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddFamily(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Register family members together. Each person gets their own QR code, but shares your contact details.
          </p>

          {/* Added Family Members List */}
          {familyMembers.length > 0 && (
            <div className="space-y-2 mb-4">
              {familyMembers.map((member) => (
                <div
                  key={member.qid}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{member.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {AGE_GROUPS.find((g) => g.value === member.ageGroup)?.label} • {member.gender === "MALE" ? "Male" : "Female"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFamilyMember(member.qid)}
                    className="text-gray-400 hover:text-vodafone-red"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Family Member Form */}
          {showAddFamily && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familyQid">QID <span className="text-vodafone-red">*</span></Label>
                  <Input
                    id="familyQid"
                    type="text"
                    placeholder="11-digit QID"
                    maxLength={11}
                    value={newMember.qid}
                    onChange={(e) => setNewMember({ ...newMember, qid: e.target.value.replace(/\D/g, "") })}
                    onBlur={handleNewMemberQIDBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyName">Full Name <span className="text-vodafone-red">*</span></Label>
                  <Input
                    id="familyName"
                    type="text"
                    placeholder="Full name"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Group <span className="text-vodafone-red">*</span></Label>
                  <Select
                    value={newMember.ageGroup}
                    onValueChange={(value) => setNewMember({ ...newMember, ageGroup: value as FamilyMemberInput["ageGroup"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_GROUPS.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gender <span className="text-vodafone-red">*</span></Label>
                  <Select
                    value={newMember.gender}
                    onValueChange={(value) => setNewMember({ ...newMember, gender: value as FamilyMemberInput["gender"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddFamily(false);
                    setNewMember({ qid: "", fullName: "", ageGroup: undefined, gender: undefined });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddFamilyMember}
                >
                  Add Family Member
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-vodafone-red hover:underline"
            >
              terms and conditions
            </Link>{" "}
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
