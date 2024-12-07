const express = require("express"),
			router = express.Router(),
			linkstoreController = require("../controllers/linkstoreController.js")

router
	.get("/linkstore", loginRequired, suspentionCheck, linkstoreController.linkstore)
	.post("/linkstore", loginRequired, suspentionCheck, linkstoreController.startLinkstore)
	.get("/linkstore/home", loginRequired, suspentionCheck, linkstoreController.home)
	.post("/linkstore/createfolder", loginRequired, suspentionCheck, linkstoreController.createFolder)
	.get("/linkstore/:folder_id", loginRequired, suspentionCheck, linkstoreController.eachFolder)
	.delete("/linkstore/:folder_id", loginRequired, suspentionCheck, linkstoreController.deleteFolder)
	.post("/linkstore/:folder_id/adduser", loginRequired, suspentionCheck, linkstoreController.addUserToFolder)
	.delete("/linkstore/:folder_id/removeUser", loginRequired, suspentionCheck, linkstoreController.removeUserFromFolder)
	.post("/linkstore/:folder_id/createlink", loginRequired, suspentionCheck, linkstoreController.createLinkInFolder)
	.delete("/linkstore/:folder_id/deleteLink/:link_id", loginRequired, suspentionCheck, linkstoreController.deleteLinkInFolder)

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