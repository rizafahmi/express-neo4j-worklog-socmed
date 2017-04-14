const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const neo4j = require('neo4j-driver').v1

const index = require('./routes/index')

const app = express()

// view engine setup
hbs.registerPartials(path.join(__dirname, '/views/partials'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const driver = neo4j.driver('bolt://localhost')
const session = driver.session()

// Constraint creator
session.run('CREATE CONSTRAINT ON (n:User) ASSERT n.username IS UNIQUE')
  .then((result) => {
    console.log('Constraint for User created.')
    session.close()
  })
  .catch(error => {
    console.log(error)
  })
session.run('CREATE CONSTRAINT ON (n:Post) ASSERT n.id IS UNIQUE')
  .then((result) => {
    console.log('Constraint for Post created.')
    session.close()
  })
  .catch(error => {
    console.log(error)
  })
session.run('CREATE CONSTRAINT ON (n:Tag) ASSERT n.name IS UNIQUE')
  .then((result) => {
    console.log('Constraint for Tag created.')
    session.close()
  })
  .catch(error => {
    console.log(error)
  })

app.use('/', index)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
