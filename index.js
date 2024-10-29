const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()


mongoose.connect(process.env.DB_URI).catch(err => {console.log(err)})


const Schema = mongoose.Schema

// const CatModelSchema = new Schema({
//   name: String,
//   claws: Number
// })

// const Cat = mongoose.model('Cat', CatModelSchema);
// const kitty = new Cat({ name: 'Fluffy',  claws: 10 });

// kitty.save().then(() => console.log('meow'));
// Exercise model 
/*
{
  username: "fcc_test",
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
  }
  
  
  */

  // SCHEMAS

const UserModelSchema = new Schema({username: String})

const ExerciseModelSchema = new Schema(
  {
    username: String,
    description: String,
    duration: Number,
    date: Date,
  }
)
const LogSchema = new Schema({
    description: String,
    duration: Number,
    date: String,
})


/** ** MODELS */
const User = mongoose.model('User', UserModelSchema)
const Exercise = mongoose.model('Exercise', ExerciseModelSchema)



app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Middleware

const getUsername = async (req, res, next) => {


    try {
      let userQuery = await User.findOne({_id: req.params._id})
      req.username = userQuery.username  
      console.log("User Name", userQuery.username ) 
      next()
    }
    catch (err) {
      next("ERROR", err)
    }
}
  
 




/* API Requests */
// USERS - Create and Post user
app.route('/api/users')
  .post(async (req,res) => {    
    let user = new User({username: req.body.username})
    await user.save()
        res.json({username: user.username, _id: user._id})
  })
  .get(async (req, res, next) =>{
    try {
      const SucessResult = await User.find().exec()
      res.json(SucessResult)
    
    } catch(err) {
      return next(err)
    }
  })




  // POST EXERCISE
app.route('/api/users/:_id/exercises')
  .post( (req, res, next) => 
    getUsername(req, res, next),
    async (req, res) => {    
      console.log("REQUEST________:", req.body)
      try {
        let newExercise = new Exercise(
          {
            username: req.username,
            description: req.body.description,
            duration: req.body.duration,
            date: !isNaN(new Date(req.body.date)) ? new Date(req.body.date).toISOString() : new Date().toISOString()
          })
          await newExercise.save()
          res.json({
            _id: req.params._id,
            username: newExercise.username,
            description: newExercise.description,
            duration: newExercise.duration,
            date: new Date(newExercise.date).toDateString()
          })
      } catch(err) {
        console.log("m2 err", err);
      }
  })

app.get('/api/users/:_id/logs',(req, res, next) => 
  getUsername(req, res, next),

  async (req, res) => {
    // Query items
    const {to, from, limit} = req.query
    const username = req.username
    
    // FILTER
    let filter = { username: username }  
    let dateQuery = {}
    from ? dateQuery["$gte"] = new Date(from) : null
    to ? dateQuery["$lte"] = new Date(to): null
    to || from ? filter.date = dateQuery : 0

    let log = await Exercise
      .find(
        filter
        )
      .limit(limit)
      .exec()
    
    editedLog = log.map((item ) => {
      return {
        description: item.description,
        duration: item.duration,
        date: new Date(item.date).toDateString()
      }
    })

    const result =
    {
      username: req.username,
      _id: req.params._id,
      count: [...log].length,
      log: [...editedLog] 
    }
    
    console.log("Result__________:",result)
    res.json(result)
  }
)






 



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
