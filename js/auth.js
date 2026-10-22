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

const formPerfil = document.getElementById("formPerfil");
if (formPerfil) {
    formPerfil.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senhaAtual = document.getElementById("senhaAtual").value;
        const novaSenha = document.getElementById("novaSenha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (novaSenha !== confirmarSenha) {
            mostrarMensagem("A nova senha e a confirmação não coincidem.");
            return;
        }
        if (novaSenha && novaSenha.length < 6) {
            mostrarMensagem("A nova senha precisa ter pelo menos 6 caracteres.");
            return;
        }
        if (!novaSenha && (senhaAtual || confirmarSenha)) {
            mostrarMensagem("Para trocar a senha, preencha a senha atual, a nova senha e a confirmação.");
            return;
        }

        const botao = formPerfil.querySelector('button[type="submit"]');
        botao.disabled = true;
        try {
            const resultado = await enviarAuth({ acao: "atualizar_perfil", nome, email, senhaAtual, novaSenha, confirmarSenha });
            mostrarMensagem(resultado.mensagem || "Cadastro atualizado com sucesso.", true);
            document.getElementById("senhaAtual").value = "";
            document.getElementById("novaSenha").value = "";
            document.getElementById("confirmarSenha").value = "";
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            botao.disabled = false;
        }
    });
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


const formRecuperar = document.getElementById("formRecuperar");
if (formRecuperar) {
    const token = formRecuperar.dataset.token || "";
    const grupoEmail = document.getElementById("grupoEmail");
    const grupoNovaSenha = document.getElementById("grupoNovaSenha");
    const emailInput = document.getElementById("email");
    const novaSenhaInput = document.getElementById("novaSenha");

    if (token) {
        grupoEmail.hidden = true;
        emailInput.required = false;
        novaSenhaInput.required = true;
    }

    formRecuperar.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const botao = formRecuperar.querySelector('button[type="submit"]');
        botao.disabled = true;
        try {
            if (token) {
                const resultado = await enviarAuth({ acao: "redefinir_senha", token, novaSenha: novaSenhaInput.value });
                mostrarMensagem(resultado.mensagem || "Senha alterada. Você já pode entrar.", true);
                botao.textContent = "Senha alterada";
                setTimeout(() => { window.location.href = "login.php"; }, 1400);
            } else {
                const resultado = await enviarAuth({ acao: "solicitar_redefinicao", email: emailInput.value.trim() });
                mostrarMensagem(resultado.mensagem || "Se o e-mail estiver cadastrado, você receberá um link de recuperação.", true);
                formRecuperar.reset();
            }
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            botao.disabled = false;
        }
    });
}
