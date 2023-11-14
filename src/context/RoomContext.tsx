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
    const [shareScreenId, setShareScreenId] = useState<string>("")
    const [isUserSharingScreen, setIsUserSharingScreen] = useState<boolean>(false)
    const [isPeerSharingScreen, setIsPeerSharingScreen] = useState<boolean>(false)
    const [roomId, setRoomId] = useState<string>("")

    const enterRoom = ({ roomId }: { roomId: "string" }) => {
        navigate(`/room/${roomId}`)
    }

    const getUsersList = ({ participants }: { participants: string[] }) => {
        console.log({ participants })
    }

    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId))
    }

    const switchScreen = (stream: MediaStream) => {
        setStream(stream)
        setShareScreenId(user?.id || "")
        setIsUserSharingScreen(!isUserSharingScreen)

        //for sharing your stream (Screen || Video) with other users
        Object.values(user?.connections).forEach((connection: any) => {
            const videoTrack = stream?.getTracks().find((track) => track.kind === 'video')
            connection[0]
                .peerConnection
                .getSenders()[1]
                .replaceTrack(videoTrack)
                .catch((err: any) => console.error(err))
        })
    }

    const shareScreen = () => {
        if(isSharingScreen){
            navigator.mediaDevices.getUserMedia({ video: true, audio: true}).then(switchScreen)
        } else {
            navigator.mediaDevices.getDisplayMedia({}).then(switchScreen)
        }
    }

    useEffect(() => {
        const userId = uuidV4()
        const peer = new Peer(userId)
        //FOR PEER JS CLOUD DOWN BUG, CONFIG FOR CREATE YOUR OWN LOCAL PEER SERVER
        // {
        //     host: 'localhost',
        //     port: 9001,
        //     path: "/",
        // }
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
        ws.on('user-started-sharing', (peerId) => {
            console.log('started')
            setIsPeerSharingScreen(true)
            setShareScreenId(peerId)
        })
        ws.on('user-stopped-sharing', () => { 
            console.log('stopped')
            setIsPeerSharingScreen(false)
            setShareScreenId("")
        })

        return () => {
            ws.off("room-created");
            ws.off("get-users-list");
            ws.off("user-disconnected");
            ws.off("user-shared-screen");
            ws.off("user-stopped-sharing");
            ws.off("user-joined");
        };
    }, []) 

    useEffect(() => {
        if(!isPeerSharingScreen){
            if(isUserSharingScreen && shareScreenId){
                console.log('start')
                ws.emit('start-sharing', {
                    peerId: shareScreenId,
                    roomId,
                })
            } else {
                console.log('stop')
                ws.emit('stop-sharing')
            }
        } else {
            //your peer is already sharing the screen
        }
    }, [isUserSharingScreen, isPeerSharingScreen, shareScreenId, roomId])

    useEffect(() => {
        if(!user || !stream) return;

        ws.on('user-joined', ({ peerId } : { peerId: string; roomId: string; }) => {
            const call = user.call(peerId, stream)
            call.on("stream", (peerStream: MediaStream) => {
                dispatch(addPeerAction(peerId,  peerStream))
            })
        })

        user.on("call", (call) => {
            call.answer(stream)
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(call.peer,  peerStream))
            })
        })
    }, [user, stream])

    const isSharingScreen = isUserSharingScreen || isPeerSharingScreen

    return(
        <RoomContext.Provider value={{ ws, user, stream, peers, shareScreenId, isSharingScreen, shareScreen, setRoomId }}>
            {children}
        </RoomContext.Provider>
    )
}