require('dotenv').config() //allows use of process.env with variables from .env file
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const movies = require('./movies.json') //movie data

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())


app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(400).json({error: 'Unauthorized request'})
    }
    next()
})

//handler function
function handleGetMovie(req, res){
    const { genre, country, avg_vote } = req.query;
    let response = movies;

    //filter for genre by query parameter
    if(genre){
        response = response.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase())
        )}

    //filter for country by query parameter
    if(country){
        response = response.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()))
    }

    //filter for avg_vote greater than or equal to query parameter
    if(avg_vote){
        const vote = parseFloat(avg_vote)
        response = response.filter(movie => movie.avg_vote >= vote)
    }

    res.json(response)
}

app.get('/movie', handleGetMovie)

//error handler (4 parameters)
app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production'){
        respone = { error: {message: 'server error'}}
    } else {
        response = {error}
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000
const host = process.env.YOUR_HOST || '0.0.0.0'

app.listen(PORT, host, () => {
    console.log(`Server listening`)
})
