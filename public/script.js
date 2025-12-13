const socket = io();

const botao = document.getElementById('botao-flutuante');
const chat = document.getElementById('chat-container');
const fechar = document.getElementById('fechar');
const mensagens = document.getElementById('chat-mensagens');
const input = document.getElementById('mensagem');
const enviar = document.getElementById('enviar');

botao.onclick = () => chat.style.display = 'flex';
fechar.onclick = () => chat.style.display = 'none';

function addMensagem(texto, quem) {
  const div = document.createElement('div');
  div.className = 'mensagem ' + quem;
  div.innerHTML = `<span class="texto">${texto}</span>`;
  mensagens.appendChild(div);
  mensagens.scrollTop = mensagens.scrollHeight;
}

enviar.onclick = () => mandar();
input.addEventListener('keypress', e => { if(e.key==='Enter') mandar(); });

function mandar() {
  const texto = input.value.trim();
  if(!texto) return;
  addMensagem(texto, 'eu');
  socket.emit('mensagem', texto);
  input.value = '';
}

socket.on('resposta', (texto) => {
  addMensagem(texto, 'clara');
});