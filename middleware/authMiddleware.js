import db from "../config/db.js";

export const verifyUser = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization

        if (!authHeader||!authHeader.startsWith('Bearer ')) return res.status(401).json({success:false,message:'Forbidden'})
        try {
            const token = authHeader.split(' ')[1]
            const decodedUser = JSON.parse(Buffer.from(token,'base64').toString('ascii'))

            req.user = decodedUser

            if(!allowedRoles.includes(decodedUser.role)) return res.status(403).json({success:false,message:'Forbidden'})

            next()
        } catch (error) {
            return res.status(401).json({success:false,message:'Token tidak valid'})
        }            
    }
}