const schedule = require('node-schedule'),
  db = require("../db"),
  moment = require('moment');

schedule.scheduleJob('0 0 * * *', function () {
  console.log('cron working!!!');
  var obj = {}
  db("crm_community_tasks")
    .then((tasks) => {
      tasks.forEach(function (task) {
        db("users")
          .then((users) => {
            users.forEach(function (user) {
              db("crm_community_users_tasks")
                .insert({
                  user_id: user.id,
                  task_id: task.id,
                  task_date: moment().format('YYYY-MM-DD')
                })
                .then(() => {
                  // next()
                })
            })
          })
      })
      console.log("new tasks created")
    })
});

Date.prototype.today = function () {
  return ((this.getDate() < 10) ? "" : "") + (this.getMonth() + 1) + "/" + ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + this.getFullYear();
}