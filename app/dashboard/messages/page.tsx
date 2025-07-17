'use client';
import Chat from "@/components/messages/chat";
import MessageList from "@/components/messages/message-list";

interface MessageListProps{
    image_url: string;
    recipient_name: string;
    recipient_id: string;
    last_message: string;
    unread: boolean;
    timestamp: string;
    id: string;
}

interface ConversationsListProps{
    
}

const Messages = () => {
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
    ]


    return (
        <div className="container mx-auto border-2 p-0 h-full">
            <div className="w-full flex flex-row h-full">
                <div className="md:basis-2/5 overflow-y-auto">
                    <MessageList
                        messagesList={messagesItems}
                    />
                </div>
                <div className="md:basis-3/5">
                    <Chat />
                </div>
            </div>
        </div>
    );
}
export default Messages;