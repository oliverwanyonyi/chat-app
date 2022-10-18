import express from "express";
import {  login, register, updateProfile } from "../controllers/userControllers.js";

const router = express.Router();

router.post("/register", register);
router.route("/login").post(login);
router.route("/:id").put(updateProfile);


export default router;
