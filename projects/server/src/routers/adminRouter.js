const express = require("express");
const Router = express.Router();

// Import Controller
const { adminAccountController } = require("../controllers");
const uploadImages = require("../middleware/uploadImage");

Router.get("/getAdmin", adminAccountController.getUserAdmin);
Router.post("/registerAdmin", uploadImages, adminAccountController.register);


module.exports = Router;
