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
import { Category, SubCategory } from "@prisma/client";
import { ProductWithVariantType } from "@/lib/types";
// React Tags
import { WithOutContext as ReactTags } from "react-tag-input";
import type { Tag } from "react-tag-input";
// Shadcn imports
import { Button } from "@/components/ui/button";
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
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
// component for Cloudinary upload
import ImageUpload from "../shared/image-upload";
// Server action
import { getAllSubcategoriesOfACategory } from "@/actions/subcategory";
import { upsertStore } from "@/actions/store";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductDetailsProps {
  data?: ProductWithVariantType;
  categories: Category[];
  storeUrl: string;
}

export default function ProductDetails({
  data,
  categories,
  storeUrl,
}: ProductDetailsProps) {
  const router = useRouter();
  // Local state for colors
  const [colors, setColors] = useState<{ color: string }[]>([{ color: "" }]);
  // Local state for sizes
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount: number }[]
  >([{ size: "", quantity: 1, price: 0.01, discount: 0 }]);
  // Local State for subcategories
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  // Local State for keywords
  const [keywords, setKeywords] = useState<string[]>([])

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
        {
          url: "https://res.cloudinary.com/dkkuvgnl7/image/upload/v1748957644/ag4sk2ouuiqkwkeikfao.png",
        },
        {
          url: "https://res.cloudinary.com/dkkuvgnl7/image/upload/v1749733438/c6m8ej3wrnkfublmhoni.jpg",
        },
        {
          url: "https://res.cloudinary.com/dkkuvgnl7/image/upload/v1749733398/m1pmw6jmuvcdclmhaupw.jpg",
        },
      ],
      categoryId: data?.categoryId ?? "",
      subcategoryId: data?.subcategoryId ?? "",
      isSale: data?.isSale ?? false,
      brand: data?.brand ?? "",
      sku: data?.sku ?? "",
      keywords: data?.keywords ?? [],
      colors: data?.colors ?? [{ color: "" }],
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

  // Update the form values whenever colors, sizes and keywords change
  useEffect(() => {
    form.setValue("colors", colors);
    form.setValue("sizes", sizes);
    form.setValue("keywords", keywords);
  }, [colors, sizes, keywords, form]);

  // Update available subcategories when user selects a category
  const selectedCategoryId = form.watch().categoryId;
  useEffect(() => {
    async function updateSubcategories() {
      const subcategories = await getAllSubcategoriesOfACategory(selectedCategoryId);
      setSubcategories(subcategories);
    }
    updateSubcategories();
  }, [selectedCategoryId]);

  // Handle Keywords input

  function handleAddKeyword(keyword: Tag) {
    if (keywords.length === 10) return;
    setKeywords([...keywords, keyword.text]);
  }

  function handleDeleteKeyword(index:number) {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof ProductFormSchema>) {
    console.log(values);
    // const response = await upsertStore({
    //   id: data?.id,
    //   ...values,
    //   logo: values.logo[0]?.url,
    //   cover: values.cover[0]?.url,
    // });

    // if (!response.success) {
    //   // Show field/form errors if available
    //   if (response.fieldErrors || response.formErrors) {
    //     // Set these errors in form using form.setError
    //     if (response.fieldErrors) {
    //       Object.entries(response.fieldErrors).forEach(([field, messages]) => {
    //         if (messages && messages.length > 0) {
    //           form.setError(field as keyof z.infer<typeof ProductFormSchema>, {
    //             message: messages[0],
    //           });
    //         }
    //       });
    //     }
    //     if (response.formErrors && response.formErrors.length > 0) {
    //       toast.error(response.formErrors.join(", "));
    //     }
    //   } else if (response.message) {
    //     toast.error(response.message);
    //   } else {
    //     toast.error("An unknown error occurred.");
    //   }
    //   return;
    // }

    // // Success
    // toast.success(
    //   `${response.store?.name} store is ${data?.productId ? "updated" : "created"}.`
    // );

    // // Redirect or refresh data
    // if (data?.productId) {
    //   router.refresh();
    // } else {
    //   router.push(`/dashboard/seller/stores/${response.store?.url}`);
    // }
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
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
                                  form.setValue("images", [
                                    ...form.getValues().images,
                                    { url: cldUrl },
                                  ]);
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
                  <div className="flex flex-col gap-y-3 xl:pl-5">
                    <ClickToAddInputs<{ color: string }>
                      details={colors}
                      setDetails={setColors}
                      initialDetail={{ color: "" }}
                      header="Colors"
                    />
                    {form.formState.errors.colors && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.colors.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Store name and Variant name container */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="Product name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Variant Name */}
                  <FormField
                    control={form.control}
                    name="variantName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variant Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="Variant name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Product Description and Variant Description */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Product Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Variant Description */}
                  <FormField
                    control={form.control}
                    name="variantDescription"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variant Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Category & Subcategory */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Subcategory */}
                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product Subcategory</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={form.watch().categoryId === ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategories.map((subcategory) => (
                              <SelectItem
                                key={subcategory.id}
                                value={subcategory.id}
                              >
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Store name and Variant name container */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Brand */}
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product Brand</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} placeholder="Brand" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* SKU */}
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product SKU</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} placeholder="Sku" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Keywords */}
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({  }) => (
                    <FormItem className="relative flex-1">
                      <FormLabel>Product Keywords</FormLabel>
                      <FormControl>
                        <ReactTags
                            handleAddition={handleAddKeyword}
                            handleDelete={() => {}}
                            placeholder="Keywords (e.g., winter jacket, warm, stylish)"
                            classNames={{
                              tagInputField:
                                "bg-background border rounded-md p-2 w-full focus:outline-none",
                            }}
                          />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap gap-1">
                    {keywords.map((k, i) => (
                      <div
                        key={i}
                        className="text-xs inline-flex items-center px-3 py-1 bg-blue-200 text-blue-700 rounded-full gap-x-2"
                      >
                        <span>{k}</span>
                        <span
                          className="cursor-pointer"
                          onClick={() => handleDeleteKeyword(i)}
                        >
                          x
                        </span>
                      </div>
                    ))}
                  </div>

                {/* Sizes */}
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputs<{
                    size: string;
                    price: number;
                    quantity: number;
                    discount: number;
                  }>
                    details={sizes}
                    setDetails={setSizes}
                    initialDetail={{
                      size: "",
                      quantity: 1,
                      price: 0.01,
                      discount: 0,
                    }}
                    header="Size, Quantity, Price, Discount"
                  />
                  {form.formState.errors.sizes && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.sizes.message}
                    </p>
                  )}
                </div>

                {/* Is on sale */}
                <FormField
                  control={form.control}
                  name="isSale"
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
                        <FormLabel>Is on Sale.</FormLabel>
                      </div>
                      <FormDescription>
                        Is this product listed as on sale?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="mt-4"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : data?.variantId
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
