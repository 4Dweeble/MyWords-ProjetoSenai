function mostrarMensagem(texto, sucesso = false) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = "auth-mensagem" + (sucesso ? " sucesso" : "");
}

async function enviarAuth(dados) {
    const resposta = await fetch("../api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok || !resultado.ok) {
        throw new Error(resultado.erro || "Não foi possível concluir a operação.");
    }
    return resultado;
}

const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (senha !== confirmarSenha) {
            mostrarMensagem("As senhas não coincidem.");
            return;
        }
        if (senha.length < 6) {
            mostrarMensagem("A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        const botao = formCadastro.querySelector('button[type="submit"]');
        botao.disabled = true;
        try {
            const resultado = await enviarAuth({ acao: "cadastro", nome, email, senha });
            mostrarMensagem(resultado.mensagem || "Cadastro realizado com sucesso!", true);
            setTimeout(() => { window.location.href = "login.php"; }, 900);
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            botao.disabled = false;
        }
    });
}

const formLogin = document.getElementById("formLogin");
if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const botao = formLogin.querySelector('button[type="submit"]');
        botao.disabled = true;

        try {
            await enviarAuth({ acao: "login", email, senha });
            mostrarMensagem("Login realizado com sucesso!", true);
            setTimeout(() => { window.location.href = "index.php"; }, 350);
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            botao.disabled = false;
        }
    });
}
