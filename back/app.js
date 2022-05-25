if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()
var crypto = require('crypto');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const connectDb = mysql.createPool({connectionLimit: 10, host : 'localhost', user : 'root', password : '', database : 'web_api'})

// Get all the records of the dogs
app.get('/dog', (req, res)=> {
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        connection.query('SELECT * FROM dog', (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})


// Add a new dog record
app.post('/dog', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const params = req.body

        connection.query('INSERT INTO dog SET ?', params, (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(`The dog record with the name: ${[params.name]} has been added.`)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Delete the correct dog record using id
app.delete('/dog/:id', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        connection.query('DELETE FROM dog WHERE id = ?', [req.params.id], (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(`dog with the record id:${[req.params.id]} has been removed.`)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Update the correct dog record using id
app.put('/dog/:id', authenticateToken,(req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const { id, name, age, sex, breed, location, image } = req.body

        connection.query('UPDATE dog SET name = ?, age = ?, sex = ?, breed = ?, location = ?, image = ? WHERE id = ?', [name, age, sex, breed, location, image, id], (err, rows)=>{
            connection.release()    

            if(!err) {
                res.send(`The dog record with the name: ${[name]} has been updated.`)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})


// Filter to get the dog record by breed
app.get('/dog/breed/:breed', (req, res)=> {
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        connection.query('SELECT * FROM dog WHERE breed = ? ', [req.params.breed], (err, rows)=>{
            connection.release()    
            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Filter to get the dog record by age
app.get('/dog/age/:age', (req, res)=> {
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        connection.query('SELECT * FROM dog WHERE age = ? ', [req.params.age], (err, rows)=>{
            connection.release()   
            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Filter to get the dog record by location
app.get('/dog/location/:location', (req, res)=> {
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        connection.query('SELECT * FROM dog WHERE location = ? ', [req.params.location], (err, rows)=>{
            connection.release()    
            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Get the correct dog record by id by only workers can call the api
app.get('/worker/dog/:id', authenticateToken, (req, res)=> {
    console.log('tyes')
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        console.log(req.params.id)
        connection.query('SELECT * FROM dog WHERE id = ?', [req.params.id], (err, rows)=>{
            connection.release()    // return the connection to connectDb
            
            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})


//=============================================================================================================================
//=============================================================================================================================
//=============================================================================================================================

//The login that handles workers login
app.post('/login', (req, res) => {

    connectDb.getConnection((err, connection) => {
        if (err) throw err
        const { email, password } = req.body

        const hashed = crypto.createHash('sha512').update(password).digest('hex');

        connection.query('SELECT * FROM worker WHERE email = ? AND password = ?', [email, hashed], (err, rows) => {
            connection.release()    
            if (!err) {
                if (rows.length === 0) {
                    res.send('User Not Found, Please try again.')
                } else {
                    console.log(rows.email)
                    const user = { email: rows.email }
                    const accessToken = generateAccessToken(user)
                    res.json({ accessToken: accessToken })
                }
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Check whether or not the user is a worker
/**
 * 
 * @param {object} req 
 * @param {object} res 
 * @param {object} next 
 * @returns 
 */
function authenticateToken(req, res, next) {
    console.log(req.headers)
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        console.log('123')
        req.user = user
        next()
    })
}

// Create tokens for verifcation of workers
/**
 * 
 * @param {*} user 
 * @returns 
 */
function generateAccessToken(user) {
    return  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}



// *********************************************************************************************************************************************************************

// Get the dog info in the login Page
app.get('/worker/dog', authenticateToken, (req, res)=> {
    console.log('tyes')
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        connection.query('SELECT * FROM dog', (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })
    })
})

// Register a worker account in the database
app.post('/worker', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const params = req.body
        params.password = crypto.createHash('sha512').update(params.password).digest('hex');

        connection.query('INSERT INTO worker SET ?', params, (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.sendStatus(205);
            } else {
                console.log(err)
                res.sendStatus(403)
            }
        })

        console.log(req.body)
    })
    
})

// // get all employee record
// app.get('/worker', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         connection.query('SELECT * FROM worker', (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(rows)
//             } else {
//                 console.log(err)
//                 res.sendStatus(403)
//             }
//         })
//     })
// })

// // get a employee record by id
// app.get('/worker/:id', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         connection.query('SELECT * FROM worker WHERE id = ?', [req.params.id], (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(rows)
//             } else {
//                 console.log(err)
//                 res.sendStatus(403)
//             }
//         })
//     })
// })

// // delete a employee record by id
// app.delete('/worker/:id', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         connection.query('DELETE FROM worker WHERE id = ?', [req.params.id], (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(`worker with the record id:${[req.params.id]} has been removed.`)
//             } else {
//                 console.log(err)
//                 res.sendStatus(403)
//             }
//         })
//     })
// })



app.listen(4000)