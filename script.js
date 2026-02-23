let cart = [];
const cartModal = document.getElementById("cart-modal");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.querySelector(".close");
const orderForm = document.getElementById("order-form");
const cartCount = document.getElementById("cart-count");
const pagamentoSelect = document.getElementById("pagamento");
const trocoContainer = document.getElementById("troco-container");
const successMessage = document.getElementById("success-message");

// ABRIR/FECHAR MODAL
openCartBtn.addEventListener("click", () => cartModal.style.display = "flex");
closeCartBtn.addEventListener("click", () => cartModal.style.display = "none");

// MOSTRAR TROCO SE FOR DINHEIRO
pagamentoSelect.addEventListener("change", (e) => {
    trocoContainer.style.display = e.target.value === "dinheiro" ? "flex" : "none";
});

// ADICIONAR AO CARRINHO
document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
        const itemContainer = button.closest(".cardapio-item");
        const name = itemContainer.querySelector("h2").innerText;
        const price = itemContainer.querySelector(".preco").innerText;

        cart.push({ name, price });
        cartCount.innerText = cart.length;

        // Feedback no botão
        const originalText = button.innerText;
        button.innerText = "ADICIONADO!";
        setTimeout(() => button.innerText = originalText, 1000);
    });
});

// FINALIZAR PEDIDO
orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Carrinho vazio!");
        return;
    }

    // Calcular total para enviar ao servidor
    const totalSoma = cart.reduce((acc, item) => {
        const preco = parseFloat(item.price.replace('R$', '').replace(',', '.').trim());
        return acc + preco;
    }, 0);

    const btnConcluir = orderForm.querySelector(".btn-finalizar");
    btnConcluir.disabled = true;
    btnConcluir.innerText = "ENVIANDO...";

    const dadosPedido = {
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco").value,
        pagamento: document.getElementById("pagamento").value,
        troco: document.getElementById("troco").value || "0",
        total: `R$ ${totalSoma.toFixed(2).replace('.', ',')}`,
        itens: cart
    };

    try {
        const response = await fetch("http://localhost:3000/novo-pedido", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosPedido)
        });

        if (response.ok) {
            orderForm.style.display = "none";
            successMessage.style.display = "block";
            cart = [];
            cartCount.innerText = "0";
            setTimeout(() => location.reload(), 4000);
        } else {
            alert("Erro ao enviar.");
            btnConcluir.disabled = false;
        }
    } catch (error) {
        alert("Servidor desligado!");
        btnConcluir.disabled = false;
    }
});