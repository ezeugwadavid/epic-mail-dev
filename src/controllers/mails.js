
import uuidv4 from "uuid/v4";
import moment from "moment";
import pool from "../database/dbconnect";

const mails = {
  /**
   * Create A Message
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  create(req, res) {
    const senderId = req.user.id;
    const decEmail = req.user.email;

    const { subject, message, toemail, msgstatus } = req.body;
    // Return user
    const returnUser = "select * from users where email = $1";
    const createQuery = `INSERT INTO
    messages(id, senderid, fromemail, subject, message, toemail, msgstatus, created_date, lastname)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning *`;
    const userMessage =
      "insert into userMessage (userid, messageid, status) values ($1, $2, $3)";
    pool
      .query(returnUser, [decEmail]) //returns the users details
      .then((user) => {
        var lastname = user.rows[0].lastname;

        const toMessage = [
          uuidv4(),
          senderId,
          decEmail,
          subject,
          message,
          toemail,
          msgstatus,
          moment().format(),
          lastname,
        ];

        pool
          .query(returnUser, [toemail]) 
          // check if email exists
          .then((result) => {
            if (result.rowCount !== 0 && result.rows[0].email !== decEmail) {
              const userid = result.rows[0].id;
              return pool
                .query(createQuery, toMessage)
                .then((data) => {
                  const newMessage = data.rows[0];
                  const messageid = data.rows[0].id;
                  return pool
                    .query(userMessage, [userid, messageid, msgstatus])
                    .then(() =>
                      res.status(200).send({
                        success: true,
                        message: "Success: message sent successfully!",
                        newMessage,
                      })
                    )
                    .catch((err) =>
                      res.status(400).send({
                        success: false,
                        error: "Error: message sending failed.",
                      })
                    );
                })
                .catch((err) =>
                  res.status(500).send({
                    success: false,
                    message: "Error: message sending failed.",
                  })
                );
            }
            if (result.rows[0].email) {
              return res.status(400).send({
                success: false,
                message: "Error: Oops! looks like you tried to email yourself.",
              });
            }
            if (result.rowCount === 0) {
              return res.status(400).send({
                success: false,
                message: "Error: email does not exist.",
              });
            }
          });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: email does not exist.",
        })
      );
  },

  /**
   * Get Mails
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  getMails(req, res) {
    const { userId } = req.user.id;
    const toemail = req.user.email;

    const getMessages =
      "select * from messages left join usermessage on userid = $1 and toemail = $2 order by created_date desc";

    pool
      .query(getMessages, [userId, toemail])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: messages retrieved successfully!",
            retrievedMessages,
          });
        }
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: no message found",
        })
      );
  },

  /**
   * Get Unread
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  getUnread(req, res) {
    const email = req.user.email;
    console.log(email);

    const getUnread =
      "select * from messages where toemail = $1 and msgstatus = $2 order by created_date desc";

    pool
      .query(getUnread, [email, "unread"])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: unread messages retrieved successfully!",
            retrievedMessages,
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: you have read all your messages",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding.",
        })
      );
  },

  /**
   * Get read
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  getRead(req, res) {
    const email = req.user.email;
    const getRead =
      "select * from messages where toemail = $1 and msgstatus = $2 order by created_date desc";

    pool
      .query(getRead, [email, "read"])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;

          return res.status(200).send({
            success: true,
            message: "Success: read messages retrieved successfully!",
            retrievedMessages,
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: you have not read any message",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Please try again.",
        })
      );
  },

  /**
   * Get Drafts
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  getDrafts(req, res) {
    const userid = req.user.id;
    const getDraft =
      "select * from messages where senderid = $1 and msgstatus = $2 order by created_date desc";

    pool
      .query(getDraft, [userid, "draft"])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: draft messages retrieved successfully!",
            retrievedMessages,
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: you have not prepared any message",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Please try again.",
        })
      );
  },

  /**
   * Update Status
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  updateStatus(req, res) {
    const email = req.user.email;
    const id = req.body.id;
    const { status } = req.body;
    const updateMessageStatus =
      "update messages set msgstatus=$3 where id=$2 and fromemail=$1 returning *";

    const values = [email, id, status];

    pool
      .query(updateMessageStatus, values)
      .then((data) => {
        if (data.rowCount > 0) {
          const editedMessage = data.rows;
          // user message query starts
          return res.status(200).send({
            success: true,
            message: "Success: message status updated successfully!",
            editedMessage,
          });
        }
        // If the message was not found
        return res.status(500).send({
          success: false,
          message: "Error: message not found",
        });
      }) // If the message status was not edited
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: message status could not be edited. Try again",
        })
      );
  },

  /**
   * Get sentMail
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  getSentMails(req, res) {
    const userid = req.user.id;
    const getSentMessages =
      "select * from messages where senderid = $1 and msgstatus = $2 order by created_date desc";

    pool
      .query(getSentMessages, [userid, "sent"])

      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: sent mails retrieved successfully!",
            retrievedMessages,
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: you have not sent any message",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Please try again.",
        })
      );
  },

  /**
   * Get a Mail
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  // gets a particular message

  getMail(req, res) {
    const toemail = req.user.email;
    const id = req.params.id;
    const getMessage =
      "select * from messages left join usermessage on toemail = $1 and messageid = id where id=$2";
    
    pool
      .query(getMessage, [toemail, id])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessage = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: mail retrieved successfully!",
            retrievedMessage,
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: mail not found.",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Please try again.",
        })
      );
  },

  /**
   * Get a Mails with usernames
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object with the lastname of the person that sent it
   */

  /**
   * delete Mail
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  deleteMail(req, res) {
    const toemail = req.user.email;
    let id = req.params.id;

    const deleteMessage =
      "delete from messages where id=$2 and toemail=$1 returning *";

    pool
      .query(deleteMessage, [toemail, id])
      .then((data) => {
        if (data.rowCount > 0) {
          return res.status(200).send({
            success: true,
            message: "Success: mail deleted successfully!",
          });
        }
        // If the message was not found
        return res.status(400).send({
          success: false,
          message: "Error: mail not found",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message:
            "Error: mail could not be deleted either because the mail was not found, or something bad happened. Please try again.",
        })
      );
  },

  /**
   * retract Mail
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  // delete specific mail sent by the user
  retractMail(req, res) {
    const userid = req.user.id;
    const email = req.user.email;
    let id = req.params.id;
    const retractUserMessage =
      "delete from userMessage where messageid = $1 and userid=$2";
    const retractMessage =
      "delete from messages where senderid = $1 and id = $2";
    const returnUser = "select * from users where email = $1";

    // return the person email was sent to
    pool
      .query(returnUser, [email])
      .then((info) => {
        if (info.rowCount > 0) {
          const userId = info.rows[0].userid;
          // delete from messages
          return pool
            .query(retractMessage, [userid, id])
            .then((data) => {
              if (data.rowCount > 0) {
                // delete from userMessages
                return pool
                  .query(retractUserMessage, [id, userId])
                  .then((result) => {
                    return res.status(200).send({
                      success: true,
                      message: "Success: mail retracted successfully!",
                    });
                  })
                  .catch((err) =>
                    res.status(400).send({
                      success: false,
                      message: "Error: mail not found",
                    })
                  );
              }
              return res.status(400).send({
                success: false,
                message: "Error: mail not deleted",
              });
            })
            .catch((err) =>
              res.status(500).send({
                success: false,
                message: "Error: server not responding. Please try again.",
              })
            );
        }
        return res.status(400).send({
          success: false,
          message: "Error: problem retrieving email",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding, Try again later",
        })
      );
  },

  /**
   * Update Message
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  updateMessage(req, res) {
    const email = req.user.email;
    const userid = req.user.id;
    const id = req.params.id;
    const { subject, message, toemail, msgstatus } = req.body;

    const updateMessage =
      "update messages set fromemail=$1, subject=$2, message=$3, toemail=$4, msgstatus=$5, created_date=$6 where id=$7 and senderid=$8 returning *";

    const values = [
      email,
      subject,
      message,
      toemail,
      msgstatus,
      moment().format(),
      id,
      userid,
    ];

    pool
      .query(updateMessage, values)
      .then((data) => {
        if (data.rowCount > 0) {
          const editedMessage = data.rows;
          //  message query starts
          return res.status(200).send({
            success: true,
            message: "Success: message updated successfully!",
            editedMessage,
          });
        }
        // If the message was not found
        return res.status(500).send({
          success: false,
          message: "Error: message not found",
        });
      }) // If the message  was not edited
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: message status could not be edited. Try again",
        })
      );
  },
};

export default mails;