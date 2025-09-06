"use client";

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

interface Item {
    id: string;
    name: string;
}

interface CouponItemSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: string[];
    selectedIds: string[];
    onSave: (ids: string[]) => void;
}

export const CouponItemSelectorModal = ({
    isOpen,
    onClose,
    title,
    items,
    selectedIds,
    onSave,
}: CouponItemSelectorModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSelectedIds, setCurrentSelectedIds] = useState<Set<string>>(new Set(selectedIds));

    useEffect(() => {
        if (isOpen) {
            setCurrentSelectedIds(new Set(selectedIds));
        }
    }, [selectedIds, isOpen]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const handleToggleItem = (itemId: string) => {
        setCurrentSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        onSave(Array.from(currentSelectedIds));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-2"
                    />
                    <div className="max-h-[400px] overflow-y-auto border-2 p-2 space-y-1 rounded-md">
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <div key={item} className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleToggleItem(item)}>
                                    <Input 
                                        type="checkbox" 
                                        id={`item-${item}`} 
                                        checked={currentSelectedIds.has(item)} 
                                        readOnly 
                                        className={cn(
                                                "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                                "peer appearance-none",
                                                "checked:bg-black checked:border-transparent",
                                                "hover:border-gray-500 cursor-pointer"
                                            )}
                                        
                                    />
                                    <Label htmlFor={`item-${item}`} className="font-normal cursor-pointer flex-1">
                                        {item}
                                    </Label>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No items found.</p>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{currentSelectedIds.size} of {items.length} selected</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave} className="text-white">
                        Save Selections
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

