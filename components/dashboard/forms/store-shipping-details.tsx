"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { StoreShippingFormSchema } from "@/lib/schemas";
// Types
import { StoreShippingDetailType } from "@/lib/types";
// Shadcn imports & UI components
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
import { Textarea } from "@/components/ui/textarea";
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
import { updateStoreDefaultShippingDetails } from "@/actions/store";

interface StoreShippingDetailsProps {
  data?: StoreShippingDetailType;
  storeUrl: string;
}

export default function StoreShippingDetails({
  data,
  storeUrl,
}: StoreShippingDetailsProps) {
  const router = useRouter();

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof StoreShippingFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(StoreShippingFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      returnPolicy: data?.returnPolicy ?? "",
      defaultShippingService: data?.defaultShippingService ?? "",
      defaultShippingFeePerItem: data?.defaultShippingFeePerItem
        ? data.defaultShippingFeePerItem / 100
        : 0,
      defaultShippingFeePerAdditionalItem:
        data?.defaultShippingFeePerAdditionalItem
          ? data.defaultShippingFeePerAdditionalItem / 100
          : 0,
      defaultShippingFeePerKg: data?.defaultShippingFeePerKg
        ? data.defaultShippingFeePerKg / 100
        : 0,
      defaultShippingFeeFixed: data?.defaultShippingFeeFixed
        ? data.defaultShippingFeeFixed / 100
        : 0,
      defaultDeliveryTimeMin: data?.defaultDeliveryTimeMin ?? 0,
      defaultDeliveryTimeMax: data?.defaultDeliveryTimeMax ?? 0,
    },
  });

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        defaultShippingFeePerItem: data.defaultShippingFeePerItem / 100,
        defaultShippingFeePerAdditionalItem:
          data.defaultShippingFeePerAdditionalItem / 100,
        defaultShippingFeePerKg: data.defaultShippingFeePerKg / 100,
        defaultShippingFeeFixed: data.defaultShippingFeeFixed / 100,
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof StoreShippingFormSchema>) {
    const response = await updateStoreDefaultShippingDetails(storeUrl, values);

    if (!response.success) {
      // Show field/form errors if available
      if (response.fieldErrors || response.formErrors) {
        // Set these errors in form using form.setError
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(
                field as keyof z.infer<typeof StoreShippingFormSchema>,
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

    // Refresh data
    router.refresh();
  }

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Store Shipping Details</CardTitle>
          <CardDescription className="mt-2">
            Update your store&apos;s shipping information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="defaultShippingService"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shipping Service Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Default shipping service"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Container for Shipping fee fields */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <FormField
                  control={form.control}
                  name="defaultShippingFeePerItem"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between">
                      <FormLabel>Shippin Fee Per Item</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Shippin Fee Per Item"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultShippingFeePerAdditionalItem"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between">
                      <FormLabel>Shippin Fee Per Additional Item</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Shippin Fee Per Additional Item"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultShippingFeePerKg"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between">
                      <FormLabel>Shipping Fee Per Kilogram</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Shipping Fee Per Kilogram"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultShippingFeeFixed"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between">
                      <FormLabel>Fixed Shipping Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="ShippingFeePerItem"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Container for delivery times */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <FormField
                  control={form.control}
                  name="defaultDeliveryTimeMin"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between">
                      <FormLabel>Default minimum delivery time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Default minimum delivery time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultDeliveryTimeMax"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between">
                      <FormLabel>Default maximum delivery time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Default maximum delivery time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Return Policy Field */}
              <FormField
                control={form.control}
                name="returnPolicy"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Return Policy</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Define your return Policy here..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="mt-2"
              >
                {isSubmitting ? "Submitting..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
