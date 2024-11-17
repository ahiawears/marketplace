import { AddBrandDetails } from "@/actions/add-brand";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const formData = req.body; // Directly accept FormData
            const result = await AddBrandDetails(formData);

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error("Error adding brand:", error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
