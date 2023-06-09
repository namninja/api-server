// load up our shiny new route for users
const userRoutes = require('./users');
const jobRoutes = require('./jobs');
const commentRoutes = require('./comments');
const postRoutes = require('./posts');
const todoRoutes = require('./todos');
const photoRoutes = require('./photos');
const albumRoutes = require('./albums');
const productRoutes = require('./products');
const cvjobRoutes = require('./cvjobs');
const jwtRoutes = require('./jwt');
const mobileJwtRoutes = require('./mobilejwt');
//const client = require('node-iterable-api').create('99a3883fd905413f8ecc4acda85f9a45')

// let iterableClient = {
// async addPhone(email, phone) {
//   await client.users.update({
//     email,
//     dataFields: {
//       phoneNumber: phone,
//     }
//   })
// },
// async sendWelcomeSMS(campaignId, recipientEmail) {
//   try {
//     await client.sms.target({
//       campaignId,
//       recipientEmail
//     })
//   } catch (error) {
//     console.log(error)
//   }
// }
// }
const appRouter = (app, fs) => {
    // we've added in a default route here that handles empty routes
  // at the base API url
  app.get('/', (req, res) => {
    res.send('welcome to the development api-server.  Here are the following routes: users, comments, products, todos, photos, albums, posts');
    // let email = "nam.ngo+node33@iterable.com"
    // let recipientEmail = email
    // let phone = "+18582284675"
    // let campaignId = 6502140
    //iterableClient.addPhone(email,phone)
    //iterableClient.addPhone(email,phone).then(response => console.log(response)).then(() => {iterableClient.sendWelcomeSMS(6502140, email)})
    //iterableClient.addPhone(email,phone).then(response => console.log(response)).then(setTimeout(() => {iterableClient.sendWelcomeSMS(6502140, email)}, "3000"))
    // iterableClient.sendWelcomeSMS(6502140, email)
    //setTimeout(() => {iterableClient.sendWelcomeSMS(6502140, email)}, "5000")
    // client.users.update({
    //   email,
    //   dataFields: {
    //     phoneNumber: phone,
    //   }
    // }).then(result => { 
    //   console.log(result.code)
    //   if (result.code == "Success") {
        
    //       setTimeout(() => {client.sms.target({
    //         campaignId: campaignId,
    //         recipientEmail: email
    //       }).then(result => console.log(result))}, "2000")
          
        
    //   } else {
    //     console.log("nope")
    //   }
    //   })
    
  
  })
  // run our user route module here to complete the wire up
  userRoutes(app, fs);
  commentRoutes(app, fs);
  postRoutes(app, fs);
  todoRoutes(app, fs);
  photoRoutes(app, fs);
  albumRoutes(app, fs);
  productRoutes(app, fs);
  jobRoutes(app, fs);
  cvjobRoutes(app, fs);
  jwtRoutes(app, fs);
  mobileJwtRoutes(app, fs);
};

module.exports = appRouter;