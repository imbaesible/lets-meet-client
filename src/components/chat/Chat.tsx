import { useContext } from "react"
import { IMessage } from "../../types/Chat"
import { ChatBubble } from "./ChatBubble"
import { ChatInput } from "./ChatInput"
import { RoomContext } from "../../context/RoomContext"

export const Chat: React.FC = ({}) => {
    const { chats } = useContext(RoomContext)

    return(
        <div className="flex flex-col h-full justify-between">
            <div>
                {
                    chats.messages?.map((message: IMessage) => {
                        return(
                            <ChatBubble message={message}/>
                        )
                    })
                }
            </div>
            <ChatInput />
        </div>
    )
}