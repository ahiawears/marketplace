'use client';
import Chat from "@/components/messages/chat";
import MessageList from "@/components/messages/message-list";
import { useState } from "react";
import SelectMessageSvg from "@/components/svg/select-message-svg";
import NoMessagesSvg from "@/components/svg/no-messages-svg";

interface MessageListProps{
    image_url: string;
    recipient_name: string;
    recipient_id: string;
    last_message: string;
    unread: boolean;
    timestamp: string;
    id: string;
}

type MessageStatus = "sent" | "delivered" | "seen";
type SenderRole = "brand" | "customer";

interface ChatMessage {
    id: string;
    senderId: string;
    senderRole: SenderRole;
    text?: string;
    image?: string;
    timestamp: string; 
    status: MessageStatus;
}

const Messages = () => {
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    const messagesItems: MessageListProps[] = [
        {
            image_url: "https://randomuser.me/api/portraits/men/1.jpg",
            recipient_name: "John Doe",
            recipient_id: "user123",
            last_message: "Hey, how's it going?",
            unread: true,
            timestamp: "2025-07-24T10:00:00",
            id: "message1",
        },
        {
            image_url: "https://randomuser.me/api/portraits/men/7.jpg",
            recipient_name: "Kevin Lee",
            recipient_id: "user145",
            last_message: "Don't forget to bring the report.",
            unread: true,
            timestamp: "2024-07-24T11:30:00",
            id: "message7",
        },
        {
            image_url: "https://randomuser.me/api/portraits/women/4.jpg",
            recipient_name: "Emily Davis",
            recipient_id: "user101",
            last_message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. ",
            unread: false,
            timestamp: "2024-02-24T10:45:00",
            id: "message4",
        },
        {
            image_url: "https://randomuser.me/api/portraits/men/5.jpg",
            recipient_name: "David Wilson",
            recipient_id: "user112",
            last_message: "Are we still meeting for lunch?",
            unread: true,
            timestamp: "2024-07-30T11:00:00",
            id: "message5",
        },
        {
            image_url: "https://randomuser.me/api/portraits/women/6.jpg",
            recipient_name: "Sarah Clark",
            recipient_id: "user131",
            last_message: "Yes, see you at 12:30!",
            unread: false,
            timestamp: "2024-12-07T11:15:00",
            id: "message6",
        },
        {
            image_url: "https://randomuser.me/api/portraits/women/2.jpg",
            recipient_name: "Jane Smith",
            recipient_id: "user456",
            last_message: "All good here! What about you?",
            unread: false,
            timestamp: "2024-02-11T10:15:00",
            id: "message2",
        },
        {
            image_url: "https://randomuser.me/api/portraits/men/3.jpg",
            recipient_name: "Mike Johnson",
            recipient_id: "user789",
            last_message: "Did you see the game last night?",
            unread: true,
            timestamp: "2022-07-24T10:30:00",
            id: "message3",
        },
        {
            image_url: "https://randomuser.me/api/portraits/men/9.jpg",
            recipient_name: "Janet Johnson",
            recipient_id: "user189",
            last_message: "Did you see the game last night?",
            unread: true,
            timestamp: "2020-12-31T10:30:00",
            id: "message12",
        },
        {
            image_url: "https://randomuser.me/api/portraits/women/6.jpg",
            recipient_name: "Mike Jackson",
            recipient_id: "user432",
            last_message: "Did you see the game last night?",
            unread: false,
            timestamp: "2022-07-24T10:23:00",
            id: "message9",
        },
        {
            image_url: "https://randomuser.me/api/portraits/men/13.jpg",
            recipient_name: "Krys Colombus",
            recipient_id: "user009",
            last_message: "Did you see the game last night?",
            unread: false,
            timestamp: "2020-12-31T10:30:00",
            id: "message18",
        },
        {
            image_url: "https://randomuser.me/api/portraits/women/6.jpg",
            recipient_name: "Kan Ye",
            recipient_id: "user102",
            last_message: "Did you see the game last night?",
            unread: false,
            timestamp: "2022-07-24T10:23:00",
            id: "message19",
        },
    ]

    const MOCK_MESSAGES: ChatMessage[] = [
        {
            id: "msg1",
            senderId: "cust-123",
            senderRole: "customer",
            text: "Hi! I just placed an order, wanted to ask a quick question.",
            timestamp: "9:58 AM",
            status: "seen",
        },
        {
            id: "msg2",
            senderId: "brand-456",
            senderRole: "brand",
            text: "Hey there! Sure, how can I help you?",
            timestamp: "9:59 AM",
            status: "seen",
        },
        {
            id: "msg3",
            senderId: "cust-123",
            senderRole: "customer",
            text: "Can I change the color of the hoodie to black instead of red?",
            timestamp: "10:00 AM",
            status: "seen",
        },
        {
            id: "msg4",
            senderId: "brand-456",
            senderRole: "brand",
            text: "Absolutely. Let me update that for you now.",
            timestamp: "10:01 AM",
            status: "seen",
        },
        {
            id: "msg5",
            senderId: "brand-456",
            senderRole: "brand",
            image: "https://randomuser.me/api/portraits/men/6.jpg",
            timestamp: "10:02 AM",
            status: "seen",
        },
        {
            id: "msg6",
            senderId: "cust-123",
            senderRole: "customer",
            text: "Yes, that’s perfect. Thank you!",
            timestamp: "10:03 AM",
            status: "delivered",
        },
        {
            id: "msg7",
            senderId: "brand-456",
            senderRole: "brand",
            text: "You're welcome 😊 It'll ship out later today.",
            timestamp: "10:04 AM",
            status: "seen",
        },
        {
            id: "msg8",
            senderId: "cust-123",
            senderRole: "customer",
            text: "Awesome. Will I get a tracking number?",
            timestamp: "10:06 AM",
            status: "seen",
        },
        {
            id: "msg9",
            senderId: "brand-456",
            senderRole: "brand",
            text: "Yes! We’ll email it to you once DHL picks it up.",
            timestamp: "10:08 AM",
            status: "seen",
        },
        {
            id: "msg10",
            senderId: "cust-123",
            senderRole: "customer",
            image: "https://randomuser.me/api/portraits/women/7.jpg",
            timestamp: "10:09 AM",
            status: "seen",
        },
        {
            id: "msg11",
            senderId: "brand-456",
            senderRole: "brand",
            text: "Got it, thanks!",
            timestamp: "10:10 AM",
            status: "seen",
        },
        {
            id: "msg12",
            senderId: "cust-123",
            senderRole: "customer",
            text: "Looking forward to it 🙌",
            timestamp: "10:11 AM",
            status: "delivered",
        },
    ];

    const handleMessageOpen = (id: string) => {
        console.log("clicked id response from messages parent: ", id);
        setSelectedMessageId(id);
    }

    const handleBack = () => {
        setSelectedMessageId(null);
    };

    const selectedMessage = messagesItems.find((m) => m.id === selectedMessageId);

    return (
        <div className="container mx-auto border-2 p-0 h-full">
            <div className="w-full flex flex-row h-full">
                <div className={`w-full md:basis-2/5 overflow-y-auto ${selectedMessageId ? 'hidden md:block' : 'block'}`}>
                    {messagesItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-50 border-l text-center p-4">
                            <NoMessagesSvg className="text-gray-300 mb-4" width={120} height={120} />
                            <h2 className="text-xl font-semibold text-gray-600">No conversations to start yet.</h2>
                        </div>
                    )}
                    {messagesItems.length !== 0 && (
                        <MessageList
                            messagesList={messagesItems}
                            handleMessageOpen={handleMessageOpen}
                        />
                    )}
                    
                </div>
                <div className={`w-full md:basis-3/5 ${selectedMessageId ? 'block' : 'hidden md:block'}`}>
                    {selectedMessage && (
                        <Chat
                            chatMessages={MOCK_MESSAGES}
                            recipientName={selectedMessage.recipient_name}
                            onBack={handleBack}
                        />
                    )}
                    {!selectedMessage && (
                        <div className="hidden md:flex flex-col items-center justify-center h-full bg-gray-50 border-l text-center p-4">
                            <SelectMessageSvg className="text-gray-300 mb-4" width={120} height={120} />
                            <h2 className="text-xl font-semibold text-gray-600">Select a conversation</h2>
                            <p className="text-gray-500 mt-2 max-w-sm">
                                Choose from an existing conversations to start chatting.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Messages;