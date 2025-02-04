import { Input } from "../ui/input";

export const SocialLinksForm = () => {
    return (
        <div>
            <div className="mx-auto py-10 sm:py-10 shadow-2xl">
                <div className="max-w-7xl px-6 lg:px-6">
                    <h2 className="font-mabry-pro text-2xl">Social Links</h2>
                    <div className="my-5">
                        <div className="space-y-1">
                            <label htmlFor="website-link">
                                Website Link: 
                            </label>
                            <div className="md:w-3/4 w-full lg:w-3/4">
                                <Input 
                                    id="website-link"
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-5">
                        <div className="space-y-1">
                            <label htmlFor="instagram-link">
                                Instagram Link: 
                            </label>
                            <div className="md:w-3/4 w-full lg:w-3/4">
                                <Input 
                                    id="instagram-link"
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-5">
                        <div className="space-y-1">
                            <label htmlFor="twitter-link">
                                Twitter (X) Link: 
                            </label>
                            <div className="md:w-3/4 w-full lg:w-3/4">
                                <Input 
                                    id="twitter-link"
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-5">
                        <div className="space-y-1">
                            <label htmlFor="facebook-link">
                                Facebook Link: 
                            </label>
                            <div className="md:w-3/4 w-full lg:w-3/4">
                                <Input 
                                    id="facebook-link"
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}