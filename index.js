const { cloudinary } = require('./utils/cloudinary');
const express = require('express');
const Replicate = require('replicate');
const app = express();
var cors = require('cors');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.get('/', async (req, res) => {
  return res.sendFile(__dirname + '/index.html');
});

app.post('/api/upload', async (req, res) => {
  try {
    const fileStr = req.body.image;
    const scale = req.body.scale;
    const face_enchance = req.body.face_enchance;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'dev_setups',
    });
    const output = await replicate.run('nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b', {
      input: {
        image: uploadResponse.url,
        scale: parseInt(scale),
        face_enchance: face_enchance,
      },
    });
    res.json({ url: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Something went wrong' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on 3000');
});
