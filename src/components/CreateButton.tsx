import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"

export const Create: React.FC = () => {

    const { ws, user } = useContext(RoomContext)

    const createRoom = () => {
        ws.emit("create-room", { peerId: user._id })
    }

    return(
        <button 
            onClick={createRoom} 
            className='bg-rose-400 py-2 px-8 rounded-lg text-xl text-white hover:bg-rose-600'
        >
            Start new meeting
        </button>
    )
}