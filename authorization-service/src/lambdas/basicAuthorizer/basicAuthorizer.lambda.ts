import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayRequestAuthorizerEvent) => {
    console.log('Incoming request event: ', event);

    try {
        const authToken = event.headers?.authorization 
        
        if (!authToken) {
            throw new Error('Unauthorized');
        }

        // Decode token
        const [_authType, token] = authToken.split(' ')        
        const [login, password] = Buffer.from(token, 'base64').toString('utf8').split('=');
                
        // Validate token    
        const passwordFromDB = process.env[login]
        const isAuthorized = !!passwordFromDB && passwordFromDB === password

        return { isAuthorized } 
    } catch(error) {
        console.log('Authorization error: ', error);
        
        return { isAuthorized: false } 
    }
}