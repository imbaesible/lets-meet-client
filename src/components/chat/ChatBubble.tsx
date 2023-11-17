import { useContext } from "react"
import { IMessage } from "../../types/Chat"
import { RoomContext } from "../../context/RoomContext"
import classNames from "classnames"

export const ChatBubble: React.FC<{ message: IMessage}> = ({message}) => {
    const { user, peers } = useContext(RoomContext)
    const author = message.author && peers[message.author]
    const userName = author?.userName || "Anonymous"
    const isSelf = message.author === user?.id
    const time = new Date(message.timestamp).toLocaleTimeString()
    return(
        <div className={classNames("m-2 flex", {
            "pl-10 justify-end": isSelf,
            "pr-10 justify-start": !isSelf,
        })}>
            <div className="flex flex-col">
                <div 
                    className={
                        classNames("inline-block py-2 px-4 rounder", {
                            "bg-red-200": isSelf,
                            "bg-red-300": !isSelf,
                        })
                    }
                >
                    {message.content}
                    <div
                        className={
                            classNames("text-xs opacity-50", {
                                "text-right": isSelf,
                                "text-left": !isSelf,
                            })
                        }
                    >
                        {time}
                    </div>
                </div>
                <div
                    className={
                        classNames("text-xs", {
                            "text-right": isSelf,
                            "text-left": !isSelf,
                        })
                    }
                >
                    {isSelf ? "You" : userName}
                </div>
            </div>
        </div>
    )
}