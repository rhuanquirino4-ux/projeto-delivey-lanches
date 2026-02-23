require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Bot do Telegram
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Contador de Pedidos (Gera o número do pedido)
let contadorPedido = 1;

// Conexão com Banco de Dados (Protegida)
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log("✅ Banco de Dados conectado!"))
    .catch(err => console.log("⚠️ Banco Offline, mas o bot funcionará!"));

// ROTA DE PEDIDO
app.post('/novo-pedido', async (req, res) => {
    try {
        const { nome, telefone, endereco, pagamento, troco, total, itens } = req.body;
        const numeroPedido = contadorPedido++;

        // 1. Limpar e converter os valores para cálculo
        // Remove "R$", espaços e troca vírgula por ponto
        const valorTotalNum = parseFloat(total.replace('R$', '').replace(',', '.').trim());
        const trocoParaNum = parseFloat(troco.replace('R$', '').replace(',', '.').trim());

        let textoFinanceiro = "";

        if (pagamento === "dinheiro" && !isNaN(trocoParaNum) && trocoParaNum > valorTotalNum) {
            const valorDoTroco = trocoParaNum - valorTotalNum;
            textoFinanceiro = `💰 *Total:* R$ ${valorTotalNum.toFixed(2).replace('.', ',')}\n` +
                              `💵 *Troco para:* R$ ${trocoParaNum.toFixed(2).replace('.', ',')}\n` +
                              `🏧 *Levar de troco:* R$ ${valorDoTroco.toFixed(2).replace('.', ',')}`;
        } else {
            textoFinanceiro = `💰 *Total:* R$ ${valorTotalNum.toFixed(2).replace('.', ',')}\n` +
                              `💳 *Pagamento:* ${pagamento.toUpperCase()}`;
        }

        // 2. Montar a lista de itens
        const listaItens = itens.map(item => `• ${item.name} (${item.price})`).join('\n');

        // 3. Mensagem para o Telegram
        const mensagem = `🎫 *PEDIDO #${numeroPedido}* \n` +
            `--------------------------\n` +
            `👤 *Cliente:* ${nome}\n` +
            `📞 *Telefone:* ${telefone}\n` +
            `📍 *Endereço:* ${endereco}\n` +
            `--------------------------\n` +
            `🛒 *ITENS:*\n${listaItens}\n` +
            `--------------------------\n` +
            `${textoFinanceiro}\n` +
            `--------------------------`;

        await bot.sendMessage(process.env.CHAT_ID_DONO, mensagem, { parse_mode: 'Markdown' });

        res.status(200).json({ success: true, numero: numeroPedido });
        console.log(`✅ Pedido #${numeroPedido} enviado com sucesso!`);

    } catch (error) {
        console.error("❌ Erro no servidor:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});