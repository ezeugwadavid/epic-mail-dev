import "babel-polyfill";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import express from "express";
import User from "./src/controllers/user";
import mails from "./src/controllers/mails";
import groupController from "./src/controllers/groupController";
import Auth from "./src/controllers/Auth";
import Auth2 from "./src/controllers/Auth2";
import MailValidatorHandler from './src/validations/mailValidator';
import GroupValidatorHandler from './src/validations/groupValidator';
import UserValidatorHandler from './src/validations/userValidator';
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(morgan('dev'));

//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// messages routes

app.post("/api/v1/messages", Auth.verifyToken, MailValidatorHandler.createMailValidator, mails.create);
app.get("/api/v1/messages/mails", Auth.verifyToken, mails.getMails);
app.get('/api/v1/messages/unread', Auth.verifyToken, mails.getUnread);
app.get('/api/v1/messages/read', Auth.verifyToken, mails.getRead);
app.get('/api/v1/messages/drafts', Auth.verifyToken, mails.getDrafts);
app.put('/api/v1/messages/updateStatus', Auth.verifyToken, mails.updateStatus);
app.get('/api/v1/messages/sentMail', Auth.verifyToken, mails.getSentMails);
app.get('/api/v1/messages/getMail/:id', Auth.verifyToken, mails.getMail);
app.delete('/api/v1/messages/deleteMail/:id', Auth.verifyToken, mails.deleteMail); //delete received mails
app.delete('/api/v1/messages/retractMail/:id', Auth.verifyToken, mails.retractMail); // delete sent mails
app.put('/api/v1/messages/updateMessage/:id', Auth.verifyToken, mails.updateMessage);




  // create, login and delete users
app.post("/api/v1/users", UserValidatorHandler.signupValidator, User.create);
app.post("/api/v1/users/login", User.login);
app.delete("/api/v1/users/me", Auth.verifyToken, User.delete);
app.post("/api/v1/users/resetpassword", GroupValidatorHandler.validMember, User.reset);
app.put("/api/v1/users/updatepassword", Auth2.verifyToken, UserValidatorHandler.passwordCheck, User.updatepassword);



 // for groups
 app.post("/api/v1/createGroups", Auth.verifyToken, GroupValidatorHandler.validGroupName, groupController.createGroup);
 app.get("/api/v1/getGroups", Auth.verifyToken, groupController.getGroups);
 app.put("/api/v1/editGroup/:id", Auth.verifyToken, groupController.editGroup);
 app.delete("/api/v1/deleteGroup/:id", Auth.verifyToken, groupController.deleteGroup);
 app.post("/api/v1/addUser", Auth.verifyToken, GroupValidatorHandler.validMember, groupController.addUser);
 app.get("/api/v1/getGroupUsers/:id", Auth.verifyToken, groupController.getGroupUsers);
 app.delete("/api/v1/deleteGroupUsers/:id", Auth.verifyToken, groupController.deleteUser);
 app.post("/api/v1/sendGroupMail/:id", Auth.verifyToken,  groupController.sendGroupMail);
 app.get("/api/v1/getGroupMail/:id", Auth.verifyToken, groupController.getGroupMails);
 app.delete("/api/v1/deleteGroupMails/:id", Auth.verifyToken, groupController.deleteGroupMail);

                              
 
 

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
