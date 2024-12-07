const db = require("../db"),
	nodemailer = require("nodemailer");
	const axios = require('axios');

	const stripeSecretKey = 'sk_test_51OFfmqLty5p4mlSDLC08VlzTvnZM0Syelr4OnOaUAEUg4fMROYU3KixRyN3lYGEeKhy660kgEx27B0Zh0x8B19x100RTCf6xr2'; // Your Stripe secret key
const sessionId = 'cs_test_a1mIwisXAMctp2gAM7uHVHwLc07ioxuwkZAti8hlzkBaCyhm2fGToOuLEE'; // The session ID from the query


async function retrieveCheckoutSession(sessionId) {
  try {
    const response = await axios.get(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving checkout session:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to retrieve a subscription
async function retrieveSubscription(subscriptionId) {
  try {
    const response = await axios.get(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving subscription:', error.response ? error.response.data : error.message);
    throw error;
  }
}


exports.indexPage = (req, res) => {
	if (req.user.is_superAdmin) {
	

		console.log("check",req.user)

		db("apps")
			.select("*")
			.then((apps) => {
				res.render("index", { currentUser: req.user, apps: apps });
			})
	} else {
			console.log("wewewe11",req.user)
		db("users_apps")
			.innerJoin("apps", "users_apps.app_id", "apps.id")
			.where("user_id", req.user.id)
			.then((apps) => {
				res.render("index", { currentUser: req.user, apps: apps });
			})
	}
}

exports.introPage = (req, res) => {
	db("backoffice_intro")
		.first()
		.then(introText => res.render("introPage", { currentUser: req.user, introText }))
}

exports.setupPage = (req, res) => {
	db("backoffice_setup")
		.first()
		.then(setupText => res.render("setupPage", { currentUser: req.user, setupText }))
}

exports.setupPage2 = (req, res) => {
	res.render("setupPage2", { currentUser: req.user });
}

exports.setupPage3 = (req, res) => {
	res.render("setupPage3", { currentUser: req.user });
}

exports.addApp = (req, res) => {
	db("apps")
		.insert({
			title: req.body.title,
			route: req.body.route,
			key: req.body.key
		})
		.then(() => {
			res.redirect("back")
		})
}

exports.revealApp = (req, res) => {
	db("apps")
		.where("key", req.body.key)
		.first()
		.then((app) => {
			if (app) {
				db("users_apps")
					.where({
						app_id: app.id,
						user_id: req.user.id
					})
					.first()
					.then((match) => {
						if (match) {
							res.redirect("back")
						} else {
							db("users_apps")
								.insert({
									app_id: app.id,
									user_id: req.user.id
								})
								.then(() => {
									res.redirect("back")
								})
						}
					})
			} else {
				res.redirect("back")
			}
		})
}

exports.userFeedback = (req, res) => {
	db("feedbacks")
		.insert({
			app_id: req.params.app_id,
			user_id: req.user.id,
			feedback: req.body.feedback
		})
		.then(() => {
			req.flash("sucess", "Thank you for submitting your feedback. We greatly appreciate it and will work to better Omnilives");
			res.redirect("back")
		})
}

exports.uniSettings = (req, res) => {
	db("users")
		.innerJoin("profile", "users.id", "profile.user_id")
		.where("user_id", req.params.user_id)
		.then((userInfo) => {
			res.render("main-settings", { currentUser: req.user, userInfo })
		})
}

exports.referRegistration = (req, res, next) => {
	db("users")
		.where("id", req.params.user_id)
		.first()
		.then((user) => {
			let transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true, // use SSL
				auth: {
					user: "siromni.com@gmail.com",
					pass: "pvkvlnqqyuhohrcc"
				}
			})
			let message = `<p>Hi ${req.body.friend_name},</p>
			<p>You've been invited to join SirOmni.</p>
			<p>You can register here: <a href="http://siromni.com/signup/${user.username}">siromni.com/signup</a><p>
			`
			let mailOptions = {
				from: '"no-reply" <siromni.com@gmail.com>',
				to: req.body.friend_email,
				subject: `${user.first_name} ${user.last_name} invited you to join siromni.com`,
				html: message + req.body.message
			}
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(error);
					// flash message: Your email was not sent.
					console.log("Your email was not sent.")
					res.redirect("back")
				}
				console.log("message %s sent: %s", info.messageId, info.response);
			})
			// to referrer
			let transporter2 = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true, // use SSL
				auth: {
					user: "siromni.com@gmail.com",
					pass: "pvkvlnqqyuhohrcc"
				}
			})
			let message2 = `<p>Hi ${user.first_name},</p>
			<p>You've successfully sent an invite to ${req.body.friend_name} to join SirOmni.</p>
			`
			let mailOptions2 = {
				from: '"no-reply" <siromni.com@gmail.com>',
				to: req.body.your_email,
				subject: `SirOmni registration invite successfully sent`,
				html: message2
			}
			transporter2.sendMail(mailOptions2, (error, info) => {
				if (error) {
					console.log(error);
					// flash message: Your email was not sent.
					console.log("Your email was not sent.")
					res.redirect("back")
				}
				console.log("message %s sent: %s", info.messageId, info.response);
				req.flash("success", "Registration invite successfully sent")
				res.redirect("back")
			})
		})
}

