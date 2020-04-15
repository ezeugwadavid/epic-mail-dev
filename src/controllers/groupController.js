import uuidv4 from "uuid/v4";
import pool from "../database/dbconnect";
import moment from "moment";

const groupController = {
  /**
   * Create A groupMessage
   * @param {object} req
   * @param {object} res
   * @returns {object} groupMessages object
   */
  createGroup(req, res) {
    const ownerid = req.user.id;
    const returnGroup = "select * from groups where name = $1";
    const createGroup =
      "insert into groups ( id, ownerid, name, createdon) values ($1, $2, $3, $4) returning *";

    const { name } = req.body;

    const values = [uuidv4(), ownerid, name, moment().format()];

    // check if group exists
    pool
      .query(returnGroup, [name])
      .then((result) => {
        if (result.rowCount === 0) {
          return pool
            .query(createGroup, values)
            .then((data) => {
              const newGroup = data.rows[0];
              return res.status(201).send({
                success: true,
                message: "Success: group created successfully!",
                newGroup
              });
            })
            .catch((err) =>
              res.status(500).send({
                success: false,
                message: "Error: server did not respond. Please try again.",
              })
            );
        }
        return res.status(400).send({
          success: false,
          message: "Error: this name is taken. Please try again",
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
   * get a group
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  getGroups(req, res) {
    const userid = req.user.id;
    const getGroups = "select * from groups where ownerid = $1";

    pool
      .query(getGroups, [userid])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedGroups = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: groups retrieved successfully!",
            retrievedGroups,
          });
        }
        return res.status(500).send({
          success: false,
          message: "Error: no group found",
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
   * edit group
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  editGroup(req, res) {
    const userid = req.user.id;
    let id = req.params.id;
    const { name } = req.body;
    const editGroup = "update groups set name=$2 where id=$1 and ownerid=$3 returning *";

    const values = [id, name, userid];

    pool
      .query(editGroup, values)
      .then((data) => {
        if (data.rowCount !== 0) {
          const editedGroup = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: group edited successfully!",
            editedGroup,
          });
        }
        return res.status(500).send({
          success: false,
          message: "Error: group not found",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: group could not be edited. Try again",
        })
      );
  },

  /**
   * delete a group
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  deleteGroup(req, res) {
    const ownerid = req.user.id;
    const id = req.params.id;
    const deleteGroup =
      "delete from groups where ownerid=$1 and id=$2 returning *";

    pool
      .query(deleteGroup, [ownerid, id])
      .then((data) => {
        if (data.rowCount !== 0) {
          const deletedGroup = data.rows[0];
          return res.status(200).send({
            success: true,
            message: "Success: group deleted successfully!",
            deletedGroup,
          });
        }
        return res.status(500).send({
          success: false,
          message: "Error: group could not be deleted. Try again",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Try again",
        })
      );
  },

  /**
   * add group members
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  addUser(req, res) {
    const ownerid = req.user.id;
    const { email } = req.body;
    const returnMember = "select * from users where email = $1";
    // Return an existing group
    const checkGroup = "select * from groups where ownerid = $1";

    const addUser =
      "insert into groupmembers ( id, groupid, memberid, email, addedon) values ($1, $2, $3, $4, $5) returning *";

    // check if user exists
    pool
      .query(returnMember, [email])
      .then((result) => {
           const memberid = result.rows[0].id
        if (result.rowCount > 0) {
          // select the user's group
          return pool.query(checkGroup, [ownerid]).then((detail) => {
            const groupid = detail.rows[0].id;
            const values = [
              uuidv4(),
              groupid,
              memberid,
              email,
              moment().format(),
            ];
            // check that there is a result in the array
            if (detail.rowCount !== 0) {
              // query the database and add the user
              return pool
                .query(addUser, values)
                .then((data) => {
                  const newMember = data.rows[0];
                  return res.status(200).send({
                    success: true,
                    message: "Group member added successfully!",
                    newMember,
                  });
                })
                .catch((err) => console.log(err)
                  // res.status(500).send({
                  //   success: false,
                  //   message: "Error: user not added. Try again",
                  // })
                );
            }
            return res.status(400).send({
              success: false,
              message: "Error: group does not exist. Try again.",
            });
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: user does not exist. Try again.",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Try again.",
        })
      );
  },

  /**
   * get group members
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  getGroupUsers(req, res) {
    const ownerid = req.user.id;
    const groupCheck = "select * from groups where ownerid=$1 and id=$2";
    const returnGroupMembers = "select * from groupmembers where groupid = $1 order by addedon desc";
    const groupId = req.params.id;

    // check if group exists
    pool
      .query(groupCheck, [ownerid, groupId])
      .then((result) => {
        if (result.rowCount === 0) {
          return res.status(400).send({
            success: false,
            message: "Error: group not found.",
          });
        }
        if (result.rowCount > 0 && result.rows[0].ownerid === ownerid) {
          return pool
            .query(returnGroupMembers, [groupId])
            .then((data) => {
              if (data.rowCount > 0) {
                return res.status(200).send({
                  success: true,
                  message: "Success: group members retrieved.",
                  returnedMembers: data.rows,
                });
              }
              return res.status(400).send({
                success: false,
                message: "Error: no one here. Try adding someone.",
              });
            })
            .catch((err) => {
              console.log(err.message);
              return res.status(400).send({
                success: false,
                message: "Error: no one here. Try adding someone.",
              });
            });
        }
        if (result.rowCount > 0 && result.rows[0].ownerid !== ownerid) {
          return res.status(404).send({
            success: false,
            message: "Error: this group doesn't belong to you.",
          });
        }
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(400).send({
          success: false,
          message: "Error: group does not exist.",
        });
      });
  },

  deleteUser(req, res) {
    let userid = req.user.id;
    let { id, memberid } = req.params;
    // Delete group member
    const deleteMember =
      "delete from groupmembers where groupid=$1 and memberid=$2;";
    // return specific group
    const returnGrp = "select * from groups where id=$1;";

    pool
      .query(returnGrp, [id])
      .then(async (data) => {
        if (data.rowCount !== 0 && data.rows[0].ownerid === userid) {
          try {
            await pool.query(deleteMember, [id, memberid]);
            return res.status(200).send({
              success: true,
              message: "Success: group member deleted successfully",
            });
          } catch (err) {
            console.log(err);
            return res.status(400).send({
              success: false,
              message: "Error: group member could not be deleted. Try again.",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          success: false,
          message: "Error: group does not exist",
        });
      });
  },

  /**
   * send group mail
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  sendGroupMail(req, res) {
    const ownerId = req.user.id;
    const fromEmail = req.user.email;
    const groupId = req.params.id;

    const values = [ownerId, groupId];
    const groupCheck = "select * from groups where ownerid=$1 and id=$2;";
    const returnMembers = "select  * from groupmembers where groupid=$1;";
    // check if group exists
    pool
      .query(groupCheck, values)
      .then((result) => {
        // check for the row count if greater than 0
        if (result.rowCount > 0) {
          return pool
            .query(returnMembers, [groupId])
            .then((data) => {
           //   const memberEmails = data.rows[0].email;
            
              // check for members
              if (data.rowCount < 0) {
                return res.status(400).send({
                  success: false,
                  message: "Error: no member found on the group.",
                });
              } // end check for members

              // this array will hold all member ids
              const members = [];
              data.rows.forEach((m) => members.push(m.memberid));
              const { subject, message, status } = req.body;

              // create an email
              const sendGroupMessage =
                "insert into groupMessages (id, senderid, fromemail, subject, message, toemail, msgstatus, created_date) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *;";

              const toMessage = [
                uuidv4(),
                ownerId,
                fromEmail,
                subject,
                message,
                `group${groupId}@epic-mail.com`,
                status,
                moment().format(),
              ];
              return pool
                .query(sendGroupMessage, toMessage)
                .then((detail) => {
                  
                  const groupMsg = detail.rows[0];
                  return res.status(200).send({
                    success: true,
                    message: "Success: group message sent successfully!",
                    groupMsg,
                  });
                  
                })
                .catch((err) =>
                  res.status(500).send({
                    success: false,
                    message:
                      "Error: server taking too long to respond. Try again.",
                  })
                );
            }) // end data block
            .catch((err) =>
              res.status(500).send({
                success: false,
                message: "Error: server could not respond. Try again.",
              })
            );
        }
        return res.status(400).send({
          success: false,
          message: "Error: group does not exist.",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: "Error: server not responding. Try again.",
        })
      );
  },

  /**
   * Get GroupMails
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */

  getGroupMails(req, res) {
    const { userId } = req.user.id;
    const groupId = req.params.id;
    const toemail = `group${groupId}@epic-mail.com`;
    const getMessages =
      "select * from groupmessages where toemail= $1  order by created_date desc";

    pool
      .query(getMessages, [toemail])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200).send({
            success: true,
            message: "Success: group messages retrieved successfully!",
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
   * Delete GroupMails
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  deleteGroupMail(req, res) {
    const senderid = req.user.id;
    let groupmessagesid = req.params.id;

    const deleteMessage =
      "delete  from groupmessages  where  senderid=$1 and id=$2";

    pool
      .query(deleteMessage, [senderid, groupmessagesid])
      .then((data) => {
        if (data.rowCount > 0) {
          return res.status(200).send({
            success: true,
            message: "Success: group mails deleted successfully!",
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
            "Error: mail could not be deleted either because the mail was not found, or something bad happened.",
        })
      );
  },
};

export default groupController;
