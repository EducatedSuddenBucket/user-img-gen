const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

registerFont(path.join(__dirname, 'font.ttf'), { family: 'NotoSans' });
const app = express();
const PORT = 3001;

app.get('/generate', async (req, res) => {
  const username = req.query.username || 'EducatedSuddenBucket';
  const avatar = req.query.avatar || 'default.png'; // Can be a local file or URL

  const width = 1920;
  const height = 512;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load background image (local)
  const bgImage = await loadImage(path.join(__dirname, 'b.png'));
  ctx.drawImage(bgImage, 0, 0, width, height);

  // Load avatar image (URL or local)
  let avatarImageBuffer;

  try {
    if (/^https?:\/\//.test(avatar)) {
      // Remote URL
      const response = await axios.get(avatar, { responseType: 'arraybuffer' });
      avatarImageBuffer = Buffer.from(response.data, 'binary');
    } else {
      // Local file
      avatarImageBuffer = fs.readFileSync(path.join(__dirname, avatar));
    }

    const avatarImage = await loadImage(avatarImageBuffer);
    const avatarSize = 400;
    const avatarX = 50;
    const avatarY = (height - avatarSize) / 2;

    // Draw circular avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error('Failed to load avatar:', error.message);
  }

  // Draw username
  ctx.font = 'bold 80px NotoSans';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(username, 500, height / 2 + 30);

  // Send PNG image response
  res.setHeader('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/generate`);
});
