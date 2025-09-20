import jsonwebtoken from 'jsonwebtoken';

export const signToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'hackathondevelopment';
    console.log("Using JWT secret:", secret ? "Secret exists" : "No secret found");
    return jsonwebtoken.sign(payload, secret, {expiresIn : '1h'});
}

export const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || 'hackathondevelopmentauth';
    const decoded = jsonwebtoken.verify(token, secret);
    return decoded.id;
}