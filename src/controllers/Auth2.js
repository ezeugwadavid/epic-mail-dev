import jwt from "jsonwebtoken";




const Auth2 = {
  /**
   * Verify Token
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {object|void} response object
   */
  async verifyToken(req, res, next) {
    const token = req.params.token || req.body.token;
    const secret = process.env.SECRET_KEY;

    if (!token) {
      return res.status(400).send({ message: "Token is not provided" });
    }
    let decoded;
    try {
      decoded = await jwt.verify(token, secret);

    
      req.user = { id: decoded.userId, email: decoded.userEmail };
      next();
     
      
    } catch (error) {
      return res.status(400).send(error);
    }
  }
};

export default Auth2;