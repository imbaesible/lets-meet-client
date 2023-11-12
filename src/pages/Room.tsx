import { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext"
import { VideoPlayer } from "../components/VideoPlayer"

export const Room = () => {
    const { roomId } = useParams()
    const { ws, user, stream, peers } = useContext(RoomContext)

    useEffect(() => {
        user?.on("open", () => {
            ws.emit("join-room", { roomId, peerId: user._id });
        });
    }, [roomId, user, ws])

    return(
        <>
            <div>Room Id: {roomId}</div>
            <div className="grid grid-cols-4 gap-4">
                <VideoPlayer className="me" key={"me"} stream={stream} />
                {
                    Object.values(peers).map((peer: any) => {
                        return(<VideoPlayer key={peer.id} stream={peer.stream}/>)
                    })
                }
            </div>
        </>
    )
}