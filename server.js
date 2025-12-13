require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Aqui é a mágica: cada usuário tem seu próprio histórico
const historicos = new Map();

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Mensagem de boas-vindas
  socket.emit('resposta', 'Olá! Eu sou a <strong>Clara</strong>, assistente virtual da Quality Company. Como posso ajudar você hoje?');

  // Cria histórico vazio para esse socket
  historicos.set(socket.id, [
    { role: "system", content: require('./system-prompt.js') }
  ]);

  socket.on('mensagem', async (msg) => {
    const conversa = historicos.get(socket.id);

    // Adiciona a mensagem do usuário no histórico
    conversa.push({ role: "user", content: msg });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversa,
        temperature: 0.7,
        max_tokens: 600
      });

      const resposta = response.choices[0].message.content;

      // Salva a resposta da Clara no histórico também
      conversa.push({ role: "assistant", content: resposta });

      socket.emit('resposta', resposta);
    } catch (erro) {
      socket.emit('resposta', "Desculpe, tive um probleminha técnico. Pode repetir?");
      console.log(erro.message);
    }
  });

  socket.on('disconnect', () => {
    historicos.delete(socket.id);
    console.log('Cliente desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\nChatbot da Quality Company rodando na porta ${PORT}`);
  console.log(`Acesse → http://localhost:${PORT}`);
});