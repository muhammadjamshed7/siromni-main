const db = require("../db"),
      nodemailer = require("nodemailer"),
      fs = require("fs"),
      busboy = require("connect-busboy");

exports.blogPage = (req, res) => {
  db("users")
    .innerJoin("profile","profile.user_id", "users.id")
    .where("user_id", req.user.id)
    .then((user) => {
      db("blogs")
        .where("user_id", req.user.id)
        .then((posts) => {
          res.render("blog/index", { currentUser: req.user, userInfo: user, posts })
        })
    })
}

exports.newBlog = (req, res) => {
  db("users")
    .innerJoin("profile", "users.id", "profile.user_id")
    .where("user_id", req.params.user_id)
    .then((user) => {
      res.render("blog/new", { currentUser: req.user, userInfo: user })
    })
}

exports.createBlog = (req, res) => {
  db("blogs")
    .insert({
      user_id: req.user.id,
      title: req.body.title,
      body: req.body.body,
      created_at: new Date().today() + " - " + new Date().timeNow() 
    })
    .then((id) => {
      db("users")
        .where("id", req.user.id)
        .first()
        .then((user) => {
          var points = user.points;
          db("users")
            .where("id", req.user.id)
            .first()
            .update({
              points: points + 1
            })
            .then(() => {
              res.redirect(`/blog/${req.user.id}/post/${id[0]}`);
            })
        })
    })
}

exports.eachBlogPost = (req, res) => {
  db("users")
    .innerJoin("profile", "users.id", "profile.user_id")
    .where("user_id", req.params.user_id)
    .then((user) => {
      db("blogs")
        .where({ id: req.params.post_id })
        .first()
        .then((post) => {
          db("blog_comments")
            .innerJoin("users", "blog_comments.user_id", "users.id")
            .where("blog_id", req.params.post_id)
            .then((comments) => {
              res.render("blog/show", { currentUser: req.user, userInfo: user, post, comments })
            })
        })
    })
}

exports.editBlogPost = (req, res) => {
  db("users")
    .innerJoin("profile", "users.id", "profile.user_id")
    .where("user_id", req.params.user_id)
    .then((user) => {
      db("blogs")
        .where("id", req.params.post_id)
        .first()
        .then((post) => {
          res.render("blog/edit", { currentUser: req.user, userInfo: user, post })
        })
    })
}

exports.updateBlogPost = (req, res) => {
  db("blogs")
    .where("id", req.params.post_id)
    .update({
      user_id: req.user.id,
      title: req.body.title,
      body: req.body.body,
      updated_at: new Date().today() + " - " + new Date().timeNow() 
    })
    .then(() => {
      res.redirect(`/blog/${req.user.id}/post/${req.params.post_id}`);
    })
}

exports.deleteBlogPost = (req, res) => {
  db("blogs")
    .where("id", req.params.post_id)
    .del()
    .then(() => {
      res.redirect(`/blog/${req.user.id}`)
    })
}

exports.commentOnBlog = (req, res) => {
  db("blog_comments")
    .insert({
      blog_id: req.params.post_id,
      user_id: req.user.id,
      comment: req.body.comment,
      created_at: new Date().today() + " - " + new Date().timeNow()  
    })
    .then(() => {
      res.redirect("back");
    })
}

// For todays date;
Date.prototype.today = function () { 
  return ((this.getDate() < 10)?"":"") + (this.getMonth()+1) +"/"+ ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
  let hour = this.getHours()
  if (hour > 12) {
    hour = hour - 12;
  } 
  return ((hour < 10)?"0":"") + hour +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}
