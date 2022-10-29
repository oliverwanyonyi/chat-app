import express from "express";
import {  login, register, updateProfile,searchUsers, saveNotif, clearReadNotifs,getNotifs } from "../controllers/userControllers.js";

const router = express.Router();

router.post("/register", register);
router.route("/login").post(login);
router.route('/notify').post(saveNotif).put(clearReadNotifs).get(getNotifs)
router.route("/:id").put(updateProfile);
router.route("/:id").get(searchUsers);

export default router;
