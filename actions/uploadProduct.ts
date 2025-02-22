"use server";

import { createClient } from "../supabase/server";

interface Size {
  name: string;
  quantity: number; 
} 

export const addProduct = async (formData: FormData) => {
  const supabase = await createClient();

  const name = formData.get("productName") as string;
  const category = formData.get("category") as string;
  const subCategory = formData.get("subCategory") as string;
  const tagsString = formData.get("tags") as string;
  const tags = tagsString.split(",").map(tag => tag.trim())
  const description = formData.get("productDescription") as string;
  const price = parseFloat(formData.get("price") as string);
  const sku = formData.get("sku") as string;
  const images = formData.getAll("images") as File[]; // Assumes images are files
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const weight = parseFloat(formData.get("weight") as string);
  const sizes = JSON.parse(formData.get("sizes") as string) as Size[]; // Parse JSON string for sizes
  const qrCode = formData.get("qrCode") as string;


  const productDataInput = {
    name,
    category,
    subCategory,
    tags,
    description,
    price,
    sku,
    images,
    quantity,
    weight,
    sizes,
    qrCode
  };


  // Upload QR code
  let qrCodeUrl = "";
  if (qrCode) {
    const qrFileName = `${sku}-qr-code.png`;
    const response = await fetch(qrCode);
    const qrBlob = await response.blob();

    const { data: qrUploadData, error: qrUploadError } = await supabase.storage
      .from("qrcodes")
      .upload(`qrcodes/${qrFileName}`, qrBlob, { contentType: "image/png" });

    if (qrUploadError) {
      throw new Error(`Error uploading QR code: ${qrUploadError.message}`);
    }

    qrCodeUrl = supabase.storage 
      .from("qrcodes")
      .getPublicUrl(`qrcodes/${qrFileName}`).data.publicUrl;
  }

  // Check if category exists, insert if not
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("name", category)
    .single();

  let categoryId;
  if (categoryError || !categoryData) {
    const { data: newCategoryData, error: newCategoryError } = await supabase
      .from("categories")
      .insert({ name: category })
      .select()
      .single();

    if (newCategoryError) {
      throw new Error(`Error adding new category: ${newCategoryError.message}`);
    }

    categoryId = newCategoryData.id;
  } else {
    categoryId = categoryData.id;
  }

  // Check if subcategory exists under the category, insert if not
  const { data: subCategoryData, error: subCategoryError } = await supabase
    .from("subcategories")
    .select("id, name")
    .eq("name", subCategory)
    .eq("category_id", categoryId)
    .single();

  let subCategoryId;
  if (subCategoryError || !subCategoryData) {
    const { data: newSubCategoryData, error: newSubCategoryError } = await supabase
      .from("subcategories")
      .insert({ name: subCategory, category_id: categoryId })
      .select()
      .single();

    if (newSubCategoryError) {
      throw new Error(`Error adding new subcategory: ${newSubCategoryError.message}`);
    }

    subCategoryId = newSubCategoryData.id;
  } else {
    subCategoryId = subCategoryData.id;
  }

  // Insert product data into the products table
  const { data: productDataInserted, error: productError } = await supabase
    .from("products_list")
    .insert({
      name,
      category_id: categoryId,
      subcategory_id: subCategoryId,
      tags,
      description,
      price,
      sku,
      image_urls: [],
      qr_code_url: qrCodeUrl,
      quantity,
      weight,
    })
    .select();

  if (productError) {
    throw new Error(`Error adding product: ${productError.message}`);
  }

  const productId = productDataInserted[0].id; // Ensure productId is declared after the product insert

  // Handle sizes - check if size exists, if not insert and get the ID
if (sizes && sizes.length > 0) {
  const sizeData = [];
  for (const size of sizes) {
    const { data: existingSize, error: sizeError } = await supabase
      .from("sizes")
      .select("id")
      .eq("name", size.name)  // Search for the size by name
      .single();  // We expect a single result

    let sizeId;
    if (sizeError || !existingSize) {
      // If the size doesn't exist, insert it
      const { data: newSizeData, error: newSizeError } = await supabase
        .from("sizes")
        .insert({ name: size.name })  // Insert new size
        .select()
        .single();  // Retrieve the newly inserted size

      if (newSizeError) {
        throw new Error(`Error adding new size: ${newSizeError.message}`);
      }

      sizeId = newSizeData.id;  // Get the new size ID
    } else {
      sizeId = existingSize.id;  // Size exists, so use its ID
    }

    // Prepare the data for inserting into product_sizes table
    sizeData.push({
      product_id: productId,  // The product ID you want to associate
      size_id: sizeId,        // The size ID from the sizes table
      quantity: size.quantity // The quantity for that size
    });
  }

  // Insert the size data into the product_sizes table
  const { error: sizeInsertionError } = await supabase
    .from("product_sizes")
    .insert(sizeData);

  if (sizeInsertionError) {
    throw new Error(`Error adding product sizes: ${sizeInsertionError.message}`);
  }
}


  // Handle tags
  if (tags && tags.length > 0) {
  const tagData = [];
  for (const tag of tags) {
    const { data: existingTag, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tag)
      .single();

    let tagId;
    if (tagError || !existingTag) {
      // Insert the tag if it doesn't exist
      const { data: newTagData, error: newTagError } = await supabase
        .from("tags")
        .insert({ name: tag })
        .select()
        .single();

      if (newTagError) {
        throw new Error(`Error adding new tag: ${newTagError.message}`);
      }

      tagId = newTagData.id;
    } else {
      tagId = existingTag.id;
    }

    tagData.push({ product_id: productId, tag_id: tagId });
  }

  const { error: tagInsertionError } = await supabase.from("product_tags").insert(tagData);

  if (tagInsertionError) {
    throw new Error(`Error adding product tags: ${tagInsertionError.message}`);
  }
  }

  // Array to hold the image URLs after they are uploaded
const imageUrls: string[] = [];

// Upload each image to Supabase Storage
if (images && images.length > 0) {
  for (const [index, imageFile] of images.entries()) {
    if (imageFile) {
      const fileName = `${sku}-image-${index}.png`;

      // Directly use the File as a Blob
      const blob = imageFile;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(`products/${fileName}`, blob, { contentType: "image/png" });

      if (uploadError) {
        throw new Error(`Error uploading image: ${uploadError.message}`);
      }

      // Get the public URL of the uploaded image
      const publicUrl = supabase.storage
        .from("product-images")
        .getPublicUrl(`products/${fileName}`);
      const imageUrl = publicUrl.data.publicUrl;

      imageUrls.push(imageUrl);

      // Insert the image URL into the product_images table
      const isMain = index === 0; // Set the first image as the main image
      const { error: imageInsertionError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: imageUrl,
          is_main: isMain 
        });

      if (imageInsertionError) {
        throw new Error(`Error adding image to product_images table: ${imageInsertionError.message}`);
      }
    }
  }
} else {
  console.warn("No images provided for upload.");
}


  return productId;  // Return the successfully inserted product id
};
