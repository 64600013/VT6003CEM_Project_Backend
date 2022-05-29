if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
var crypto = require('crypto');

// The connection to the mySQL database.
const connectDb = mysql.createPool({connectionLimit: 10, host : 'localhost', user : 'root', password : '', database : 'web_api'})


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Restricted to only the frontend port can be allowed o call the APIs
app.use(cors({
    origin: "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

// Swagger OAS details
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Dog Shelter API',
            description: "Dos Shelter API for listing and matching dogs.",
            servers: ["http://localhost:4000/"]
        }
    },
    apis: ["app.js"]
}

// Configuarion for OAS documents
// http://localhost:4000/api-docs/
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// *************************************************************************************************************************** //
//  This path is for all the API that does not require authorized access and for public to call.                               //
//  Contains all the API path for public function.                                                                             //
//                                                                                                                             //
//  All the public get API to retreive dogs record is included in this section.                                                //
//  Used to allow public to view dog data by list and filter dogs by list.                                                      //
//                                                                                                                             //
// *************************************************************************************************************************** //

/**
 * @function /dog/ get
 * @description Get all the dog records.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Object|Status} The record data of all the dogs or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /dog:
 *   get:
 *     description: Get all the dog records. Avaliable for all users to use.
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       'rows':
 *         description: The dog records in the database.
 *     tags:
 *       - Public
 */
app.get('/dog', (req, res)=> {
    var process = false 

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)

        connection.query('SELECT * FROM dog', (error, rows)=>{
            connection.release()    
            if(!error) {
                res.send(rows)
            } else {
                console.log(error)
                res.sendStatus(403)
            }
        })
    })
})

/**
 * @function /dog/breed/:breed get
 * @description Filter the breed name to get the dog record by breed.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Object|Status} The record data of the corresponding dog or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /dog/breed/{breed}:
 *   get:
 *     description: Filter the breed name to get the dog record by breed.
 *     parameters:
 *       - in: path
 *         name: breed
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the data return is empty.
 *       'rows':
 *         description: The dog record in the database.
 *     tags:
 *      - Public
 */
app.get('/dog/breed/:breed', (req, res)=> {
    var process = false 

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)

        const check = checkValid(req.params.breed)
        if (check){
            connection.query('SELECT * FROM dog WHERE breed = ? ', [req.params.breed], (error, rows)=>{
                connection.release()    
                if(!error) {
                    console.log(rows)
                    const check = checkObject(rows)
                    if(check){
                        res.sendStatus(404)
                    } else {
                        res.send(rows)
                    }
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }
    })
})

/**
 * @function /dog/age/:age get
 * @description Filter the age to get the dog record by age.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Object|Status} The record data of the corresponding dog or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /dog/age/{age}:
 *   get:
 *     description: Filter the age name to get the dog record by age.
 *     parameters:
 *       - in: path
 *         name: age
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: age
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the data return is empty.
 *       'rows':
 *         description: The dog record in the database.
 *     tags:
 *       - Public
 */
app.get('/dog/age/:age', (req, res)=> {
    var process = false 

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)

        const check = checkValid(req.params.age)
        if (check){
            connection.query('SELECT * FROM dog WHERE age = ? ', [req.params.age], (error, rows)=>{
                connection.release()   
                if(!error) {
                    console.log(rows)
                    const check = checkObject(rows)
                    if(check){
                        res.sendStatus(404)
                    } else {
                        res.send(rows)
                    }
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }
    })
})

/**
 * @function /dog/location/:location get
 * @description Filter the location name to get the dog record by location.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Object|Status} The record data of the corresponding dog or a 403 status code to tell the call failed.
 * 
 */
 /**
 * @swagger
 * /dog/location/{location}:
 *   get:
 *     description: Filter the location name to get the dog record by location.
 *     parameters:
 *       - in: path
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the data return is empty.
 *       'rows':
 *         description: The dog record in the database.
 *     tags:
 *       - Public
 */
app.get('/dog/location/:location', (req, res)=> {
    var process = false 

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)

        const check = checkValid(req.params.location)
        if (check){
            connection.query('SELECT * FROM dog WHERE location = ? ', [req.params.location], (error, rows)=>{
                connection.release()    
                if(!error) {
                    console.log(rows)
                    const check = checkObject(rows)
                    if(check){
                        res.sendStatus(404)
                    } else {
                        res.send(rows)
                    }
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }else{
            console.log('error with data')             
        }
    })
})



// *************************************************************************************************************************** //
//  This path is for the authentication API that handles the authorization required in the worker related APIs.                //
//  Prevent the API being used by non-registered users.                                                                        //
//  Contains all the API path and function for the JWT functionaility.                                                         //
//                                                                                                                             //
//  The login API is included in this section.                                                                                 //
//  And also the function and API responible for handling JWT is include in this section.                                      //
//                                                                                                                             //
// *************************************************************************************************************************** //

