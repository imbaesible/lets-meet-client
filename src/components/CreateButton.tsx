import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"
import { NameInput } from "../common/Name"

export const Create: React.FC = () => {

    const { ws, user, currentUserId, userId, userName } = useContext(RoomContext)

    const createRoom = () => {
        ws.emit("create-room", { peerId: currentUserId, userName })
    }

    return(
        <div className="flex flex-col">
            <NameInput />
            <button 
                onClick={createRoom} 
                className='bg-rose-400 py-2 px-8 rounded-lg text-xl text-white hover:bg-rose-600'
            >
                Start new meeting
            </button>
        </div>
    )
}