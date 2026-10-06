const CHAVE = "meusTextosV1";
let textos = [];
let textoAtualId = null;
let timerAutoSave = null;

const listaTextos = document.getElementById("listaTextos");
const pesquisa = document.getElementById("pesquisa");
const titulo = document.getElementById("titulo");
const editor = document.getElementById("editor");
const status = document.getElementById("status");
const ultimaAlteracao = document.getElementById("ultimaAlteracao");
const contadorPalavras = document.getElementById("contadorPalavras");
const contadorTextos = document.getElementById("contadorTextos");

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function carregarTextos() {
    try {
        const salvo = localStorage.getItem(CHAVE);
        textos = salvo ? JSON.parse(salvo) : [];
        if (!Array.isArray(textos)) textos = [];
    } catch (erro) {
        textos = [];
        alert("Não foi possível ler os textos salvos neste navegador.");
    }
}

function salvarBanco() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(textos));
        return true;
    } catch (erro) {
        alert("Não foi possível salvar. O armazenamento do navegador pode estar cheio.");
        return false;
    }
}

function formatarData(data) {
    return new Date(data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function renderizarLista() {
    const termo = pesquisa.value.trim().toLowerCase();

    const filtrados = textos
        .filter(t => {
            const nome = (t.titulo || "Sem título").toLowerCase();
            const corpo = (t.html || "").toLowerCase();
            return nome.includes(termo) || corpo.includes(termo);
        })
        .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm));

    listaTextos.innerHTML = "";

    if (filtrados.length === 0) {
        listaTextos.innerHTML = `<div class="item-vazio">${termo ? "Nenhum texto encontrado." : "Nenhum texto criado ainda."}</div>`;
    } else {
        filtrados.forEach(t => {
            const botao = document.createElement("button");
            botao.className = "item-texto" + (t.id === textoAtualId ? " ativo" : "");
            botao.innerHTML = `
                <span class="item-titulo">📄 ${escaparHtml(t.titulo || "Sem título")}</span>
                <span class="item-data">${formatarData(t.atualizadoEm)}</span>
            `;
            botao.addEventListener("click", () => abrirTexto(t.id));
            listaTextos.appendChild(botao);
        });
    }

    contadorTextos.textContent = `${textos.length} ${textos.length === 1 ? "texto" : "textos"}`;
}

function escaparHtml(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function novoTexto() {
    const agora = new Date().toISOString();

    const novo = {
        id: gerarId(),
        titulo: "Novo texto",
        html: "",
        criadoEm: agora,
        atualizadoEm: agora
    };

    textos.push(novo);
    textoAtualId = novo.id;
    salvarBanco();
    carregarEditor(novo);
    renderizarLista();

    titulo.focus();
    titulo.select();
}

function abrirTexto(id) {
    const texto = textos.find(t => t.id === id);
    if (!texto) return;

    salvarTextoAtual(false);
    textoAtualId = id;
    carregarEditor(texto);
    renderizarLista();
}

function carregarEditor(texto) {
    titulo.value = texto.titulo || "";
    editor.innerHTML = texto.html || "";
    ultimaAlteracao.textContent = "Última alteração: " + formatarData(texto.atualizadoEm);
    atualizarContador();
    status.textContent = "Texto carregado";
}

function salvarTextoAtual(mostrarStatus = true) {
    if (!textoAtualId) return;

    const texto = textos.find(t => t.id === textoAtualId);
    if (!texto) return;

    texto.titulo = titulo.value.trim() || "Sem título";
    texto.html = editor.innerHTML;
    texto.atualizadoEm = new Date().toISOString();

    const ok = salvarBanco();

    if (ok) {
        ultimaAlteracao.textContent = "Última alteração: " + formatarData(texto.atualizadoEm);
        renderizarLista();
        if (mostrarStatus) status.textContent = "Salvo";
    }
}

function agendarAutoSave() {
    status.textContent = "Salvando...";
    clearTimeout(timerAutoSave);
    timerAutoSave = setTimeout(() => salvarTextoAtual(), 500);
}

function atualizarContador() {
    const texto = editor.innerText.trim();
    const palavras = texto ? texto.split(/\s+/).length : 0;
    contadorPalavras.textContent = `${palavras} ${palavras === 1 ? "palavra" : "palavras"}`;
}

function aplicarComando(comando) {
    editor.focus();
    document.execCommand(comando, false, null);
    agendarAutoSave();
}

function alterarTamanho(valor) {
    if (!valor) return;
    editor.focus();
    document.execCommand("fontSize", false, valor);
    document.getElementById("tamanhoFonte").value = "";
    agendarAutoSave();
}

function pedirExclusao() {
    if (!textoAtualId) return;
    document.getElementById("modalConfirmacao").classList.remove("hidden");
}

function fecharModal() {
    document.getElementById("modalConfirmacao").classList.add("hidden");
}

function confirmarExclusao() {
    if (!textoAtualId) return;

    textos = textos.filter(t => t.id !== textoAtualId);
    salvarBanco();

    if (textos.length > 0) {
        textos.sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm));
        textoAtualId = textos[0].id;
        carregarEditor(textos[0]);
    } else {
        textoAtualId = null;
        titulo.value = "";
        editor.innerHTML = "";
        ultimaAlteracao.textContent = "Nenhum texto aberto";
        atualizarContador();
    }

    fecharModal();
    renderizarLista();
    status.textContent = "Texto excluído";
}

