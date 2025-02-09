"use client";

import { BrandLookBookGrid } from "@/components/brand-lookbook-grid";
import ModalBackdrop from "@/components/modals/modal-backdrop";
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation";

const Lookbook = () => {
    const router = useRouter();

    const createLookbookClick = () => {
        router.push("/edit-lookbook")
    }

    return (
        <div>
            <div className="flex flex-col flex-1">
                <div className="my-5 container px-0">
                    <Button onClick={createLookbookClick} >
                        <Plus />
                        Create a Lookbook
                    </Button>
                </div>
                <div className="my-5 container px-0">
                    <BrandLookBookGrid />
                </div>
            </div>
            {/* create lookbook modal */}
            
        </div>
    )
}

export default Lookbook;