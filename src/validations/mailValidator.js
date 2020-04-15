// Regex Validations: stack overflow

class MailValidatorHandler {
    static createMailValidator(req, res, next) {
      let {
        subject, message, toemail
      } = req.body;
  
      // Email Validation
      if (toemail === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: email field cannot be empty',
          });
      }
      toemail = toemail.toLowerCase();
      if (typeof toemail !== 'string') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: email should be a string'
          });
      }
      if (toemail === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: email field cannot be empty.'
          });
      }
      if (toemail.includes(' ')) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: email cannot include space.'
          });
      }
      // email check: stackoverflow
      const emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
      if (!emailCheck.test(toemail)) {
        return res.status(400).send({
          status: 400,
          error: 'Error: email format is invalid'
        });
      }
      if (toemail.length < 10 || toemail.length > 30) {
        return res.status(400).send({
          status: 400,
          error: 'Error: email should be 10 to 30 characters long'
        });
      }
  
  
      if (subject === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: subject cannot be empty',
  
          });
      }
      if (subject === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: subject field cannot be empty',
  
          });
      }
      subject = subject.trim();
      subject = subject.replace(/ {1,}/g," ");
  
      if (message === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message cannot be empty',
  
          });
      }
      if (message === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      message = message.replace(/ {1,}/g," ");
  
      next();
    }
  
    static validMail(req, res, next) {
      let {
        toemail, subject, message
      } = req.body;
  
      if (toemail === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: email field cannot be empty',
          });
      }
      if (toemail === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: email field cannot be empty.'
          });
      }
      // email check: stackoverflow
      const emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
      if (!emailCheck.test(toemail)) {
        return res.status(400).send({
          status: 400,
          message: 'Error: email format is invalid'
        });
      }
      if (toemail.length < 2 || toemail.length > 100) {
        return res.status(400).send({
          status: 400,
          message: 'Error: email should be 2 to 100 characters long'
        });
      }
      toemail = toemail.toLowerCase();
  
      if (subject === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: subject field cannot be empty',
  
          });
      }
  
      if (subject === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: subject field cannot be empty',
  
          });
      }
      subject = subject.replace(/ {1,}/g," ");
  
      if (message === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      if (message === ' ') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      if (message === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      message = message.replace(/ {1,}/g," ");
  
      next();
    }
  
    static groupMail(req, res, next) {
      let {
        subject, message
      } = req.body;
  
      if (subject === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: subject field cannot be empty',
  
          });
      }
  
      if (subject === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: subject field cannot be empty',
  
          });
      }
      subject = subject.replace(/ {1,}/g," ");
      subject = subject.trim();
  
      if (message === undefined) {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      if (message === ' ') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      if (message === '') {
        return res.status(400)
          .send({
            status: 400,
            message: 'Error: message field cannot be empty',
  
          });
      }
      message = message.replace(/ {1,}/g," ");
      message = message.trim();
  
      next();
    }
  }
  
  export default MailValidatorHandler;
  