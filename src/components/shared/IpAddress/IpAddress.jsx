import { useState } from "react"

export const IpAddress = ({ipAddress}) => {
    const [showIp, setShowIp] = useState(false)
    return (<>{showIp?ipAddress : 
        <div className='clickable' style={{textDecoration:'underline', 'color':'#007AFF'}} onClick={()=>setShowIp(true)}>
            View
        </div>}</>)
}