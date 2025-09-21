"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { CouponFormSchema } from "@/lib/schemas";
// Types
import { Coupon } from "@prisma/client";
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
// Server action
import { upsertCoupon } from "@/actions/coupon";
// Components
import { DateTimePicker } from "@/components/ui/date-time-picker";
// Utils
import { format } from "date-fns";

interface CouponDetailsProps {
  data?: Coupon;
  storeUrl: string
}

export default function CouponDetailsForm({ data, storeUrl }: CouponDetailsProps) {
  const router = useRouter();

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof CouponFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(CouponFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      code: data?.code ?? "",
      discount: data?.discount ?? 0,
      startDate: data?.startDate ?? "",
      endDate: data?.endDate ?? "",
    },
  });

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof CouponFormSchema>) {
    const response = await upsertCoupon({
      id: data?.id || "",
      ...values,
    }, storeUrl);

    if (!response.success) {
      // Show field/form errors if available
      if (response.fieldErrors || response.formErrors) {
        // Set these errors in form using form.setError
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof z.infer<typeof CouponFormSchema>, {
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

    // Display success message
    toast.success(response.message);

    // Redirect or refresh data
    if (data?.id) {
      router.refresh();
    } else {
      router.push(`/dashboard/seller/stores/${storeUrl}/coupons/`);
    }
  }

  return (
    <AlertDialog>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Coupon Information</CardTitle>
          <CardDescription className="mt-2">
            {data?.id
              ? `Update ${data?.code} coupon information.`
              : " Lets create a coupon. You can edit coupon later from the coupons table or the coupon page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Coupon code</FormLabel>
                      <FormControl>
                        <Input placeholder="Coupon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Coupon discount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          step={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="%"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start date</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : ""
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : ""
                            )
                          }
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
                disabled={isSubmitting}
                className="mt-2"
              >
                {isSubmitting
                  ? "loading..."
                  : data?.id
                  ? "Save coupon information"
                  : "Create coupon"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
