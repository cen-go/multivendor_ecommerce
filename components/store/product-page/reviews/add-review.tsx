"use client"

// React & Next.js
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// useForm hook and Zod
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Validation schema
import { AddReviewSchema } from "@/lib/schemas";
// Types
import { ReviewDetailsType, VariantInfoType } from "@/lib/types";
// Server actions
import { upsertReview } from "@/actions/review";
// packages
import { toast } from "react-hot-toast";
// ShadCN and UI
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PulseLoader } from "react-spinners";
import { Label } from "@/components/ui/label";
// Components
import RatingStars from "../../shared/rating-stars";
import { Button } from "../../ui/button";
import UploadImage from "../../shared/upload-images";

interface Props {
  productId: string;
  data?: ReviewDetailsType;
  variantsInfo: VariantInfoType[];
  UpdateReviews: () => Promise<void>;
}

const ratings = [1, 2, 3, 4, 5];

export default function AddReview({productId, data, variantsInfo, UpdateReviews }: Props) {
  // the active variant through url params
  const { variantSlug } = useParams();
  const activeVariant = variantsInfo.find(
    (variant) => variant.variantSlug === variantSlug
  );
  // State for the active variant
  const [selectedVariant, setSelectedVariant] = useState<VariantInfoType>(activeVariant ?? variantsInfo[0]);
  
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof AddReviewSchema>>({
    mode: "onChange",
    resolver: zodResolver(AddReviewSchema),
    defaultValues: {
      variant: data?.variant ?? selectedVariant.variantName,
      rating: data?.rating ?? 0,
      size: data?.size ?? "",
      review: data?.review ?? "",
      images: data?.images ?? [],
      color: data?.color ?? "",
    },
  });

  // Loading status based on the form state
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof AddReviewSchema>) {
    const res = await upsertReview(productId, {
      id: data?.id ?? "",
      variant: values.variant,
      rating: values.rating,
      review: values.review,
      size:values.size,
      color: values.color,
      images: values.images,
    });
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      UpdateReviews();
      form.reset();
    }
  }

  const variantField = form.watch().variant;

  useEffect(() => {
    form.setValue("size", selectedVariant.sizes[0].size);
    const name = form.getValues().variant;
    const variant = variantsInfo.find(v => v.variantName === name);
    if (variant) {
      setSelectedVariant(variant);
      form.setValue("color", variant.colors.map(c => c.name).join(","));
    }
  }, [variantField, form, variantsInfo, selectedVariant.sizes]);

  return (
    <div className="p-4 bg-[#f5f5f5] rounded-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col space-y-4">
            <div className="pt-4">
              <h1 className="font-bold text-2xl">Add a review</h1>
            </div>
            {/* Form items */}
            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center flex-wrap gap-6">
                {/* Rating */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="cursor-pointer bg-[#fcfcfc] border-none"
                            aria-label="Select rating."
                          >
                            <SelectValue placeholder="Select a rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          className="bg-[#fcfcfc]"
                        >
                          {ratings.map((r) => (
                            <SelectItem
                              key={r}
                              value={String(r)}
                              className="flex items-center ring-1 ring-[transparent] hover:ring-[#11BE86] hover:bg-transparent"
                            >
                              <span className="pt-0.5">{r}</span>{" "}
                              <RatingStars value={r} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Variant Selector */}
                <FormField
                  control={form.control}
                  name="variant"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={selectedVariant.variantName}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="cursor-pointer bg-[#fcfcfc] border-none"
                            aria-label="Select product variant"
                          >
                            <SelectValue placeholder="Select a product variant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          className="bg-[#fcfcfc]"
                        >
                          {variantsInfo.map((v) => (
                            <SelectItem
                              key={v.variantSlug}
                              value={v.variantName}
                              className="flex items-center ring-1 ring-[transparent] hover:ring-[#11BE86] hover:bg-transparent"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="flex gap-1.5">
                                  {v.colors.map((c) => (
                                    <div
                                      key={c.id}
                                      className="w-6 h-6 my-0.5 rounded-full shadow"
                                      style={{ background: c.name }}
                                    />
                                  ))}
                                </span>
                                <span>{v.variantName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Size Selector */}
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Label>Size:</Label>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger
                              className="cursor-pointer bg-[#fcfcfc] border-none"
                              aria-label="Select size"
                            >
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            onCloseAutoFocus={(e) => e.preventDefault()}
                            className="bg-[#fcfcfc]"
                          >
                            {selectedVariant.sizes.map((size) => (
                              <SelectItem
                                key={size.id}
                                value={size.size}
                                className="flex items-center ring-1 ring-[transparent] hover:ring-[#11BE86] hover:bg-transparent"
                              >
                                {size.size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Review Text */}
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        className="min-h-32 p-4 w-full rounded-xl bg-[#fcfcfc] focus:outline-none ring-1 ring-[transparent] focus:ring-[#11BE86]"
                        placeholder="Write your review..."
                        value={field.value}
                        onChange={field.onChange}
                        aria-label="Review field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Images */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div>
                        <FormMessage className="!mt-4" />
                        <UploadImage
                          value={field.value.map((image) => image.url)}
                          disabled={isSubmitting}
                          maxImages={3}
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
            </div>
          </div>
          <div className="w-full flex justify-end">
            <Button type="submit" className="w-36 h-12">
              {isSubmitting ? (
                <PulseLoader size={5} color="#fff" />
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
