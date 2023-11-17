import { ADD_ALL_PEERS, ADD_PEER, ADD_USER_NAME, CHANGE_PEER_NAME, REMOVE_PEER } from "./peerActions";

export const initialState = {}
type PeerState = Record<string, {stream?: MediaStream, userName?: string}>
type PeerAction = 
    | {
        type: typeof ADD_PEER, 
        payload: { peerId: string; stream: MediaStream; }
    } 
    | {
        type: typeof REMOVE_PEER, 
        payload: { peerId: string; }
    }
    | {
        type: typeof ADD_USER_NAME,
        payload: { peerId: string; userName: string },
    }
    | {
        type: typeof ADD_ALL_PEERS,
        payload: { peers: Record<string, { userName: string }>}
    }
    | {
        type: typeof CHANGE_PEER_NAME,
        payload: { peerId: string, userName: string }
    }

export const peersReducer = ( state: PeerState = initialState, action: PeerAction ) : PeerState => {
    switch(action.type){
        case ADD_PEER:
            return {
                ...state,
                [action.payload.peerId]: {
                    ...state[action.payload.peerId],
                    stream: action.payload.stream,
                },
            }
        case REMOVE_PEER: 
            return {
                ...state,
                [action.payload.peerId]: {
                    ...state[action.payload.peerId],
                    stream: undefined,
                }
            }
        case ADD_USER_NAME:
            return {
                ...state,
                [action.payload.peerId]: {
                    ...state[action.payload.peerId],
                    userName: action.payload.userName
                }
            }
        case ADD_ALL_PEERS:
            return {
                ...state,
                ...action.payload.peers
            }
        case CHANGE_PEER_NAME:
            return {
                ...state,
                [action.payload.peerId]: {
                    ...state[action.payload.peerId],
                    userName: action.payload.userName
                }
            }
        default:
            return {...state}
    }
} 