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
import { ReviewDetailsType, ReviewWithImagesType, VariantInfoType } from "@/lib/types";
// Server actions
import { upsertReview } from "@/actions/review";
// packages
import { toast } from "react-hot-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Star from "../../icons/star";
import RatingStars from "../../shared/rating-stars";

interface Props {
  productId: string;
  reviews: ReviewWithImagesType[];
  data?: ReviewDetailsType;
  variantsInfo: VariantInfoType[];
}

const ratings = [1, 2, 3, 4, 5];

export default function AddReview({productId, reviews, data, variantsInfo }: Props) {
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
      variantName: data?.variant ?? selectedVariant.variantName,
      rating: data?.rating ?? 0,
      size: data?.size ?? "",
      review: data?.review ?? "",
      images: data?.images ?? [],
      color: data?.color ?? "",
    },
  });

  // Loading status based on the form state
  const isSubmitting = form.formState.isSubmitting;
  // Errors
  const errors = form.formState.errors;

  async function onSubmit(values: z.infer<typeof AddReviewSchema>) {
    console.log(values);
    const res = await upsertReview(productId, {
      id: data?.id ?? "",
      variant: values.variantName,
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
    }
  }


  const variants = variantsInfo.map(v => ({
    name: v.variantName,
    value: v.variantName,
    image: v.variantName,
    colors: v.colors.map(c => c.name).join(","),
  }));

  useEffect(() => {
    form.setValue("size", "");
    const name = form.getValues().variantName;
    const variant = variantsInfo.find(v => v.variantName === name);
    if (variant) {
      setSelectedVariant(variant);
      form.setValue("color", variant.colors.join(","));
    }
  }, [form.getValues().variantName,]);

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
              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                      <Select onValueChange={val => field.onChange(Number(val))} >
                    <FormControl>
                        <SelectTrigger className="border-none shadow-none">
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent onCloseAutoFocus={e => e.preventDefault()} className="bg-gray-50">
                        {ratings.map((r) => (
                          <SelectItem key={r} value={String(r)} className="flex items-center ring-1 ring-[transparent] hover:ring-[#11BE86] hover:bg-transparent">
                            <span className="pt-0.5">{r}</span> <RatingStars value={r} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="min-h-32 p-4 w-full rounded-xl focus:outline-none ring-1 ring-[transparent] focus:ring-[#11BE86]"
                          placeholder="Write your review..."
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