/**
 * @function /login/ post
 * @description Handles login request of the workers.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {String|JSON|Status} A message to tell the worker account is not found, 
 * JSON data if the account is found, or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /login:
 *   post:
 *     description: Handles login request of the workers. Generate access tokens for workers.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the data inputted is empty.
 *       'accessToken':
 *         description: The access token string generated to authenticate worker's access.
 *     tags:
 *       - Auth
 */
app.post('/login', (req, res) => {
    var process = false 

    connectDb.getConnection((error, connection) => {
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)
        
        // Get the account info passed from the frontend and hashed the password value.
        const { email, password } = req.body
        console.log(password)
        const hashed = crypto.createHash('sha512').update(password).digest('hex');

        const check = checkValid(hashed)
        const checkTwo = checkValid(email)
        if (check && checkTwo){
            connection.query('SELECT * FROM worker WHERE email = ? AND password = ?', [email, hashed], (error, rows) => {
                connection.release()    
                if (!error) {
                    if (rows.length === 0) {
                        res.send('User Not Found, please try again.')
                    } else {
                        // Generate a access token for user using email if the user is found in the database.
                        const user = { email: rows.email }
                        const accessToken = generateToken(user)
                        res.json({ accessToken: accessToken })
                    }
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }else{
            console.log('error with data')  
            res.sendStatus(404)           
        }
    })
})

/**
 * @swagger
 * /checkToken:
 *   get:
 *     description: Check if the user have a accesToken.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '404':
 *         description: Error status code if the authenticate process failed.
 *       '200':
 *         description: The successful status code if the authenticate process passed.
 *     tags:
 *       - Auth
 */
app.get('/checkToken', authenticateToken, (req, res)=> {
    res.sendStatus(200)
})

/**
 * Check whether or not the user is a worker by checking the token.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @param {Object} next Callback function to process to the next function.
 * @returns {Status} A 403 or 401 status code to notify an error occur if an error is called.
 */

function authenticateToken(req, res, next) {
    console.log(req.headers)

    // Get the access token save in the header passed from the frontend.
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)

    if (token == null) {
        return res.sendStatus(401)
    }else{

    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.sendStatus(403)
        }else{

        }
        console.log('Verify Success')
        req.user = user
        next()
    })
}

/**
 * Create verifcation token for of workers accounts.
 * @param {String} user The worker account info for hashing.
 * @returns {String} The hashed token value.
 */
function generateToken(user) {
    return  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}



// *************************************************************************************************************************** //
//  This path is for all the API that requires authorized access to call or API that related to workers.                       //
//  Contains all the API path for workers function.                                                                            //
//                                                                                                                             //
//  The CRUD path (GET, POST, UPDATE, PUT) for dogs is combined in this section.                                               //
//  While the register workers function is also in the section.                                                                //
//                                                                                                                             //
// *************************************************************************************************************************** //

/**
 * @function /worker/dog/ get
 * @description Get all the dog records, but only workers can call.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Object|Status} The record data of all the dogs or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /worker/dog:
 *   get:
 *     description: Get all the dog records, but only workers can call.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       'rows':
 *         description: The dog records in the database.
 *     tags:
 *       - Workers
 */
app.get('/worker/dog', authenticateToken, (req, res)=> {
    var process = false

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)
        
        connection.query('SELECT * FROM dog', (error, rows)=>{
            connection.release()    
            if(!error) {
                res.send(rows)
            } else {
                console.log(error)
                res.sendStatus(403)
            }
        })
    })
})

/**
 * @function /worker/ post
 * @description Register a worker account in the database and hash the password.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Status} A 205 status code to tell the call is successful or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /worker:
 *   post:
 *     description: Register a worker account in the database and hash the password beofre it is stored.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: age
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: sex
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: signup_code
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the sql query went wrong.
 *       '404':
 *         description: Error status code if the the data inputted from the frontend is empty.
 *       '200':
 *         description: The successful status code if the query is sucessful.
 *     tags:
 *       - Workers
 */
app.post('/worker', (req, res)=> {
    var process = false

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)

        // Get the account info passed from the frontend and hashed the password value.
        const params = req.body
        console.log(params)

        const check = checkValid(params.password)
        if(check){
            params.password = crypto.createHash('sha512').update(params.password).digest('hex');
            const checkTwo = checkValid(params)
            if (checkTwo){
                connection.query('INSERT INTO worker SET ?', params, (error, rows)=>{
                    connection.release()    
                    if(!error) {
                        res.sendStatus(200);
                    } else {
                        console.log(error)
                        res.sendStatus(403)
                    }
                })
            }else{
                console.log('error with data')  
                res.sendStatus(404)           
            }
        }else{
            console.log('error with data') 
            res.sendStatus(404)
        }
    })
})

/**
 * @function /worker/dog/:id get
 * @description Get the correct dog record by id,but only workers can call the API.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {Object|Status} The record data of the corresponding dog or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /worker/dog/{id}:
 *   get:
 *     description: Get the correct dog record by id, but only workers can call the API and search dogs.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the the data inputted from the frontend is empty.
 *       'rows':
 *         description: The dog record in the database.
 *     tags:
 *       - Workers
 */
