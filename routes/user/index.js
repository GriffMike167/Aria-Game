const controller = require("./usercontroller");

const express = require("express");
const auth = require("../auth/authservice");
const router = express.Router();


router.get("/", auth.hasRole("user"), controller.show);


router.post("/register", controller.registerUser);

router.post("/login", controller.loginUser);

module.exports = router;