"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { StoreFormSchema } from "@/lib/schemas";
// Types
import { Store } from "@prisma/client";
// Shadcn imports
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
// component for Cloudinary upload
import ImageUpload from "../shared/image-upload";
import { Textarea } from "@/components/ui/textarea";
import { upsertStore } from "@/actions/store";
// Server action
// import { upsertStore } from "@/actions/store";

interface StoreDetailsProps {
  data?: Store;
}

export default function StoreDetails({ data }: StoreDetailsProps) {
  const router = useRouter()

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof StoreFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(StoreFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name ?? "",
      description: data?.description ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      url: data?.url ?? "",
      logo: data?.logo ? [{ url: data?.logo }] : [],
      cover: data?.cover ? [{ url: data?.cover }] : [],
    },
  });

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        logo: [{ url: data?.logo }],
        cover: [{ url: data?.cover }],
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof StoreFormSchema>) {
    const response = await upsertStore({
      id: data?.id,
      ...values,
      logo: values.logo[0]?.url,
      cover: values.cover[0]?.url,
    });

    if (!response.success) {
      // Show field/form errors if available
      if (response.fieldErrors || response.formErrors) {
        // Set these errors in form using form.setError
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof z.infer<typeof StoreFormSchema>, {
                message: messages[0],
              });
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

    // Success
    toast.success(
      `${response.store?.name} store is ${data?.id ? "updated" : "created"}.`
    );

    // Redirect or refresh data
    if (data?.id) {
      router.refresh();
    } else {
      router.push(`/dashboard/seller/stores/${response.store?.url}`);
    }
  }

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Store Information</CardTitle>
          <CardDescription className="mt-2">
            {data?.id
              ? `Update ${data.name} store information.`
              : "Let's create a store. You can change store settings later from the store settings page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Logo & cover image Container */}
              <div className="relative w-full mb-24">
                {/* Logo Image */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem className="absolute -bottom-16 left-12 z-10">
                      <FormControl>
                        <ImageUpload
                          type="profile"
                          value={field.value.map((image) => image.url)}
                          disabled={isSubmitting}
                          onChange={(cldUrl) =>
                            field.onChange([{ url: cldUrl }])
                          }
                          onRemove={(cldUrl) =>
                            field.onChange(
                              [...field.value].filter(
                                (image) => image.url !== cldUrl
                              )
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Cover Image */}
                <FormField
                  control={form.control}
                  name="cover"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          type="cover"
                          value={field.value.map((image) => image.url)}
                          disabled={isSubmitting}
                          onChange={(cldUrl) =>
                            field.onChange([{ url: cldUrl }])
                          }
                          onRemove={(cldUrl) =>
                            field.onChange(
                              [...field.value].filter(
                                (image) => image.url !== cldUrl
                              )
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-end" />
                    </FormItem>
                  )}
                />
              </div>
              {/* Store name and URL container */}
              <div className="flex flex-col md:flex-row gap-4">
              {/* Store Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Store URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Store Url</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="/store-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              {/* Store Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Store Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Contact details container */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Store Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="Email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="mt-4"
              >
                {isSubmitting
                  ? "Submitting..."
                  : data?.id
                  ? "Save store information"
                  : "Create store"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
