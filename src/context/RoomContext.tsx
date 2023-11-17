import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";
import Peer from "peerjs";
import { v4 as uuidV4 } from "uuid";
import { peersReducer } from "../reducers/peerReducer";
import { addAllPeersAction, addPeerAction, addPeerNameAction, changePeerNameAction, removePeerAction } from "../reducers/peerActions";
import { IMessage } from "../types/Chat";
import { chatReducer } from "../reducers/chatReducer";
import { addHistoryAction, addMessageAction, toggleChatAction } from "../reducers/chatActions";
const WS = 'http://localhost:8080'

export const RoomContext = createContext<null | any>(null)

const ws = socketIOClient(WS);

interface Props {
    children: React.ReactNode;
}

export const RoomProvider: React.FunctionComponent<Props> = ({children}) => {
    const navigate = useNavigate()
    const [user, setUser] = useState<Peer>()
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [userName, setUserName] = useState<string>(localStorage.getItem('userName') ||'')
    const [stream, setStream] = useState<MediaStream>()
    const [peers, dispatch] = useReducer(peersReducer, {})
    const [chats, chatDispatch] = useReducer(chatReducer, {
        messages: [],
        isChatOpen: false,
    })
    const [shareScreenId, setShareScreenId] = useState<string>("")
    const [isUserSharingScreen, setIsUserSharingScreen] = useState<boolean>(false)
    const [isPeerSharingScreen, setIsPeerSharingScreen] = useState<boolean>(false)
    const [roomId, setRoomId] = useState<string>("")

    const enterRoom = ({ roomId }: { roomId: "string" }) => {
        navigate(`/room/${roomId}`)
    }

    const getUsersList = ({ participants }: { participants: Record<string, { userName: string }> }) => {
        dispatch(addAllPeersAction(participants))
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

    const sendMessage = (message: string) => {
        const messageData: IMessage = {
            content: message,
            timestamp: new Date().getTime(),
            author: user?.id, 
        }
        chatDispatch(addMessageAction(messageData))
        ws.emit('send-message', roomId, messageData)
    }

    const addMessage = (message: IMessage) => {
        chatDispatch(addMessageAction(message))
    }

    const addHistory = (messages: IMessage[]) => {
        chatDispatch(addHistoryAction(messages))
    }

    const toggleChat = () => {
        chatDispatch(toggleChatAction(!chats.isChatOpen))
    }

    const nameChangeHandler = ({ peerId, userName }: { peerId: string, userName: string }) => {
        dispatch(changePeerNameAction(peerId, userName))
    }

    useEffect(() => {
        localStorage.setItem('userName', userName)
    }, [userName])

    useEffect(() => {
        ws.emit('change-name', { peerId: user?.id, userName, roomId })
    }, [userName, user, roomId])

    useEffect(() => {
        if(roomId){
            const userSavedId = localStorage.getItem('userId')
            const userId = userSavedId || uuidV4()
            localStorage.setItem('userId', userId)

            const peer = new Peer(userSavedId || userId)
            peer?.on("open", () => {
                ws.emit("join-room", { roomId, userName, peerId: userId });
            });

            setUser(peer)
            setCurrentUserId(userId)
            
            try{
                navigator.mediaDevices
                    .getUserMedia({ video: true, audio: true})
                    .then((stream) => {
                        setStream(stream)
                    })
            } catch(error) {
                console.error(error)
            }
        }
    }, [roomId])

    useEffect(() => {
        ws.on('room-created', enterRoom)
        ws.on('get-users-list', getUsersList)
        ws.on('user-disconnected', removePeer)
        ws.on('user-started-sharing', (peerId) => {
            setIsPeerSharingScreen(true)
            setShareScreenId(peerId)
        })
        ws.on('user-stopped-sharing', () => { 
            setIsPeerSharingScreen(false)
            setShareScreenId("")
        })
        ws.on('add-message', addMessage)
        ws.on('get-messages', addHistory)
        ws.on('name-changed', nameChangeHandler)

        return () => {
            ws.off("room-created");
            ws.off("get-users-list");
            ws.off("user-disconnected");
            ws.off("user-shared-screen");
            ws.off("user-stopped-sharing");
            ws.off("user-joined");
            ws.off("add-message");
            ws.off("get-messages");
            ws.off("name-changed");
        };
    }, []) 

    useEffect(() => {
        if(!isPeerSharingScreen){
            if(isUserSharingScreen && shareScreenId){
                ws.emit('start-sharing', {
                    peerId: shareScreenId,
                    roomId,
                })
            } else {
                ws.emit('stop-sharing')
            }
        } else {
            //your peer is already sharing the screen
        }
    }, [isUserSharingScreen, isPeerSharingScreen, shareScreenId, roomId])

    useEffect(() => {
        if(!user || !stream) return;

        ws.on('user-joined', ({ peerId, userName: name} : { peerId: string; roomId: string; userName: string; }) => {
            const call = user.call(peerId, stream, {
                metadata: {
                    userName,
                }
            })
            call.on("stream", (peerStream: MediaStream) => {
                dispatch(addPeerAction(peerId,  peerStream))
            })
            dispatch(addPeerNameAction(peerId, name))
        })

        user.on("call", (call) => {
            const peerName = call.metadata.userName
            call.answer(stream)
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(call.peer,  peerStream))
            })
            dispatch(addPeerNameAction(call.peer, peerName))
        })
    }, [user, stream, userName])

    const isSharingScreen = isUserSharingScreen || isPeerSharingScreen
    const value = {
        ws, 
        user, 
        currentUserId,
        stream, 
        peers, 
        chats,
        shareScreenId, 
        isSharingScreen, 
        userName,
        setUserName,
        shareScreen, 
        setRoomId, 
        sendMessage,
        toggleChat,
    }

    return(
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}

//FOR PEER JS CLOUD DOWN BUG, CONFIG FOR CREATE YOUR OWN LOCAL PEER SERVER
// {
//     host: 'localhost',
//     port: 9001,
//     path: "/",
// }