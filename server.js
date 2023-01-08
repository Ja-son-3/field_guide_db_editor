// Required Dependencies
const express = require('express')
const { allowedNodeEnvironmentFlags } = require('process')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8005
require('dotenv').config()

//Declared DB variables
let db,
    dbConnectionStr = process.env.DB_STRING
    dbName = 'star-trek-api'


//Connect to Mongodb
MongoClient.connect(dbConnectionStr)
    .then(client=> {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })


//Set Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', (request,response) => {
    db.collection('alien-info').find().toArray()
        .then(data => {
            let nameList = data.map(item => item.speciesName)
            console.log(nameList)
            response.render('index.ejs', {info: nameList})
        })
        .catch(error => console.log(error))
})

app.post('/api', (request,response) => {
    console.log('Post Heard')
    db.collection('alien-info').insertOne(
        request.body
    )
    .then(result => {
        console.log(result)
        response.redirect('/')
    })
})

app.put('/updateEntry', (request,response) => {
    console.log(request.body)
    Object.keys(request.body).forEach(key => {
        if (request.body[key] === null || request.body[key] === undefined || request.body[key] === '') {
            delete request.body[key]
        }
    })
    console.log(request.body)
    db.collection('alien-info').findOneAndUpdate(
        {name: request.body.name},
        {
            $set:request.body
        }
    )
    .then(result => {
        console.log(result)
        response.json('Success')
    })
    .catch(error => console.log(error))
})

app.delete('/deleteEntry', (request,response) => {
    db.collection('alien-info').deleteOne(
        {name: request.body.name}
    )
    .then(result => {
        console.log('Entry Deleted')
        response.json('Entry Deleted')
    })
    .catch(error => console.error(error))
})

//Setup local host
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})