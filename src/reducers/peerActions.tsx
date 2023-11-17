export const ADD_PEER = "ADD_PEER" as const;
export const REMOVE_PEER = "REMOVE_PEER" as const;
export const ADD_USER_NAME = "ADD_USER_NAME" as const;
export const ADD_ALL_PEERS = "ADD_ALL_PEERS" as const;
export const CHANGE_PEER_NAME = "CHANGE_PEER_NAME" as const

export const addPeerAction = (peerId: string, stream: MediaStream) => ({
    type: ADD_PEER,
    payload: {
        peerId,
        stream,
    },
})

export const removePeerAction = (peerId: string) => ({
    type: REMOVE_PEER,
    payload: {
        peerId,
    },
})

export const addPeerNameAction = (peerId: string, userName: string) => ({
    type: ADD_USER_NAME,
    payload: {
        peerId,
        userName,
    }
})

export const addAllPeersAction = (peers: Record<string, { userName: string }>) => ({
    type: ADD_ALL_PEERS,
    payload: { peers },
})

export const changePeerNameAction = (peerId: string, userName: string) => ({
    type: CHANGE_PEER_NAME,
    payload: { peerId, userName },
})