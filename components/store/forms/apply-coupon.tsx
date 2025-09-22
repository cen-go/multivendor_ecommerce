"use client";

// Next and React imports
import { Dispatch, SetStateAction } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { ApplyCouponFormSchema } from "@/lib/schemas";
// Shadcn imports
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { CartWithCartItemsType } from "@/lib/types";
import { applyCoupon } from "@/actions/coupon";
// Server action

interface Props {
  cartId: string;
  setCart: Dispatch<SetStateAction<CartWithCartItemsType>>;
}

export default function ApplyCouponForm({ cartId, setCart }: Props) {
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ApplyCouponFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(ApplyCouponFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      coupon: "",
    },
  });

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof ApplyCouponFormSchema>) {
    const response = await applyCoupon(values.coupon, cartId);
    if (response.success && response.cart) {
      setCart(response.cart);
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative bg-gray-100 rounded-2xl shadow-sm p-1.5 hover:shadow-md">
          <FormField
            control={form.control}
            name="coupon"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Enter coupon code"
                    className="w-full pl-8 pr-24 py-3 text-base border-none shadow-none text-main-primary bg-transparent rounded-lg focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 w-20 rounded-2xl"
          >
            {isSubmitting ? "Submitting..." : "Apply"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
