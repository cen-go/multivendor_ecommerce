"use client";

// Next and React imports
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// useForm utilities
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Schema for validation
import { SubcategoryFormSchema } from "@/lib/schemas";
// Types
import { Category, SubCategory } from "@prisma/client";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
// component for Cloudinary upload
import ImageUpload from "../shared/image-upload";
// Server action
import { upsertSubcategory } from "@/actions/subcategory";

interface subcategoryDetailsProps {
  data?: SubCategory;
  categories: Category[];
}

export default function SubcategoryDetails({ data, categories }: subcategoryDetailsProps) {
  const router = useRouter()

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof SubcategoryFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(SubcategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name ?? "",
      image: data?.image ? [{ url: data?.image }] : [],
      url: data?.url ?? "",
      featured: data?.featured ?? false,
      categoryId: data?.categoryId ?? "",
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
        categoryId: data.categoryId,
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  async function onSubmit(values: z.infer<typeof SubcategoryFormSchema>) {
    console.log(values);
    try {
      const response = await upsertSubcategory({
        id: data?.id,
        ...values,
        image: values.image[0].url,
      })
      // Display success message
      toast.success(
        `${response.name} subcategory is ${data?.id ? "updated" : "created"}.`
      );

      // Redirect or refresh data
      if (data?.id) {
        router.refresh();
      } else {
        router.push("/dashboard/admin/subcategories");
      }
    } catch {
      toast.error(`An error occured!`)
    }
  }

  const formdata = form.watch();
  console.log(formdata);

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Subcategory Information</CardTitle>
          <CardDescription className="mt-2">
            {data?.id
              ? `Update ${data.name} subcategory information.`
              : "Let's create a subcategory. You can change subcategory settings later from the categories table or the subcategory page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Subcategory image */}
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
              {/* Subcategory name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Subcategory Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Subcategory URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Subcategory Url</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="/subcategory-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Featured */}
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
                      This subcategory will appear on the home page.
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
                  ? "Save subcategory information"
                  : "Create subcategory"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
