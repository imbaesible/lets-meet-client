import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";
import Peer from "peerjs";
import { v4 as uuidV4 } from "uuid";
import { peersReducer } from "./peerReducer";
import { addPeerAction, removePeerAction } from "./peerActions";
const WS = 'http://localhost:8080'

export const RoomContext = createContext<null | any>(null)

const ws = socketIOClient(WS);

interface Props {
    children: React.ReactNode;
}

export const RoomProvider: React.FunctionComponent<Props> = ({children}) => {
    const navigate = useNavigate()
    const [user, setUser] = useState<Peer>()
    const [stream, setStream] = useState<MediaStream>()
    const [peers, dispatch] = useReducer(peersReducer, {})

    const enterRoom = ({ roomId }: { roomId: "string" }) => {
        navigate(`/room/${roomId}`)
    }

    const getUsersList = ({ participants }: { participants: string[] }) => {
        console.log({ participants })
    }

    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId))
    }

    useEffect(() => {
        const userId = uuidV4()
        const peer = new Peer(userId)
        setUser(peer)
        try{
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true})
                .then((stream) => {
                    setStream(stream)
                })
        } catch(error) {
            console.error(error)
        }
        ws.on('room-created', enterRoom)
        ws.on('get-users-list', getUsersList)
        ws.on('user-disconnected', removePeer)
    }, []) 

    useEffect(() => {
        if(!user || !stream) return;

        ws.on('user-joined', ({ peerId } : { peerId: string; roomId: string; }) => {
            const call = user.call(peerId, stream)
            console.log('user-joined', peerId, call)
            call.on("stream", (peerStream: MediaStream) => {
                dispatch(addPeerAction(peerId,  peerStream))
            })
        })

        user.on("call", (call) => {
            console.log('call-user-joined', call)
            call.answer(stream)
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(call.peer,  peerStream))
            })
        })
    }, [user, stream])

    console.log(peers)

    return(
        <RoomContext.Provider value={{ ws, user, stream, peers }}>
            {children}
        </RoomContext.Provider>
    )
}