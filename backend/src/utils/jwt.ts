import {sign, verify} from "hono/jwt"

type Payload = {
    userID: number,
}

async function encodeJwt(JWT_TOKEN:string, payload:Payload){
    const jwtToken = await sign(payload, JWT_TOKEN)

    return jwtToken
}


async function decodeJwt(token:string|undefined, JWT_TOKEN:string){
    try{
        const tokenVerification = await verify(token, JWT_TOKEN, 'HS256')
        return tokenVerification
    }
    catch(error){
        return error
    }
    
  
}


export {encodeJwt, decodeJwt}