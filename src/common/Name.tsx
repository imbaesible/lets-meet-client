import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"

export const NameInput: React.FC = ({}) => {
    const { userName, setUserName } = useContext(RoomContext)
    return(
        <input 
            type="text" 
            className="border rounded-md p-2 h- 10 my-2 w-full" 
            placeholder="Enter your name."
            value={userName}
            onChange={(e) => setUserName(e.target.value)} 
        />
    )
}