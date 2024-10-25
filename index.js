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
    date: Date,
})
const LogModelSchema = new Schema({
    username: String,
    count: Number,
    log: [LogSchema]
})

/** ** MODELS */
const User = mongoose.model('User', UserModelSchema)
const Exercise = mongoose.model('Exercise', ExerciseModelSchema)
const Log = mongoose.model('Log', LogModelSchema)


app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

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
  .post(async (req, res, next)=> {
      try {
        let userQuery = await User.findOne({_id: req.params._id})
        req.username = userQuery.username
        
        next()
      }
      catch (err) {
        next("ERROR", err)
      }
      
    }, async (req, res) => {
      
      try {
        let newExercise = new Exercise(
          {
            username: req.username,
            description: req.body.description,
            duration: req.body.duration,
            date: !isNaN(new Date(req.body.date)) ? new Date(req.body.date) : new Date()
            
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

  
  




  const excercise = new Exercise({
    username: "fcc_test",
    description: "test",
    duration: 59,
    date: new Date("Mon Jan 01 1990").toDateString(),
  })

  // excercise.save().then(() => console.log('phew'));
  






app.get('/exercises/', async (req, res, next) =>{
  try {
    const SucessResult = await Exercise.find().exec()
    console.log(SucessResult)
    res.json(SucessResult)
  
  } catch(err) {
    return next(err)
  }
 })



 



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
