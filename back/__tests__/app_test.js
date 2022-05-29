const request = require('supertest')
const app = require('../app')

describe('get dogs ', () => {
    it('should get all dog data ', async () => {
        const res = await request(app).get('/dog')
        console.log(res.body)
        expect(res.body).toEqual(expect.anything())
    })
});

describe('delete dogs by id with workers access ', () => {
    it('should delete dog data and return the string to confirm', async () => {
        const token = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTM2Mzk3MTZ9.6cCI2Zc-4Cc16Za-vqfUAQllHMYZpanbaCnVkcYSqqI'
        const res = await request(app).delete('/dog/1').send({id:'1'}).set('Authorization', token) 
        console.log(res.text)
        expect(res.text).toEqual('The dog with the record id: 1 has been removed.')
    })
});

describe('delete dogs by id with workers access but with no access token ', () => {
    it('should return a 401 code', async () => {
        const token = 'Bearer ' + ''
        const res = await request(app).delete('/dog/1').send({id:'1'}).set('Authorization', token) 
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(401)
    })
});

describe('get dogs by id with workers access but sent the wrong id ', () => {
    it('should return a 403 code', async () => {
        const token = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTM2Mzk3MTZ9.6cCI2Zc-4Cc16Za-vqfUAQllHMYZpanbaCnVkcYSqqI'
        const res = await request(app).get('worker/dog/1').send({id:'99'}).set('Authorization', token) 
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(403)
    })
});

describe('register a worker account with correct info', () => {
    it('should return a 200 code', async () => {
        const res = await request(app).post('/worker').send({name: "Test Name", age: "99", sex: "Male", email: "Test@gmail.com", password: "asdasd", signup_code: "1234"}) 
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(200)
    })
});

describe('register a worker account with no info sent to the server', () => {
    it('should return a 404 code', async () => {
        const res = await request(app).post('/worker')
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(404)
    })
});

describe('login a worker account with correct email and password data', () => {
    it('should return an access token', async () => {
        const res = await request(app).post('/login').send({email: 'junkmailtaker646@gmail.com', password: 'asdasd'})
        console.log(res.body)
        // The hashing token value will slight change each time the verification process is called
        // Making the comparision of two value not do-able.
        expect(res.body.accessToken).toEqual(expect.anything())
    })
});

describe('login a worker account with correct wrong email and password data', () => {
    it('should return a 404 status code', async () => {
        const res = await request(app).post('/login').send({password: 'asdassssssssd'})
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(404)
    })
});