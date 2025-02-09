import { LookbookCardItem } from "./brand-lookbook-item"

export const BrandLookBookGrid = () => {
    return (
        <div>
            <div className="mx-auto py-10 sm:py-10 shadow-2xl border-2">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-2">
                        <LookbookCardItem />
                        <LookbookCardItem />
                        <LookbookCardItem />
                        <LookbookCardItem />
                    </div>
                </div>
            </div>
        </div>
    )
}