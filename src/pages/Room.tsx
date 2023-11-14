import { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext"
import { VideoPlayer } from "../components/VideoPlayer"
import { ShareScreenButton } from "../components/ShareScreenButton"

export const Room = () => {
    const { roomId } = useParams()
    const { ws, user, stream, peers, shareScreen, shareScreenId, isSharingScreen, setRoomId } = useContext(RoomContext)

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
        <>
            <div>Room Id: {roomId}</div>
            <div className="flex">
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
            </div>
            <div className="fixed bottom-0 p-6 w-full flex justify-center border-t-2 bg-white">
                <ShareScreenButton onClick={shareScreen}/>
            </div>
        </>
    )
}