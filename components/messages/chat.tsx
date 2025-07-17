import { ArrowLeft, Check, CheckCheck, Paperclip, Send } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";

type MessageStatus = "sent" | "delivered" | "seen";
type SenderRole = "brand" | "customer";

interface ChatMessage {
    id: string;
    senderId: string;
    senderRole: SenderRole;  
    text?: string;
    image?: string;
    timestamp: string; // e.g., "10:00 AM"
    status: MessageStatus;
}

interface ChatProps {
    chatMessages: ChatMessage[];
    recipientName: string;
    onBack: () => void;
}

const Chat = ({ chatMessages, recipientName, onBack }: ChatProps) => {
    return (
        <div className="flex flex-col h-full border-l">
            <header className="p-4 border-b flex items-center gap-2">
                <Button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold text-lg">{recipientName}</h2>
            </header>
            {/* Chat Message */}
            <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
                <div className="space-y-4">
                    {chatMessages.map((msg) => {
                        const isOutgoing = msg.senderRole === "brand";

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end space-x-2 ${isOutgoing ? "justify-end" : ""}`}
                            >
                                <div
                                    className={`rounded-lg p-3 max-w-xs ${
                                    isOutgoing ? "bg-black text-white" : "bg-white border-2"
                                    }`}
                                >
                                    {msg.text && 
                                        <p className="text-sm">
                                            {msg.text}
                                        </p>
                                    }
                                    {msg.image && 
                                        (
                                            <Image
                                                src={msg.image}
                                                alt="Attachment"
                                                className="rounded border-2 bg-black"
                                                width={150}
                                                height={150}
                                                priority
                                            />
                                        )
                                    }

                                    <div
                                        className={`text-xs mt-1 flex items-center justify-${
                                            isOutgoing ? "end" : "start"
                                        } text-gray-400 space-x-1`}
                                    >
                                        <span>{msg.timestamp}</span>
                                        {isOutgoing && msg.status === "sent" && 
                                            <Check className="h-4 w-4" />
                                        }
                                        {isOutgoing && msg.status === "delivered" && (
                                            <CheckCheck className="h-4 w-4 text-gray-400" />
                                        )}
                                        {isOutgoing && msg.status === "seen" && (
                                            <CheckCheck className="h-4 w-4 text-blue-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            

            {/* Footer */}
            <footer className="p-4 border-t bg-white">
                <div className="flex items-center space-x-3">
                    <Button className="text-white p-2 flex items-center justify-center w-10 h-10 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border-2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button className="text-white p-2 flex items-center justify-center w-10 h-10 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}

export default Chat;