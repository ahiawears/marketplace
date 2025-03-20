//This api gets all the order details for a brand
//it should return the customer email/phone number, order items, price of each items, total price for order, date of order, shipping address, order status, 



// Setup type definitions for built-in Supabase Runtime APIs
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { GetBrandOrders } from "@actions/get-brand-orders.ts"

Deno.serve(async (req: Request) => {
	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});
	}

	try {

		let orderStatus;
		const url = new URL(req.url);
        const userId = url.searchParams.get("userId");
		const status = url.searchParams.get("orderStatus");
		if (status === "") {
			orderStatus = null;
		} else {
			orderStatus = status;
		}

		orderStatus = status || "";

		const authHeader = req.headers.get("Authorization");

		if (!authHeader) {
			console.error("Missing Authorization header!");
			return new Response("Unauthorized header", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];
		if (!accessToken) {
			console.error("Malformed Authorization header!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		const supabase = createClient(accessToken);

		if (!userId) {
            return new Response(JSON.stringify({ success: false, message: "User ID is required." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

		//this should get 
		const getBrandOrders = await GetBrandOrders(supabase, userId, orderStatus);

		return new Response(
			JSON.stringify({
				success: true,
				message: "List of orders gotten successfully",
				//add data returned
				data: getBrandOrders

			}),
			{
				status: 200,
				headers: {
					...corsHeaders,
					"Content-Type": "application/json"
				}
			}
		)

	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: error || "Error Getting Orders"
			}),
			{
				status: 500,
				headers: {
					...corsHeaders,
					"Content-Type": "application/json"
				}
			}
		)
	}
})