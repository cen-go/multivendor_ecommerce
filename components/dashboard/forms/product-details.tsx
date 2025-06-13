"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { ProductFormSchema } from "@/lib/schemas";
// Types
import { Category } from "@prisma/client";
import { ProductWithVariantType } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// component for Cloudinary upload
import ImageUpload from "../shared/image-upload";
// Server action
import { upsertStore } from "@/actions/store";
import ImagesPreviewGrid from "../shared/images-preview-grid";

interface ProductDetailsProps {
  data?: ProductWithVariantType;
  categories: Category[];
  storeUrl: string;
}

export default function ProductDetails({ data }: ProductDetailsProps) {
  const router = useRouter();
  const [colors, setColors] = useState<{color: string}[]>([]);

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(ProductFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name ?? "",
      description: data?.description ?? "",
      variantName: data?.variantName ?? "",
      variantDescription: data?.variantDescription ?? "",
      images: data?.images ?? [
        {url: "https://res.cloudinary.com/dkkuvgnl7/image/upload/v1748957644/ag4sk2ouuiqkwkeikfao.png"},
        {url: "https://res.cloudinary.com/dkkuvgnl7/image/upload/v1749733438/c6m8ej3wrnkfublmhoni.jpg"},
        {url: "https://res.cloudinary.com/dkkuvgnl7/image/upload/v1749733398/m1pmw6jmuvcdclmhaupw.jpg"},
      ],
      categoryId: data?.categoryId ?? "",
      subcategoryId: data?.subcategoryId ?? "",
      isSale: data?.isSale ?? false,
      brand: data?.brand ?? "",
      sku: data?.sku ?? "",
      keywords: data?.keywords ?? [],
      colors: data?.colors ?? [{color: ""}],
      sizes: data?.sizes ?? [],
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
  async function onSubmit(values: z.infer<typeof ProductFormSchema>) {
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
              form.setError(field as keyof z.infer<typeof ProductFormSchema>, {
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
      `${response.store?.name} store is ${data?.productId ? "updated" : "created"}.`
    );

    // Redirect or refresh data
    if (data?.productId) {
      router.refresh();
    } else {
      router.push(`/dashboard/seller/stores/${response.store?.url}`);
    }
  }

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Product Information</CardTitle>
          <CardDescription className="mt-2">
            {data?.productId && data.variantId
              ? `Update ${data.name} product information.`
              : "Let's create a product. You can change product settings later from the products page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Images & Colors  Container */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Images */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <ImagesPreviewGrid
                            images={form.getValues().images}
                            colors={colors}
                            setColors={setColors}
                            onRemove={(cldUrl) =>
                              field.onChange(
                                [...field.value].filter(
                                  (image) => image.url !== cldUrl
                                )
                              )
                            }
                          />
                          <FormMessage className="!mt-4" />
                          <ImageUpload
                            type="standard"
                            value={field.value.map((image) => image.url)}
                            disabled={isSubmitting}
                            dontShowPreview
                            onChange={(cldUrl) => {
                              // field.value is always the latest value
                              if (
                                !field.value.some((img) => img.url === cldUrl)
                              ) {
                                form.setValue("images", [...form.getValues().images, {url: cldUrl}]);
                              }
                            }}
                            onRemove={(cldUrl) =>
                              field.onChange(
                                [...field.value].filter(
                                  (image) => image.url !== cldUrl
                                )
                              )
                            }
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Colors */}
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl></FormControl>
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
                        <Input
                          type="text"
                          {...field}
                          placeholder="/store-url"
                        />
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
                        <Input {...field} placeholder="Phone number" />
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
