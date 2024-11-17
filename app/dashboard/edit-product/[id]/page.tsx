import { editProduct } from "@/actions/edit-product";
import { getProduct } from "@/actions/get-product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  const { data, error } = await getProduct(id);

  if (error || !data) {
    console.error(error);

    return null;
  }

  return (
    <section className="mt-10">
      <h1 className="font-bold text-3xl mb-5">Edit Product</h1>

      <form className="flex flex-col gap-4 max-w-sm" >
        <input type="hidden" name="id" value={data.id} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="font-bold">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Name"
            name="name"
            defaultValue={data?.name}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description" className="font-bold">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Description"
            name="description"
            defaultValue={data?.description}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="price" className="font-bold">
            Price
          </Label>
          <NumericInput id="price" name="price" defaultValue={data?.price} />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-bold">Images</Label>

          {data?.image_urls?.length === 0 && (  
            <p className="">No images found for this product</p>
          )}

          {data?.image_urls?.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`Image ${index}`}
                className="size-24 bg-slate-200"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="weight" className="font-bold">
            Weight
          </Label>

          <NumericInput id="weight" name="weight" defaultValue={data?.weight} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity" className="font-bold">
            Quantity
          </Label>

          <NumericInput
            id="quantity"
            name="quantity"
            defaultValue={data?.quantity}
          />
        </div>

        <Button formAction={editProduct}>Save</Button> 
      </form>
    </section>
  );
};

export default Page;
