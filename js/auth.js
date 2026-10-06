const CHAVE_USUARIO = "mywordsUsuarioV1";

function mostrarMensagem(texto, sucesso = false) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = "auth-mensagem" + (sucesso ? " sucesso" : "");
}

const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
    formCadastro.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (senha !== confirmarSenha) {
            mostrarMensagem("As senhas não coincidem.");
            return;
        }

        const usuario = { nome, email, senha };
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
        mostrarMensagem("Cadastro realizado com sucesso!", true);

        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
    });
}

const formLogin = document.getElementById("formLogin");
if (formLogin) {
    formLogin.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const senha = document.getElementById("senha").value;
        const salvo = localStorage.getItem(CHAVE_USUARIO);

        if (!salvo) {
            mostrarMensagem("Nenhum cadastro encontrado. Cadastre-se primeiro.");
            return;
        }

        const usuario = JSON.parse(salvo);

        if (nome !== usuario.nome || senha !== usuario.senha) {
            mostrarMensagem("Nome ou senha incorretos.");
            return;
        }

        localStorage.setItem("mywordsLogado", "true");
        mostrarMensagem("Login realizado com sucesso!", true);

        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);
    });
}
