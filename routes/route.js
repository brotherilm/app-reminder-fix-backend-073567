import express from "express";
import { verifyToken } from "../middleware/jwtToken.js";
import { register, login } from "../controllers/userController.js";
import { getProfile } from "../controllers/userController.js";
import { createAirdrop } from "../controllers/airdrop-data/createAirdrop.js";
import {
  deleteAirdrop,
  editAirdrop,
} from "../controllers/airdrop-data/editAirdrop.js";
import { getAirdropUser } from "../controllers/getAirdropUser.js";
import { editNote } from "../controllers/airdrop-data/editNote.js";
import {
  addLink,
  editLink,
  deleteLink,
} from "../controllers/airdrop-data/addLink.js";
import { supportDesktop } from "../controllers/airdrop-data/supportDesktop.js";
import { ratingAidrop } from "../controllers/airdrop-data/rating.js";
import { attemptAirdrop } from "../controllers/airdrop-data/attempt.js";
import { Countdown, GetCountdown } from "../controllers/Time.js";
import {
  userSubscription,
  getSubscriptionStatus,
} from "../controllers/userSubscription.js";
import { resetTimerAirdrop } from "../controllers/airdrop-data/timerAirdrop.js";
import {
  createAccordition,
  getAccorditions,
  editAccordition,
  deleteAccordition,
} from "../controllers/accorditionUser.js";
import { getTotalModalProfit } from "../controllers/getAnalysis.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

// subcription
router.post("/subcription", userSubscription);
router.get("/subcription", getSubscriptionStatus);

// verify token for all route
router.use(verifyToken);

// get user
router.post("/get-user", getProfile);
// form
router.post("/create-airdrop", createAirdrop);

// airdrop
router.post("/edit-airdrop", editAirdrop);
router.post("/delete-airdrop", deleteAirdrop);

// get airdrop
router.post("/get-airdrop", getAirdropUser);

// note
router.post("/edit-note", editNote);

// link
router.post("/add-link", addLink);
router.post("/edit-link", editLink);
router.post("/delete-link", deleteLink);

// support
router.post("/support-desktop", supportDesktop);

// rating
router.post("/rating", ratingAidrop);

// attempt
router.post("/attempt", attemptAirdrop);

// Global Time
router.post("/time", Countdown);
router.post("/get-globaltimer", GetCountdown);

// reset timer airdrop
router.post("/reset-timer", resetTimerAirdrop);

// create accordition
router.post("/create-accordition", createAccordition);
router.post("/get-accordition", getAccorditions);
router.post("/edit-accordition", editAccordition);
router.post("/delete-accordition", deleteAccordition);

// get total modal and profit
router.post("/get-analysis", getTotalModalProfit);

export default router;
