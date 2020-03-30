// src/usingDB/controllers/Helper.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Helper = {
  /**
   * Hash Password Method
   * @param {string} password
   * @returns {string} returns hashed password
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  },
  /**
   * comparePassword
   * @param {string} hashPassword 
   * @param {string} password 
   * @returns {Boolean} return True or False
   */
  comparePassword(hashPassword, password) {
    return bcrypt.compareSync(password, hashPassword);
  },
  /**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },
  /**
   * Gnerate Token
   * @param {string} id
   * @returns {string} token
   */
  //jwt.sign({
    //data: 'foobar'
  //}, 'secret', { expiresIn: 60 * 60 });
   


  generateToken(id, email) {
    
    const secret = 'justanotherrandomsecretkey';
    const token = jwt.sign({
      userId: id,
      userEmail: email

    },
    secret, { expiresIn: '7d' }
    );
    
    return token;
  }
}

export default Helper;