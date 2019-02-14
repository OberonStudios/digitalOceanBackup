const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
// ml-project
const multer = require('multer');
const bodyParser = require('body-parser');
const ps = require('python-shell');
// ws
const expressWs = require('express-ws')(app);
const request = require('request');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Static files routs
app.use('/', express.static(path.join(__dirname, '/')));
// ml-project
app.use('/showroom/', express.static(path.join(__dirname, '/showroom/avatar_cropper/static')));
app.use('/media/', express.static(path.join(__dirname, '/showroom/avatar_cropper/media')));


app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req);
});


var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// tendermint metrics json
app.get('/tendermint_json', cors(), function(req, res) {
  res.sendFile(path.join(__dirname + '/tendermint_data.json'));
});

app.get('/projects', cors(), function(req, res) {
  res.sendFile(path.join(__dirname + '/projects.json'));
});


let videos = {};

const getVideos = (url, callback) => {
  videos = {};
  request(url, function (error, response, body) {
    body.match(/\?v=.{11}/g).forEach(query => {
      videos[query.replace('?v=','')] = `https://www.youtube.com/watch?v=${query.replace('?v=','')}`;
    });
    callback();
  });
};

app.get('/api/test', cors(),(req, res) => {
  getVideos(`https://youtube.com/results?search_query=${req.query.q.replace(' ','+')}`, ()=> {
    res.send(videos);
  });
});

app.get('/api/test2', cors(),(req, res) => {
  let youtubedl = require('youtube-dl');
  let url = `http://www.youtube.com/watch?v=${req.query.q.replace(' ','+')}`;
  youtubedl.getInfo(url, function(err, info) {
    if (err) throw err;
      res.send(JSON.parse(`{"id": "${info.id}", "title": "${info.title}", "url": "${info.url}", "thumbnail": "${info.thumbnail}"}`));
  });
});

app.get('/marvin', cors(),(req, res) => {
  let url = `https://www.urbandictionary.com/define.php?term=${req.query.q.replace(/ /g,'+')}`;
  request(url, function(err, response, body) {
    if (err) throw err;
    console.log(body);

    let div_regex = /<div class="meaning">(.*?)<\/div>/g;
    let msg = body.match(div_regex);

    if (msg === null) {
      res.send(`No result for query ${req.query.q.replace(/ /g,'+')}`);
    } else {
      let elem_regex = /<(.*?)>/g;
      let sym_regex = /&(.*?);/g;
      res.send(msg[0].replace(elem_regex, "").replace(sym_regex, ""));
    }
  });
});



// ml-app
// Multer config
const multerConfig = {
  storage: multer.diskStorage({
    // Set destination
    destination: function(req, file, next){
      next(null, path.join(__dirname,'/showroom/avatar_cropper/media'));
    },

    // Set filename
    // Use timesignature
    filename: function(req, file, next){
      // Get files mimetype ie 'image/jpeg'
      const ext = file.mimetype.split('/')[1];
      // Timesign
      next(null, file.fieldname + '-' + Date.now() + '.'+ext);
    }
  }),

  // Filter files
  fileFilter: function(req, file, next){
    if(!file){
      next();
    }
    const image = file.mimetype.startsWith('image/');
    if(image){
      console.log('photo uploaded');
      next(null, true);
    } else {
      console.log("file not supported")
      return next();
    }
  }
};


app.post('/upload', multer(multerConfig).single('photo'), async function(req, res){
    // Get pic name
    let pic_url = req.file.filename
    // Python shell config
    let options = {
      args: [pic_url],
      pythonPath: 'python3'
    };

    try {
      await ps.PythonShell.run(path.join(__dirname,'/showroom/avatar_cropper/ml.py'), options, function (err) {
        if (err) throw err;
        res.render(path.join(__dirname,'/showroom/avatar_cropper/static/profile.ejs'), {pic_url: pic_url});
      });
    } catch(e){
      console.log(e);
    }
});


app.listen(3000);
