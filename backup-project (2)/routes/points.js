const express = require("express"),
			router = express.Router(),
			pointsController = require("../controllers/pointsController.js")

router
	.get("/transfer", loginRequired, suspentionCheck, pointsController.getPoints)
	.post("/transfer", loginRequired, suspentionCheck, pointsController.transferPoints)
	.get("/public-ledger/:user_id", loginRequired, suspentionCheck, pointsController.getPublicLedger)
	.get("/personal-ledger/:user_id", loginRequired, suspentionCheck, pointsController.getPersonalLedger)

function loginRequired(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect("/login")
	}
	next()
}

function suspentionCheck(req, res, next) {
	if (req.user.is_suspended) {
		return res.render("user_suspention")
	}
	next()
}

module.exports = router;
