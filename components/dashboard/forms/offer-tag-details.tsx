"use client";

// React
import { useEffect } from "react";

// Prisma model
import { OfferTag } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { OfferTagFormSchema } from "@/lib/schemas";

// UI Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Queries
import { upsertOfferTag } from "@/actions/offer-tag";

// Utils
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OfferTagDetailsProps {
  data?: OfferTag;
}

export default function OfferTagDetails({ data }: OfferTagDetailsProps) {
  // Initializing necessary hooks
  const router = useRouter();

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof OfferTagFormSchema>>({
    resolver: zodResolver(OfferTagFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name ?? "",
      url: data?.url ?? "",
    },
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        url: data?.url,
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof OfferTagFormSchema>) {
    const response = await upsertOfferTag({
      id: data?.id,
      ...values,
    });

    if (!response.success) {
      // Show field/form errors if available
      if (response.fieldErrors || response.formErrors) {
        // Set these errors in form using form.setError
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof z.infer<typeof OfferTagFormSchema>, {
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
      `${response.data?.name} offer tag is ${data ? "updated" : "created"}.`
    );

    // Redirect or refresh data
    if (data?.id) {
      router.refresh();
    } else {
      router.push(`/dashboard/admin/offer-tags`);
    }
  }

  return (
    <AlertDialog>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Offer Tag Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} offer tag information.`
              : " Lets create an offer tag. You can edit offer tag later from the offer tags table or the offer tag page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Offer tag name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Offer tag url</FormLabel>
                    <FormControl>
                      <Input placeholder="/offer-tag-url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} variant="primary">
                {isLoading
                  ? "loading..."
                  : data?.id
                  ? "Save offer tag information"
                  : "Create offer tag"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
