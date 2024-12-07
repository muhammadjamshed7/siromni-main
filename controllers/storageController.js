const db = require("../db"),
			fs = require("fs"),
			busboy = require("connect-busboy");

exports.storage = (req, res) => {
	db("storage_users")
		.where("user_id", req.user.id)
		.first()
		.then((users) => {
			if (users) {
				res.redirect("/storage/" + req.user.id)
			} else {
				res.render("storage/storageStart", {currentUser: req.user});
			}
		})
}

exports.startStorage = (req, res) => {
	db("users")
		.where("user_code", req.body.referrer_code)
		.first()
		.then((user) => {
			if (user) {
				db("storage_users")
					.insert({
						user_id: req.user.id,
						referrer_code: req.body.referrer_code
					})
					.then(() => {
						db("storage")
							.insert({
								owner_id: req.user.id
							})
							.then(() => {
								res.redirect("/storage/" + req.user.id)
							})
					})
			} else {
				// flash message: please enter valid referrer_code
				res.redirect("back")
			}
		})
}

exports.storageHome = (req, res, next) => {
	db("storage")
		.innerJoin("users", "storage.owner_id", "users.id")
		.leftJoin("storage_files", "storage.storage_id", "storage_files.source_id")
		.where("owner_id", req.params.user_id)
		.then((storageInfo) => {
			db("storage_users_storage")
				.innerJoin("users", "storage_users_storage.user_id", "users.id")
				.innerJoin("storage", "storage_users_storage.source_id", "storage.storage_id")
				.where("owner_id", req.params.user_id)
				.then((usersInStorage) => {
					db("storage")
						.innerJoin("users", "storage.owner_id", "users.id")
						.innerJoin("storage_users_storage", "storage.storage_id", "storage_users_storage.source_id")
						.where("user_id", req.user.id)
						.then((invitedStorages) => {
							db("storage_folders")
								.leftJoin("storage_folders_users", "storage_folders.folder_id", "storage_folders_users.source_id")
								.where("storage_id", storageInfo[0].storage_id)
								.then((folders) => {
									var isLeader = false;
									if (req.params.user_id == req.user.id) {
										isLeader = true;
									}
									res.render("storage/storagePage", {currentUser: req.user, isLeader, storageInfo, usersInStorage, invitedStorages, folders})
								})
						})
				})
		})
}

exports.inviteUser = (req, res) => {
	db("users")
		.where("username", req.body.username)
		.first()
		.then((user) => {
			if (user) {
				db("storage_users_storage")
					.insert({
						user_id: user.id,
						source_id: req.params.storage_id
					})
					.then(() => {
						res.redirect("back")
					})
			} else {
				res.redirect("back")
			}
		})
}

exports.removeUserFromStorage = (req, res) => {
	db("storage_users_storage")
		.where({source_id: req.params.storage_id, user_id: req.body.user_id})
		.del()
		.then(() => {
			res.redirect("back")
		})
}

exports.upload = (req, res) => {
	var fstream;
		req.pipe(req.busboy);
		req.busboy.on("file", (fieldName, file, fileName) => {
			console.log("Uploading: " + fileName);
			fstream = fs.createWriteStream("./public/storage/" + fileName);
			file.pipe(fstream);
			fstream.on("close", () => {
			db("storage_files")
				.insert({
					source_id: req.params.storage_id,
					file: fileName
				})
				.then(() => {
					res.redirect("back");
				})
			})
		})
}

exports.createFolder = (req, res) => {
	db("storage_folders")
		.insert({
			owner_id: req.params.owner_id,
			title: req.body.title,
			storage_id: req.params.storage_id,
		})
		.then((folderId) => {
			db("storage_folders_users")
				.insert({
					user_id: req.user.id,
					source_id: folderId
				})
				.then(() => {
					res.redirect("back")
				})
		})
}

exports.eachFolder = (req, res) => {
	db("storage_folders")
		.where("folder_id", req.params.folder_id)
		.first()
		.then((folders) => {
			db("storage_folders_users")
				.innerJoin("users", "storage_folders_users.user_id", "users.id")
				.where("source_id", req.params.folder_id)
				.then((usersInFolder) => {
					console.log(usersInFolder)
					db("storage_folder_files")
						.where("source_id", req.params.folder_id)
						.then((files) => {
							var isLeader = false;
							if (folders.owner_id == req.user.id) {
								isLeader = true;
							}
							res.render("storage/eachFolder", {currentUser: req.user, folders, isLeader, files, usersInFolder})
						})
				})
		})
}

exports.inviteUserToFolder = (req, res) => {
	db("users")
		.where("username", req.body.username)
		.first()
		.then((user) => {
			if (user) {
				db("storage_folders_users")
					.insert({
						user_id: user.id,
						source_id: req.params.folder_id
					})
					.then(() => {
						res.redirect("back")
					})
			} else {
				res.redirect("back")
			}
		})
}

exports.removeUserFromFolder = (req, res) => {
	db("storage_folders_users")
		.where({source_id: req.params.folder_id, user_id: req.body.user_id})
		.del()
		.then(() => {
			res.redirect("back")
		})
}

exports.uploadInFolder = (req, res) => {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on("file", (fieldName, file, fileName) => {
		console.log("Uploading: " + fileName);
		fstream = fs.createWriteStream("./public/storage/" + fileName);
		file.pipe(fstream);
		fstream.on("close", () => {
			db("storage_folder_files")
				.insert({
					file: fileName,
					source_id: req.params.folder_id
				})
				.then(() => {
					res.redirect("/storage/" + req.params.storage_id + "/folder/" + req.params.folder_id)
				})
		})
	})
}