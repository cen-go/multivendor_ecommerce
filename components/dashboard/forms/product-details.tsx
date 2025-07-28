"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
// component for Cloudinary upload
import ImageUpload from "../shared/image-upload";
// Server action
import { getAllSubcategoriesOfACategory } from "@/actions/subcategory";
import { upsertProduct } from "@/actions/product";
// Custom components
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
// Utils
import { format } from "date-fns";
import JoditEditor from "jodit-react";


interface ProductDetailsProps {
  data?: Partial<ProductWithVariantType>;
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

  // Local state for Product Specs
  const [productSpecs, setProductSpecs] = useState<
    { name: string; value: string }[]
  >(data?.product_specs ?? [{ name: "", value: "" }]);

  // Local state for Product Variant Specs
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(data?.variant_specs ?? [{ name: "", value: "" }]);

  // Local state for Product Questions
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(data?.questions ?? [{ question: "", answer: "" }]);

  // Local State for subcategories
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);

  // Local State for keywords
  const [keywords, setKeywords] = useState<string[]>([]);

  // Referances for Jodit Editor
  const productDscEditor = useRef(null);
  const variantDscEditor = useRef(null);

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
      images: data?.images ?? [],
      variantImage: data?.variantImage ? [{ url: data.variantImage }] : [],
      categoryId: data?.categoryId ?? "",
      subcategoryId: data?.subcategoryId ?? "",
      brand: data?.brand ?? "",
      sku: data?.sku ?? "",
      keywords: data?.keywords ?? [],
      colors: data?.colors ?? [{ color: "" }],
      sizes: data?.sizes ?? [],
      product_specs: data?.product_specs ?? [],
      variant_specs: data?.variant_specs ?? [],
      isSale: data?.isSale ?? false,
      weight: data?.weight,
      saleEndDate:
        data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      questions: data?.questions ?? []
    },
  });

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        variantImage: data.variantImage ? [{ url: data.variantImage }] : [],
        images: data.images ?? [],
        isSale: data.isSale ?? false,
      });
    }
  }, [data, form]);

  // Update the form values whenever colors, sizes and keywords change
  useEffect(() => {
    form.setValue("colors", colors);
    form.setValue("sizes", sizes);
    form.setValue("keywords", keywords);
    form.setValue("product_specs", productSpecs);
    form.setValue("variant_specs", variantSpecs);
    form.setValue("questions", questions);
  }, [colors, sizes, keywords, form, productSpecs, variantSpecs, questions]);

  // Update available subcategories when user selects a category
  const selectedCategoryId = form.watch().categoryId;
  useEffect(() => {
    async function updateSubcategories() {
      const subcategories = await getAllSubcategoriesOfACategory(
        selectedCategoryId
      );
      setSubcategories(subcategories);
    }
    updateSubcategories();
  }, [selectedCategoryId]);

  // Handle Keywords input

  function handleAddKeyword(keyword: Tag) {
    if (keywords.length === 10) return;
    setKeywords([...keywords, keyword.text]);
  }

  function handleDeleteKeyword(index: number) {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof ProductFormSchema>) {
    const response = await upsertProduct(
      {
        productId: data?.productId,
        variantId: data?.variantId,
        ...values,
        variantImage: values.variantImage[0].url,
      },
      storeUrl
    );

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
    // Redirect or refresh data
    if (data?.productId) {
      toast.success("Product variant has been created.");
      router.refresh();
    } else {
      toast.success(response.message);
      router.push(`/dashboard/seller/stores/${storeUrl}/products`);
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
              {/* IMAGES & COLORS  Container */}
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
                            images={form.getValues().images ?? []}
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
                    colorPicker
                  />
                  {form.formState.errors.colors && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.colors.message}
                    </p>
                  )}
                </div>
              </div>
              {/* PRODUCT NAME and VARIANT NAME container */}
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

              {/* Product and Variant DESCRIPTION editor - Tabs */}
              <div className="flex w-full flex-col gap-6 border p-4 rounded-md">
                <Tabs defaultValue={data ? "variant" : "product"}>
                  <TabsList className="w-full">
                    <TabsTrigger className="cursor-pointer" value="product">
                      Product
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="variant">
                      Variant
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="product">
                    {/* Product Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="mt-2">
                            Product Description
                          </FormLabel>
                          <FormControl>
                            <JoditEditor
                              ref={productDscEditor}
                              value={form.getValues().description}
                              onChange={(content) => field.onChange(content)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="variant">
                    {/* Variant Description */}
                    <FormField
                      control={form.control}
                      name="variantDescription"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="mt-2">
                            Variant Description
                          </FormLabel>
                          <FormControl>
                            <JoditEditor
                              ref={variantDscEditor}
                              value={form.getValues().variantDescription}
                              onChange={(content) => field.onChange(content)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* CATEGORY & SUBCATEGORY */}
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

              {/* BRAND & Weight */}
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
                {/* Weight */}
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Product Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.001}
                          min={0}
                          {...field}
                          placeholder="weight"
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* VARIANT IMAGE + KEYWORDS container */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Variant image */}
                <div className="border-e pe-6">
                  <FormField
                    control={form.control}
                    name="variantImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ms-8">Variant Image</FormLabel>
                        <FormControl>
                          <div>
                            <ImageUpload
                              type="profile"
                              value={field.value.map((image) => image.url)}
                              disabled={isSubmitting}
                              onChange={(cldUrl) => {
                                // field.value is always the latest value
                                if (
                                  !field.value.some((img) => img.url === cldUrl)
                                ) {
                                  form.setValue("variantImage", [
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
                        <FormMessage className="!mt-4" />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Keywords */}
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({}) => (
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
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
                </div>
              </div>

              {/* SIZES */}
              <div className="w-full flex flex-col gap-y-3 mt-6">
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
              {/* PRODUCT & VARIANT SPECS */}
              <div className="flex w-full flex-col gap-6 border p-4 rounded-md">
                <Tabs defaultValue={data ? "variantSpecs" : "productSpecs"}>
                  <TabsList className="w-full">
                    <TabsTrigger
                      className="cursor-pointer"
                      value="productSpecs"
                    >
                      Product Specifications
                    </TabsTrigger>
                    <TabsTrigger
                      className="cursor-pointer"
                      value="variantSpecs"
                    >
                      Variant Specifications
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="productSpecs">
                    {/* Product Specs */}
                    <div className="w-full flex flex-col gap-y-3 mt-2">
                      <ClickToAddInputs<{
                        name: string;
                        value: string;
                      }>
                        details={productSpecs}
                        setDetails={setProductSpecs}
                        initialDetail={{
                          name: "",
                          value: "",
                        }}
                      />
                      {form.formState.errors.product_specs && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.product_specs.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="variantSpecs">
                    {/* Variant Specs */}
                    <div className="w-full flex flex-col gap-y-3 mt-2">
                      <ClickToAddInputs<{
                        name: string;
                        value: string;
                      }>
                        details={variantSpecs}
                        setDetails={setVariantSpecs}
                        initialDetail={{
                          name: "",
                          value: "",
                        }}
                      />
                      {form.formState.errors.variant_specs && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.variant_specs.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* IS SALE & DATE TIME PICKER container */}
              <div className="flex flex-col md:flex-row gap-4 border p-4 rounded-md">
                {/* Is on sale */}
                <FormField
                  control={form.control}
                  name="isSale"
                  render={({ field }) => (
                    <FormItem className="flex-1">
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
                {/* Date Time picker */}
                {form.getValues().isSale && (
                  <FormField
                    control={form.control}
                    name="saleEndDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Sale End Date</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            onChange={(date) =>
                              field.onChange(
                                date
                                  ? format(date, "yyyy-MM-dd'T'HH:mm:ss")
                                  : ""
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Product Questions */}
              <div className="w-full flex flex-col gap-y-3 mt-2">
                <ClickToAddInputs<{
                  question: string;
                  answer: string;
                }>
                  details={questions}
                  setDetails={setQuestions}
                  initialDetail={{
                    question: "",
                    answer: "",
                  }}
                  header="Product Questions"
                />
                {form.formState.errors.questions && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.questions.message}
                  </p>
                )}
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
                  : data?.productId
                  ? "Create variant"
                  : "Create product"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
