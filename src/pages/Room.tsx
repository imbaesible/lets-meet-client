import { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext"
import { VideoPlayer } from "../components/VideoPlayer"
import { ShareScreenButton } from "../components/ShareScreenButton"
import { ChatButton } from "../components/ChatButton"
import { Chat } from "../components/chat/Chat"

export const Room = () => {
    const { roomId } = useParams()
    const { 
        ws, 
        user, 
        stream, 
        peers, 
        chats,
        shareScreen, 
        shareScreenId, 
        isSharingScreen, 
        setRoomId, 
        toggleChat,
    } = useContext(RoomContext)

    useEffect(() => {
        user?.on("open", () => {
            ws.emit("join-room", { roomId, peerId: user._id });
        });
    }, [roomId, user, ws])

    useEffect(() => {
        setRoomId(roomId)
    }, [roomId, setRoomId])

    const screenShareVideo = shareScreenId === user?.id ? stream : peers[shareScreenId]?.stream
    const { [shareScreenId]: sharing, ...peersToShow} = peers

    console.log(screenShareVideo)

    return(
        <div className="flex flex-col min-h-screen">
            <div className="bg-red-500 p-4 text-white">Room Id: {roomId}</div>
            <div className="flex grow">
                {
                    screenShareVideo &&
                    <div className="w-4/5 pr-4">
                        <VideoPlayer stream={screenShareVideo} />
                    </div>
                }
                <div className={`grid gap-4 ${isSharingScreen ?  "w-1/5 grid-cols-1" : "grid-cols-4"}`}>
                    {shareScreenId !== user?.id && <VideoPlayer className="me" key={"me"} stream={stream} />}
                    {
                        Object.values(peersToShow).map((peer: any) => {
                            return(<VideoPlayer key={peer.id} stream={peer.stream}/>)
                        })
                    }
                </div>
                {
                    chats.isChatOpen &&
                    <div className="border-l-2 pb-28">
                        <Chat />
                    </div>
                }
            </div>
            <div className="h-28 fixed bottom-0 p-6 w-full flex items-center justify-center border-t-2 bg-white">
                <ShareScreenButton onClick={shareScreen}/>
                <ChatButton onClick={toggleChat}/>
            </div>
        </div>
    )
}