// import { getProduct } from "@/actions/get-product";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest, 
//   context: { params: { id: string } }
// ) {
//   const id = context.params.id;
//   console.log("The Id from route is: ", id);
//   const { data, error } = await getProduct(id);  

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json(data, { status: 200 });
// }
  