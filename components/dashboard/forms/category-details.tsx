"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { CategoryFormSchema } from "@/lib/schemas";
// Types
import { Category } from "@prisma/client";
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
import { toast } from "sonner";
// component for Cloudinary upload
import ImageUpload from "../shared/image-upload";
// Server action
import { upsertCategory } from "@/actions/category";

interface CategoryDetailsProps {
  data?: Category;
}

export default function CategoryDetails({ data }: CategoryDetailsProps) {
  const router = useRouter()

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(CategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name ?? "",
      image: data?.image ? [{ url: data?.image }] : [],
      url: data?.url ?? "",
      featured: data?.featured ?? false,
    },
  });

  // Loading status based on form submission
  const isSubmitting = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        image: [{ url: data.image }],
        url: data.url,
        featured: data.featured,
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof CategoryFormSchema>) {
    console.log(values);
    try {
      const response = await upsertCategory({
        id: data?.id,
        ...values,
        image: values.image[0].url,
      })
      // Display success message
      toast.success(
        `${response.name} category is ${data?.id ? "updated" : "created"}.`
      );

      // Redirect or refresh data
      if (data?.id) {
        router.refresh();
      } else {
        router.push("/dashboard/admin/categories");
      }
    } catch {
      toast.error(`An error occured!`)
    }
  }

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Category Information</CardTitle>
          <CardDescription className="mt-2">
            {data?.id
              ? `Update ${data.name} category information.`
              : "Let's create a category. You can change category settings later from the categories table or the category page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="justify-center">
                    <FormControl>
                      <ImageUpload
                        type="profile"
                        value={field.value.map((image) => image.url)}
                        disabled={isSubmitting}
                        onChange={(cldUrl) => field.onChange([{ url: cldUrl }])}
                        onRemove={(cldUrl) =>
                          field.onChange(
                            [...field.value].filter(
                              (image) => image.url !== cldUrl
                            )
                          )
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Name" />
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
                    <FormLabel>Category Url</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="/category-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
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
                      <FormLabel>Featured</FormLabel>
                    </div>
                    <FormDescription>
                      This category will appear on the home page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="mt-2"
              >
                {isSubmitting
                  ? "Submitting..."
                  : data?.id
                  ? "Save category information"
                  : "Create category"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