function limparAoSair() {
    salvarTextoAtual(false);
}

async function baixarWord() {
    salvarTextoAtual(false);

    const texto = textos.find(t => t.id === textoAtualId);
    if (!texto) {
        alert("Crie ou abra um texto antes de baixar.");
        return;
    }

    const nome = (texto.titulo || "meu-documento")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim() || "meu-documento";

    const btn = document.getElementById("baixar");
    btn.disabled = true;
    btn.textContent = "⏳ Gerando...";

    try {
        if (window.docx) {
            const linhas = (editor.innerText || "").split("\n");
            const paragrafos = [];

            if (texto.titulo && texto.titulo !== "Sem título") {
                paragrafos.push(new docx.Paragraph({
                    children: [new docx.TextRun({
                        text: texto.titulo,
                        bold: true,
                        size: 32
                    })],
                    spacing: { after: 300 }
                }));
            }

            linhas.forEach(linha => {
                paragrafos.push(new docx.Paragraph({
                    children: [new docx.TextRun({ text: linha })]
                }));
            });

            const documento = new docx.Document({
                sections: [{ properties: {}, children: paragrafos }]
            });

            const blob = await docx.Packer.toBlob(documento);
            baixarBlob(blob, nome + ".docx");
            status.textContent = "Download concluído";
        } else {
            baixarDocFallback(texto.titulo, editor.innerHTML, nome);
            status.textContent = "Download concluído";
        }
    } catch (erro) {
        console.error(erro);
        alert("Ocorreu um erro ao gerar o Word. Tentando formato compatível...");
        try {
            baixarDocFallback(texto.titulo, editor.innerHTML, nome);
            status.textContent = "Download concluído";
        } catch (erro2) {
            alert("Não foi possível gerar o arquivo.");
            status.textContent = "Erro no download";
        }
    } finally {
        btn.disabled = false;
        btn.textContent = "📥 Baixar Word";
    }
}

function baixarBlob(blob, nome) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function baixarDocFallback(tituloTexto, html, nome) {
    const conteudo = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><title>${escaparHtml(tituloTexto)}</title></head>
        <body>
            <h1>${escaparHtml(tituloTexto || "")}</h1>
            ${html}
        </body>
        </html>
    `;

    const blob = new Blob(["\ufeff", conteudo], {
        type: "application/msword"
    });

    baixarBlob(blob, nome + ".doc");
}

document.getElementById("novoTexto").addEventListener("click", novoTexto);
document.getElementById("salvar").addEventListener("click", () => salvarTextoAtual());
document.getElementById("baixar").addEventListener("click", baixarWord);
document.getElementById("excluir").addEventListener("click", pedirExclusao);
document.getElementById("cancelarExclusao").addEventListener("click", fecharModal);
document.getElementById("confirmarExclusao").addEventListener("click", confirmarExclusao);
pesquisa.addEventListener("input", renderizarLista);

titulo.addEventListener("input", () => {
    agendarAutoSave();
});

editor.addEventListener("input", () => {
    atualizarContador();
    agendarAutoSave();
});

document.querySelectorAll(".toolbar button").forEach(botao => {
    botao.addEventListener("mousedown", e => e.preventDefault());
    botao.addEventListener("click", () => aplicarComando(botao.dataset.cmd));
});

document.getElementById("tamanhoFonte").addEventListener("change", e => {
    alterarTamanho(e.target.value);
});

document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvarTextoAtual();
    }
});

window.addEventListener("beforeunload", limparAoSair);

carregarTextos();

if (textos.length > 0) {
    textos.sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm));
    textoAtualId = textos[0].id;
    carregarEditor(textos[0]);
} else {
    novoTexto();
}

renderizarLista();
