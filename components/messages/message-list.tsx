import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

interface MessageListProps{
    messagesList: MessageListItem[];
    handleMessageOpen: (id: string) => void;
}

export interface MessageListItem{
    image_url: string;
    recipient_name: string;
    recipient_id: string;
    last_message: string;
    unread: boolean;
    timestamp: string;
    id: string;
}

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const MessageList = ({messagesList, handleMessageOpen}: MessageListProps) => {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sortedMessages = useMemo(() => {
        return [...messagesList].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [messagesList]);

    return (
        <div>
            <header className="p-3 border-b flex items-center sticky space-x-3 top-0 bg-white">
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border-2 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button className=" text-white p-2 flex items-center justify-center w-10 h-10 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
                        <Search className="h-5 w-5" />
                    </Button>
            </header>
            {sortedMessages.map((message) => (
                <div 
                    key={message.id} 
                    className={`flex items-start space-x-3 border-b shadow-lg hover:bg-gray-100 p-3 ${message.unread ? 'bg-gray-200' : 'bg-white'}`}
                    onClick={() => handleMessageOpen(message.id)}
                >
                    <Image 
                        src={message.image_url} 
                        alt={message.recipient_name} 
                        className="border-2 mt-1" 
                        width={50}
                        height={50}
                        priority
                    />
                    <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                            <p className="font-semibold">{message.recipient_name}</p>
                            <p className={`text-sm ${message.unread ? 'font-bold' : 'text-gray-500'}`}>
                                {isClient ? formatTimestamp(message.timestamp) : ''}
                            </p>
                            
                        </div>
                        <p className={`text-sm ${message.unread ? 'font-bold' : 'text-gray-500'}`}>{message.last_message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default MessageList;