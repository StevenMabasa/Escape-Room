const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from the current folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));

// Serve index.html for the root path
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/game',(req,res)=>{
  res.sendFile(path.join(__dirname,'public','game.html'));
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
