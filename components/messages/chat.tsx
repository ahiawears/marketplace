import { Paperclip, Send } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";


interface ConversationListItems{
    id: string;
    timestamp: string;
    recipient_name: string;
    recipient_id: string;
    text?: string;
    image?: string;
    
}

const Chat = () => {
    return (
        <div className="flex flex-col h-full border-l">
            <header className="p-4 border-b flex items-center">
                <h2 className="font-semibold text-lg">John Doe</h2>
            </header>
            {/* Chat Messages */}
            <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
                <div className="space-y-4">
                    {/* Placeholder for incoming message */}
                    <div className="flex items-end space-x-2">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 border-2" />
                        <div className="bg-white rounded-lg p-3 max-w-xs border-2">
                            <p>Hey, how's it going?</p>
                        </div>
                    </div>

                    {/* Placeholder for outgoing message */}
                    <div className="flex items-end space-x-2 justify-end">
                        <div className="bg-black text-white rounded-lg p-3 max-w-xs">
                            <p>All good here! What about you?</p>
                        </div>
                    </div>
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