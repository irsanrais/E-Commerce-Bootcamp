// Import env configuration
require("dotenv").config();
// Import Sequelize
const { sequelize } = require("../models");

// Import models
const db = require("../models/index");
const users = db.users;

// Import verification token function
const {
  createVerificationToken,
  validateVerificationToken,
} = require("../helper/verificationToken");
const { createToken, validateToken } = require("../lib/jwt");
// Import transporter function
const transporter = require("../helper/transporter");
const fs = require("fs").promises;
const handlebars = require("handlebars");
const deleteFiles = require("./../helper/deleteFiles");
// Import hash function
const { hashPassword, hashMatch } = require("../lib/hash");

module.exports = {
  register: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const email = req.body.email;

      const findEmail = await users.findOne({ where: { email } });
      if (findEmail) {
        res.status(409).send({
          isError: true,
          message: "Email has been used.",
          data: null,
        });
      } else {
        const createAccount = await users.create({ email }, { transaction: t });

        const template = await fs.readFile(
          "./src/template/register.html",
          "utf-8"
        );
        let compiledTemplate = handlebars.compile(template);
        let registerTemplate = compiledTemplate({
          registrationLink: `${process.env.WHITELISTED_DOMAIN}/user/verify`,
          email,
          token: createVerificationToken({ id: createAccount.dataValues.id }),
        });
        await transporter.sendMail({
          from: `Big4Commerce <${process.env.GMAIL}>`,
          to: email,
          subject: "Complete Your Registration",
          html: registerTemplate,
        });

        t.commit();
        res.status(201).send({
          isError: false,
          message: "Account created.",
          data: null,
        });
      }
    } catch (error) {
      t.rollback();
      res.status(409).send({
        isError: true,
        message: error,
        data: null,
      });
    }
  },
  verify: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { email, password, token } = req.body;
      validateVerificationToken(token);

      await users.update(
        { password: await hashPassword(password), is_verified: 1 },
        { where: { email } },
        { transaction: t }
      );

      t.commit();
      res.status(201).send({
        isError: false,
        message: "Password created.",
        data: null,
      });
    } catch (error) {
      t.rollback();
      res.status(404).send({
        isError: true,
        message: error?.message,
        data: null,
      });
    }
  },
  isVerified: async (req, res) => {
    try {
      const { email } = req.params;

      const verificationStatus = await users.findOne({ where: { email } });

      res.status(200).send({
        isError: false,
        message: "Get verification status",
        data: verificationStatus.is_verified,
      });
    } catch (error) {
      res.status(404).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  },
  login: async (req, res) => {
    try {
      let { email, password } = req.body;

      const findEmail = await users.findOne({ where: { email } });
      if (!findEmail) {
        res.status(409).send({
          isError: true,
          message: "Email not found.",
          data: null,
        });
      } else {
        let hasMatchResult = await hashMatch(
          password,
          findEmail.dataValues.password
        );

        if (hasMatchResult === false)
          return res.status(404).send({
            isError: true,
            message: "Password not valid",
            data: true,
          });

        const userData = await users.findOne({
          where: { email },
          attributes: { exclude: ["password"] },
        });
        res.status(200).send({
          isError: false,
          message: "Login Success",
          data: {
            user: userData,
            token: createToken({ id: findEmail.dataValues.id }),
          },
        });
      }
    } catch (error) {
      res.status(500).send({
        isError: true,
        message: error.message,
        data: true,
      });
    }
  },
  resetPassword: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const email = req.body.email;

      const findEmail = await users.findOne({ where: { email } });
      if (!findEmail) {
        res.status(409).send({
          isError: true,
          message: "Email not found",
          data: null,
        });
      } else {
        const template = await fs.readFile(
          "./src/template/resetPassword.html",
          "utf-8"
        );
        let compiledTemplate = handlebars.compile(template);
        let resetPasswordTemplate = compiledTemplate({
          resetPasswordLink: `${process.env.WHITELISTED_DOMAIN}/user/verify-new-password`,
          email,
          token: createToken({ id: findEmail.dataValues.id }),
        });
        await transporter.sendMail({
          from: `Big4Commerce <${process.env.GMAIL}>`,
          to: email,
          subject: "Reset Password",
          html: resetPasswordTemplate,
        });

        t.commit();
        res.status(201).send({
          isError: false,
          message: "Email already sent for reset password, check your inbox.",
          data: null,
        });
      }
    } catch (error) {
      t.rollback();
      res.status(409).send({
        isError: true,
        message: error,
        data: null,
      });
    }
  },
  verifyNewPassword: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { email, password, token } = req.body;
      validateToken(token);

      await users.update(
        { password: await hashPassword(password) },
        { where: { email } },
        { transaction: t }
      );

      t.commit();
      res.status(201).send({
        isError: false,
        message: "New Password created.",
        data: null,
      });
    } catch (error) {
      t.rollback();
      res.status(404).send({
        isError: true,
        message: error?.message,
        data: null,
      });
    }
  },
  changePicture: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      //Get id from decoding token
      const { id } = req.dataDecode;
      const response = await users.findOne({ where: { id } });
      //Delete old profile_picture data
      const oldPicture = response.dataValues.profile_picture;
      if (oldPicture) {
        await fs.unlink(`src/${oldPicture}`, (err) => {
          if (err) throw err;
        });
      }
      //Get image path data from middleware
      // let profile_picture = req.files?.profile_picture[0]?.path;
      if (req.files.profile_picture) {
        let profile_picture = req.files?.profile_picture[0]?.path.replace(
          "src\\",
          ""
        ); //public moved to src;
        //Update user's profile_picture with a new one
        await users.update(
          {
            profile_picture,
          },
          { where: { id } },
          { transaction: t }
        );

        t.commit();
        res.status(201).send({
          isError: false,
          message: "Upload Success!",
          data: null,
        });
      }
    } catch (error) {
      deleteFiles(req.files?.profile_picture);
      t.rollback();
      res.status(404).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  },
  removePicture: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      //Get id from decoding token
      const { id } = req.dataDecode;
      //Check if user data available in database
      const response = await users.findOne({ where: { id } });
      //Remove user's profile_picture data from database
      await users.update(
        { profile_picture: null },
        { where: { id } },
        { transaction: t }
      );
      //Remove image from storage
      await fs.unlink("src/" + response?.dataValues?.profile_picture, (err) => {
        if (err) throw err;
      });
      t.commit();
      res.status(200).send({
        isError: false,
        message: "Profile picture deleted.",
        data: null,
      });
    } catch (error) {
      t.rollback();
      res.status(404).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  },
  editProfile: async (req, res) => {
    try {
      //Get id from decoding token
      const { id } = req.dataDecode;
      const { fullName, phoneNumber } = req.body;
      //Update data with user input
      await users.update(
        { full_name: fullName, phone_number: phoneNumber },
        { where: { id } }
      );
      res.status(201).send({
        isError: false,
        message: "Profile updated.",
        data: null,
      });
    } catch (error) {
      res.status(404).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  },
  editPassword: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      //Get id from decoding token
      const { id } = req.dataDecode;
      const { oldPassword, newPassword } = req.body;
      //Get old password from database to compare
      const findOldPassword = await users.findOne({ where: { id } });
      //Compare input password with hashed password from database
      let hasMatchResult = await hashMatch(
        oldPassword,
        findOldPassword.dataValues.password
      );

      if (hasMatchResult === false)
        return res.status(404).send({
          isError: true,
          message: "Invalid password",
          data: true,
        });
      //Update new password after old password match
      await users.update(
        { password: await hashPassword(newPassword) },
        { where: { id } },
        { transaction: t }
      );
      t.commit();
      res.status(201).send({
        isError: false,
        message: "Password updated.",
        data: null,
      });
    } catch (error) {
      t.rollback();
      res.status(404).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  },
};
