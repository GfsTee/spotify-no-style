require('dotenv').config()
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'))
app.set('view engine', 'ejs')

// credentials are optional
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/artist-search', (req, res) => {
    // console.log(req.query)
    spotifyApi
        .searchArtists(req.query.mySearch)
        .then(data => {
            // console.log('The received data from the API: ', data.body);
            res.render('artist-search-results', { searchResult: data.body.artists.items })
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})
app.get('/albums/:artistID/:offset', (req, res) => {
    console.log(req.params);
    spotifyApi.getArtistAlbums(req.params.artistID, { limit: 20, offset: req.params.offset * 20 },).then(
        (data) => {
            // console.log('Artist albums', data.body);
            res.render('albums', { albums: data.body, site: (req.params.offset * 1) + 1 })
        },
        (err) => {
            console.error(err);
        }
    );
})
app.get('/tracks/:id', (req, res) => {
    console.log(req.params.id)
    spotifyApi.getAlbumTracks(req.params.id, { limit: 10, offset: 0 })
        .then((data) => {
            // console.log(data.body);
            res.render('tracks', { tracks: data.body.items })
        }, (err) => {
            console.log('Something went wrong!', err);
        });

})


app.listen(PORT, () => console.log(`http://localhost:${PORT}`))