app.get('/worker/dog/:id', authenticateToken, (req, res)=> {
    var process = false

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)

        const check = checkValid(req.params.id)
        console.log(req.params.id)
        if (check){
            connection.query('SELECT * FROM dog WHERE id = ?', [req.params.id], (error, rows)=>{
                connection.release()   
                if(!error) {
                    console.log(rows)
                    const check = checkObject(rows)
                    if(check){
                        res.sendStatus(404)
                    } else {
                        res.send(rows)
                    }
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }else{
            console.log('error with data')
            res.sendStatus(404)             
        }
    })
})

/**
 * @function /dog/ post
 * @description Add a new dog record using the data inputted in the frontend.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {String|Status} The message to notify worker that the call is successful and the record is added or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /dog:
 *   post:
 *     description: Add a new dog record using the data inputted in the frontend.
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: age
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: sex
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: image
 *         schema:
 *           type: string
 *         required: true
 *         allowReserved: true
 *     responses:
 *       'string':
 *         description: The successful string message if the query is sucessful and the dog record is added.
 *       '403':
 *         description: Error status code if the sql query went wrong.
 *     tags:
 *       - Workers
 */
app.post('/dog', authenticateToken, (req, res)=> {
    var process = false

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)
        
        const params = req.body

        const check = checkValid(params)
        if (check){
            connection.query('INSERT INTO dog SET ?', params, (error, rows)=>{
                connection.release()    
                if(!error) {
                    res.send(`The dog record with the name: ${[params.name]} has been added.`)
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }
    })
})

/**
 * @function /dog/:id delete
 * @description Delete the correct dog record using id value passed in the frontend.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {String|Status} The message to notify worker that the call is successful and the record is deleted or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /dog/{id}:
 *   delete:
 *     description: Delete the correct dog record using id value passed in the frontend, but only workers can call the API.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the the data inputted from the frontend is empty.
 *       'string':
 *         description: The successful string message if the query is sucessful and the dog record is deleted.
 *     tags:
 *       - Workers
 */
app.delete('/dog/:id', authenticateToken , (req, res)=> { 
    var process = false

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)
        
        const check = checkValid(req.params.id)
        if (check){
            connection.query('DELETE FROM dog WHERE id = ?', [req.params.id], (error, rows)=>{
                connection.release()    
                if(!error) {
                    console.log('true')
                    res.send(`The dog with the record id: ${[req.params.id]} has been removed.`)
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }else{
            console.log('error with data')  
            res.sendStatus(404)           
        }
    })
})

/**
 * @function /dog/:id put
 * @description Update the correct dog record using id value passed in the frontend.
 * @param {Object} req The request data passed from frontend.
 * @param {Object} res The response data waiting to be passed to frontend.
 * @returns {String|Status} The message to notify worker that the call is successful and the record is updated or a 403 status code to tell the call failed.
 * 
 */
/**
 * @swagger
 * /dog/{id}:
 *   put:
 *     description: Find the correct dog record using id value and update the dog record details passed in the frontend , but only workers can call the API.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: age
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: sex
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         allowReserved: true
 *       - in: query
 *         name: image
 *         schema:
 *           type: string
 *         required: true
 *         allowReserved: true
 *     responses:
 *       '403':
 *         description: Error status code if the query went wrong.
 *       '404':
 *         description: Error status code if the the data inputted from the frontend is empty.
 *       'string':
 *         description: The successful string message if the query is sucessful and the dog record is updated.
 *     tags:
 *       - Workers
 */
app.put('/dog/:id', authenticateToken ,(req, res)=> {
    var process = false 

    connectDb.getConnection((error, connection)=>{
        if(error) {
            throw error
        } else {
            process = true
        }
        console.log(`process : ${process}`)
        
        const { id, name, age, sex, breed, location, image } = req.body

        console.log(id)
        console.log(name)
        const check = checkValid(req.body)
        if (check){
            connection.query('UPDATE dog SET name = ?, age = ?, sex = ?, breed = ?, location = ?, image = ? WHERE id = ?', [name, age, sex, breed, location, image, id], (error, rows)=>{
                connection.release()    
                if(!error) {
                    res.send(`The dog record with the name: ${[name]} has been updated.`)
                } else {
                    console.log(error)
                    res.sendStatus(403)
                }
            })
        }else{
            console.log('error with data')     
            res.sendStatus(404)        
        }
    })
})

/**
 * Check the data value passed through is vaild or not, and should not be null or undefined.
 * @param {Object} data The data value to verify is not null or undefined.
 * @returns {Boolean} The reponse boolean to tell the result.
 */
function checkValid(data){
    result = true
    if(data === null || data === undefined){
        result = false
    }
    return result
}

/**
 * Check the object data value passed through is empty or not.
 * @param {Object} data The Object data that wanted to check.
 * @returns {Boolean} The reponse boolean to tell the result, true if empty or false is not empty.
 */
function checkObject(data){
    result = false
    if(Object.keys(data).length === 0){
        result = true
    }
    return result
}

module.exports = app.listen(4000)