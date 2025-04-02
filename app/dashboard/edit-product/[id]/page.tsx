"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";
import { useGetProductDetails } from "@/hooks/use-get-product-details";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useEditProduct } from "@/hooks/use-edit-product";

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  weight: z.number(),
  quantity: z.number(),
});

const Page = () => {
  const params = useParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { mutate, isPending } = useEditProduct();

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({
      ...data?.data,
      id: params.id as string,
      name: values!.name,
      description: values.description,
      price: values.price,
      weight: values.weight,
      quantity: values.quantity,
    });
  }

  const { data, isLoading } = useGetProductDetails(params.id as string);

  // useEffect(() => {
  //   if (data) {
  //     form.setValue("name", data.data?.name || "");
  //     form.setValue("description", data.data?.description || "");
  //     form.setValue("price", data.data?.price || 0);
  //     form.setValue("weight", data.data?.weight || 0);
  //     form.setValue("quantity", data.data?.quantity || 0);
  //   }
  // }, [data, form]);

  // if (isLoading) {
  //   return "loading...";
  // }

  return (
    <section className="mt-10">
      <h1 className="font-bold text-3xl mb-5">Edit Product</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 max-w-sm"
        >
          <input type="hidden" name="id" value={data?.data.id} />

          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="T-shirt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="quantity"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <NumericInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="price"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <NumericInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="weight"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <NumericInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            Save
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default Page;
