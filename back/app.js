if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()
//const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const connectDb = mysql.createPool({connectionLimit: 10, host : 'localhost', user : 'root', password : '', database : 'web_api',})

// get all dog record
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
            }
        })
    })
})

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
            }
        })
    })
})

// get a dog record by id
app.get('/dog/:id', authenticateToken, (req, res)=> {
    console.log('tyes')
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        
        console.log(`connected as id ${connection.threadId}`)
        console.log(req.params.id)
        connection.query('SELECT * FROM dog WHERE id = ?', [req.params.id], (err, rows)=>{
            connection.release()    // return the connection to connectDb
            
            if(!err) {
                //const data = JSON.stringify(rows)
                //const dogInfo = JSON.parse(data)
                //console.log(dogInfo[0].age)
                //res.json({ id: dogInfo[0].age , })
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// update a dog record
app.put('/dog:id', authenticateToken,(req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const { id, name, age, sex, image } = req.body

        connection.query('UPDATE dog SET name = ?, age = ?, sex = ?, image = ? WHERE id = ?', [name, age, sex, image, id], (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(`dog with the record name:${[name]} has been updated.`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})

// delete a dog record by id
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
            }
        })
    })
})

// insert a dog record
app.post('/dog', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const params = req.body

        connection.query('INSERT INTO dog SET ?', params, (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(`dog with the record name:${[params.name]} has been added.`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})


//=============================================================================================================================
//=============================================================================================================================
//=============================================================================================================================

app.post('/login', (req, res) => {

    connectDb.getConnection((err, connection) => {
        if (err) throw err
        const { email, password } = req.body

        connection.query('SELECT * FROM worker WHERE email = ? AND password = ?', [email, password], (err, rows) => {
            connection.release()    
            if (!err) {
                if (rows.length === 0) {
                    res.send('User Not Found, Please try again.')
                } else {
                    console.log(rows.email)
                    const user = { email: rows.email, password: rows.password }

                    const accessToken = generateAccessToken(user)
                    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                    //console.log(accessToken)
                    res.json({ accessToken: accessToken })
                }
            } else {
                console.log(err)
            }
        })
    })
})

// app.post('/login', (req, res) => {
//     const email = req.body.email
//     const password = req.body.password
//     const user = { email: email, password: password }

//     const accessToken =  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '25s' })
//     const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
//     refreshTokens.push(refreshToken)
//     res.json({ accessToken: accessToken , refreshToken: refreshToken})
// })

// app.get('/posts', authenticateToken, (req, res) => {
//     res.json(posts.filter(post => post.email === req.user.email))
// })

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ email: user.email, password: user.password })
        res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function authenticateToken(req, res, next) {
    //console.log(req.data)
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

function generateAccessToken(user) {
    return  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}



// *********************************************************************************************************************************************************************

// get all employee record
app.get('/worker', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        connection.query('SELECT * FROM worker', (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// get a employee record by id
app.get('/worker/:id', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        connection.query('SELECT * FROM worker WHERE id = ?', [req.params.id], (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// delete a employee record by id
app.delete('/worker/:id', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        connection.query('DELETE FROM worker WHERE id = ?', [req.params.id], (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(`worker with the record id:${[req.params.id]} has been removed.`)
            } else {
                console.log(err)
            }
        })
    })
})


// insert a employee record
app.post('/worker', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const params = req.body

        connection.query('INSERT INTO worker SET ?', params, (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.sendStatus(205);
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
    
})

app.get('/worker/login', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const { email, password } = req.body
        
        connection.query('SELECT * FROM worker WHERE email = ? AND password = ?', [email, password], (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(rows)
                res.send("login successful")
            } else {
                console.log("fail login")
            }
        })
    })
})

// update a employee record
app.put('/worker', (req, res)=> {
    
    connectDb.getConnection((err, connection)=>{
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        
        const { id, name, age, sex, image, signup_code } = req.body

        connection.query('UPDATE worker SET name = ?, age = ?, sex = ?, image = ?, signup_code = ? WHERE id = ?', [name, age, sex, image, signup_code, id], (err, rows)=>{
            connection.release()    // return the connection to connectDb

            if(!err) {
                res.send(`worker with the record name:${[name]} has been updated.`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})


// app.post('/login', (req, res, next)=> {
//     console.log("yes") 
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         const { email, password } = req.body
        
//         connection.query('SELECT * FROM worker WHERE email = ? AND password = ?', [email, password], (err, rows)=>{
//             connection.release()    // return the connection to connectDb
//             if(!err) {
//                 const string = JSON.stringify(rows)
//                 const data = JSON.parse(string)
//                 if (users != null){
//                     users.shift()   
//                     console.log("yesssss")        
//                 }
//                 users.push({
//                     id: data[0].id,
//                     email: data[0].email,
//                     password: data[0].password,
//                     signup_code: data[0].signup_code
//                 })

//                 console.log(users)
//             } else {
//                 console.log("fail login")
//             }
//         })
//         console.log('ready to redirect')
//     })

//     // passport.authenticate('local', {
//     //     successRedirect: 'http://localhost:3000/',
//     //     failureRedirect: 'http://localhost:3000/loginPage',
//     //     failureFlash: true
//     // })
//     res.redirect('http://localhost:3000/')
// })

// app.get('/loginPage', (req, res)=> {
//     console.log('222')
//     res.set('Access-Control-Allow-Origin', '*')
//     res.redirect('https://www.twitch.tv/xqc')
// })


// *********************************************************************************************************************************************************************

// get all user record
// app.get('/user', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         connection.query('SELECT * FROM user', (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(rows)
//             } else {
//                 console.log(err)
//             }
//         })
//     })
// })

// // get a user record by id
// app.get('/user/:id', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(rows)
//             } else {
//                 console.log(err)
//             }
//         })
//     })
// })

// // delete a user record by id
// app.delete('/user/:id', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(`user with the record id:${[req.params.id]} has been removed.`)
//             } else {
//                 console.log(err)
//             }
//         })
//     })
// })

// // insert a user record
// app.post('/user', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         const params = req.body

//         connection.query('INSERT INTO user SET ?', params, (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(`user with the record name:${[params.name]} has been added.`)
//             } else {
//                 console.log(err)
//             }
//         })

//         console.log(req.body)
//     })
// })

// // update a user record
// app.put('/user', (req, res)=> {
    
//     connectDb.getConnection((err, connection)=>{
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)
        
//         const { id, name, age, sex, image, worker_id } = req.body

//         connection.query('UPDATE user SET name = ?, age = ?, sex = ?, image = ?, worker_id = ? WHERE id = ?', [name, age, sex, image, worker_id, id], (err, rows)=>{
//             connection.release()    // return the connection to connectDb

//             if(!err) {
//                 res.send(`user with the record name:${[name]} has been updated.`)
//             } else {
//                 console.log(err)
//             }
//         })

//         console.log(req.body)
//     })
// })

app.listen(5000)