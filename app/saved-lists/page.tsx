import { getSavedItems } from "@/actions/user-actions/userSavedProductActions/getSavedItems";
import FavsListSVG from "@/components/svg/fav-lists-svg";
import { Button } from "@/components/ui/button";
import SavedList from "@/components/ui/savedlist"
import { getServerAnonymousId } from "@/lib/anon_user/server";
import { createClient } from "@/supabase/server"

export default async function SavedListPage () {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    const userIdentifier = userId || await getServerAnonymousId();
    const isAnonymous = !userId;

    const savedItems = await getSavedItems(userIdentifier, isAnonymous);
    console.log("The saved items ", savedItems);
    return (
        <div className="container mx-auto">
            {savedItems.productsWithImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 py-4">
                    {savedItems.productsWithImages.map((item)=>(
                        <SavedList 
                            key={item.iid}
                            item={item}
                            serverUserIdentifier={userIdentifier}
                            isAnonymous={isAnonymous}
                        />
                    ))}
                </div>
            ) : (
                <div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
                    <div className="w-full p-8 text-center transform transition-all relative">
                        <div className="mx-auto ">
                            <FavsListSVG className="w-64 h-64 mx-auto" width={256} height={256} />
                            <p className="font-bold my-4">You have no favorited items yet</p>
                            
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}