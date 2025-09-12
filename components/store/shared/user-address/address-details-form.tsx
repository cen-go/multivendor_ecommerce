"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { ShippingAddressSchema } from "@/lib/schemas";
// Types
import { SelectMenuOption, UserShippingAddressType } from "@/lib/types";
import { Country } from "@prisma/client";
// Shadcn imports
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { Button } from "../../ui/button";
import CountrySelector from "@/components/shared/country-selector";
// Server action
import { upsertUserAddress } from "@/actions/user";

interface Props {
  data?: UserShippingAddressType;
  countries: Country[];
  setShowModal: Dispatch<SetStateAction<boolean>>
}

export default function AddressDetailsForm({ data, countries, setShowModal }: Props) {
  const router = useRouter();

  // State for country selector
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<SelectMenuOption>(data?.country ?? countries[0])

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ShippingAddressSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(ShippingAddressSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      title: data?.title ?? "",
      countryId: data?.countryId ?? "",
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      address1: data?.address1 ?? "",
      address2: data?.address2 ?? "",
      city: data?.city ?? "",
      zip_code: data?.zip_code ?? "",
      phone: data?.phone ?? "",
      default: data?.default ?? false,
    },
  });

  // Reset form values when data prop changes
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  function handleCountryChange(countryCode:string) {
    const country = countries.find(c => c.code === countryCode);

    if (country) {
      setSelectedCountry(country);
      form.setValue("countryId", country.id)
    }
  }

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof ShippingAddressSchema>) {
    const response = await upsertUserAddress({
      id: data?.id ?? "",
      ...values,
    });

    if (!response.success) {
      // Show field/form errors if available
      if (response.fieldErrors || response.formErrors) {
        // Set these errors in form using form.setError
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(
                field as keyof z.infer<typeof ShippingAddressSchema>,
                {
                  message: messages[0],
                }
              );
            }
          });
        }
        if (response.formErrors && response.formErrors.length > 0) {
          toast.error(response.formErrors.join(", "));
        }
      } else if (response.message) {
        toast.error(response.message);
      } else {
        toast.error("An unknown error occurred.");
      }
      return;
    }

    // Display success message
    toast.success(response.message);

    // refresh data and close the modal
    router.refresh();
    setShowModal(false);
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Address Title</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Address title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="First name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="Last name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address1"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Street, house/apartment" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Flat number, district, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="City" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Zip Code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          

          <FormField
            control={form.control}
            name="countryId"
            render={() => (
              <FormItem className="flex-1" aria-label="Select country">
                <FormControl>
                  <CountrySelector
                    id="countries"
                    open={isOpen}
                    onToggle={() => setIsOpen((prev) => !prev)}
                    onChange={(val) => handleCountryChange(val)}
                    selectedValue={selectedCountry}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="default"
            render={({ field }) => (
              <FormItem className="flex-1 border p-4 rounded-md">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-5 h-5"
                    />
                  </FormControl>
                  <FormLabel>Default</FormLabel>
                </div>
                <FormDescription>
                  This will be your default address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="mt-6">
            {isSubmitting
              ? "Submitting..."
              : data?.id
              ? "Save address information"
              : "Create address"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