exports.inboxPage = (req, res) => {
	db("inbox")
		.innerJoin("users", "inbox.sender_id", "users.id")
		.orderBy("message_id", "desc")
		.where("owner_id", req.user.id)
		.then((messages) => {
			res.render("inbox", { currentUser: req.user, messages })
		})
}
exports.sendMessage = (req, res) => {
	db("users")
		.where("username", req.body.username)
		.first()
		.then((user) => {
			if (user) {
				db("inbox")
					.insert({
						owner_id: req.user.id,
						sender_id: user.id,
						message: req.body.message,
						date: new Date().today(),
						time: new Date().timeNow()
					})
					.then(() => { res.redirect("back") })
			} else {
				req.flash("error", "Username doesn't exist")
				res.redirect("back");
			}
		})
}
exports.deleteMessage = (req, res) => {
	db("inbox")
		.where("message_id", req.params.message_id)
		.del()
		.then(() => { res.redirect("back") })
}
exports.deleteApp = (req, res) => {
	console.log(req.body.app_id);
	db("apps")
		.whereIn("id", req.body.app_id)
		.del()
		.then(() => { res.redirect("back") })
}

exports.payment = (req, res) => {

	db("manage_subscription")
			.where("user_id", req.user.id)
			.select("*")
			.then((apps) => {
				res.render("payment", { currentUser: req.user, apps: apps });
			})

}

exports.check_payment = async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    // Retrieve the checkout session
    const session = await retrieveCheckoutSession(sessionId);

    if (session.subscription) {

    	var user_id=req.user.id;
    	console.log("sessionuser_id",user_id)
      // Retrieve the subscription details
      const subscription = await retrieveSubscription(session.subscription);
      db("users")
    .where("id", user_id)
    .update({
      plan_id: subscription.id,
      is_active: 1,
     
    }).then(() => {
      console.log("wewewe")
    });
    console.log("s");
      res.locals.subscription = subscription; // Pass subscription details to the view
    } else {
      console.log('Payment successful, but no subscription was created.');
      res.locals.subscription = null; // Indicate no subscription was created
    }

    // Fetch data from your database
    const apps = await db("manage_subscription").select("*");

    // Render the view with the data
    res.render("check_payment", { currentUser: req.user, apps: apps, subscription: res.locals.subscription });
  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).send('Internal Server Error');
  }
};


exports.manage_subscription = (req, res) => {

	if (req.user.is_superAdmin) {
		db("manage_subscription")
			.where("user_id", req.user.id)
			.select("*")
			.then((apps) => {
				res.render("manage_subscription", { currentUser: req.user, apps: apps });
			})
	} else {
			db("manage_subscription")
			.where("user_id", req.user.id)
			.select("*")
			.then((apps) => {
				res.render("manage_subscription", { currentUser: req.user, apps: apps });
			})
	}

}

exports.edit_subscription = (req, res) => {
	db("manage_subscription")
	.where("id", req.params.id)
		.first()
		.then(introText => res.render("edit_subscription", { currentUser: req.user, introText }))
}

exports.terms = (req, res) => {
	db("pages")
	.where("id", 1)
		.first()
		.then(introText => res.render("terms", { currentUser: req.user, introText }))
}

exports.privacy = (req, res) => {
	db("pages")
	.where("id", 2)
		.first()
		.then(introText => res.render("privacy", { currentUser: req.user, introText }))
}

exports.edit_content = (req, res) => {
  const query1 = db("pages").where("id", 1).first();
  const query2 = db("pages").where("id", 2).first();

  Promise.all([query1, query2])
    .then(([introText1, introText2]) => {
      res.render("updatetermandpolicy", { 
        currentUser: req.user, 
        introText1, 
        introText2 
      });
    })
    .catch(error => {
      res.status(500).send("Error fetching data");
    });
}


exports.add_subscription = (req, res) => {
	db("manage_subscription")
	.where("id", 1)
		.first()
		.then(introText => res.render("add_subscription", { currentUser: req.user, introText }))
}

exports.save_content = (req, res) => {
	
		db("pages")
    .where("id", 1)
    .update({
      content: req.body.terms
    })
    .then(() => {
      //res.redirect(`/updatetermandpolicy`);
    })

    db("pages")
    .where("id", 2)
    .update({
      content: req.body.policy
    })
    .then(() => {
      res.redirect(`/edit-content`);
    })
	
  
}

exports.update_subscription = (req, res) => {
	if(req.body.id==''){
db("manage_subscription")
.insert({
      plan: req.body.planName,
      user_id: req.user.id,
      price: req.body.planPrice,
      duration: req.body.duration,
      key_point: req.body.description,
      planLink: req.body.planLink,
      updated_at: new Date().today() + " - " + new Date().timeNow() 
    })
    .then(() => {
      res.redirect(`/manage-subscription`);
    })
	}else{
		db("manage_subscription")
    .where("id", req.body.id)
    .update({
      plan: req.body.planName,
      price: req.body.planPrice,
      duration: req.body.duration,
      key_point: req.body.description,
      planLink: req.body.planLink,
      updated_at: new Date().today() + " - " + new Date().timeNow() 
    })
    .then(() => {
      res.redirect(`/manage-subscription`);
    })
	}
  
}



// For todays date;
Date.prototype.today = function () {
	return ((this.getDate() < 10) ? "" : "") + (this.getMonth() + 1) + "/" + ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
	let hour = this.getHours()
	if (hour > 12) {
		hour = hour - 12;
	}
	return ((hour < 10) ? "0" : "") + hour + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}
