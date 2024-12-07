const express = require("express"),
			router = express.Router(),
			backofficeController = require("../controllers/backofficeController.js"),
			indexController = require("../controllers/indexController.js")

router
	.get("/", loginRequired, suspentionCheck, indexController.indexPage)
	.get("/backoffice", loginRequired, superAdminRequired, backofficeController.backofficePage)
	.get("/intro", loginRequired, suspentionCheck, indexController.introPage)
	.get("/setup", loginRequired, suspentionCheck, indexController.setupPage)
	.get("/setup2", loginRequired, suspentionCheck, indexController.setupPage2)
	.get("/setup3", loginRequired, suspentionCheck, indexController.setupPage3)
	.post("/addapp", loginRequired, superAdminRequired, suspentionCheck, indexController.addApp)
	.delete("/deleteapp", loginRequired, suspentionCheck, indexController.deleteApp)
	.post("/revealapp", loginRequired, suspentionCheck, indexController.revealApp)
	.post("/feedback/:app_id/user/:user_id", loginRequired, suspentionCheck, indexController.userFeedback)
	.get("/mainsettings/:user_id", loginRequired, suspentionCheck, indexController.uniSettings)
	.post("/refer/:user_id", loginRequired, suspentionCheck, indexController.referRegistration)
	.get("/inbox", loginRequired, suspentionCheck, indexController.inboxPage)
	.post("/inbox", loginRequired, suspentionCheck, indexController.sendMessage)
	.delete("/inbox/:message_id", loginRequired, suspentionCheck, indexController.deleteMessage)
	.get("/payment", loginRequired, suspentionCheck, indexController.payment)
	.get("/check_payment", loginRequired, suspentionCheck, indexController.check_payment)
	.get("/manage-subscription", loginRequired, suspentionCheck, indexController.manage_subscription)
	.get("/edit-subscription/:id", loginRequired, suspentionCheck, indexController.edit_subscription)
	.get("/add-subscription", loginRequired, suspentionCheck, indexController.add_subscription)
	.post("/update-plan", loginRequired, suspentionCheck, indexController.update_subscription)

function loginRequired(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect("/login")
	}
	next()
}

function superAdminRequired(req, res, next) {
	if (!req.user.is_superAdmin) {
		return res.render("403")
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
