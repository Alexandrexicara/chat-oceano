import express from 'express';
import multer from 'multer';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.send('Arquivo enviado com sucesso!');
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});