import { useState } from "react"

export const ChatInput: React.FC = ({}) => {
    const [message, setMessage] = useState<string>("")
    return(
        <div>
            <form> 
                <div className="flex">
                    <textarea 
                        className="border rounded"
                        onChange={(e) => setMessage(e.target.value)} 
                        value={message} 
                    />
                    <button 
                        type="submit" 
                        className="bg-rose-400 p-4 mx-2 rounded-lg text-xl text-white hover:bg-rose-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    )
}