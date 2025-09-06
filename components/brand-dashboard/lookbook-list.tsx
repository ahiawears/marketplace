import { FC } from "react";
import { LookbookListItem } from "./lookbook-client";
import { Button } from "../ui/button";
import { BookImage, Edit, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface LookbookListProps {
    lookbooks: LookbookListItem[];
    onCreateNew: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const LookbookList: FC<LookbookListProps> = ({
    lookbooks,
    onCreateNew,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 border-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center my-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 shrink-0">Lookbooks</h1>
                <Button onClick={onCreateNew} className="text-white transition-colors duration-200 rounded-none">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a Lookbook
                </Button>
            </div>

            {lookbooks.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 border-2 shadow-inner">
                    <BookImage className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="my-4 text-lg text-gray-600">No lookbooks created yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Click the button above to create your first lookbook.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lookbooks.map((lookbook) => (
                        <div key={lookbook.id} className="border-2 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
                            <div className="relative h-60 w-full bg-gray-100">
                                {lookbook.cover_image_url ? (
                                    <Image
                                        src={lookbook.cover_image_url}
                                        alt={lookbook.title}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <BookImage className="h-16 w-16 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="outline" className="bg-white/80 hover:bg-white" onClick={() => onEdit(lookbook.id)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="bg-red-500/80 hover:bg-red-500" onClick={() => onDelete(lookbook.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg truncate">{lookbook.title}</h3>
                                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                                    <span>{lookbook.item_count} items</span>
                                    <span className={`px-2 py-1 text-xs font-medium ${lookbook.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {lookbook.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LookbookList;