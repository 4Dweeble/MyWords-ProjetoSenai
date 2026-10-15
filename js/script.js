let textos = [];
let textoAtualId = null;
let timerAutoSave = null;
let salvamentoEmAndamento = Promise.resolve();

const API_DOCUMENTOS = "../api/documents.php";
const listaTextos = document.getElementById("listaTextos");
const pesquisa = document.getElementById("pesquisa");
const titulo = document.getElementById("titulo");
const editor = document.getElementById("editor");
const status = document.getElementById("status");
const ultimaAlteracao = document.getElementById("ultimaAlteracao");
const contadorPalavras = document.getElementById("contadorPalavras");
const contadorTextos = document.getElementById("contadorTextos");

async function requisitarDocumentos(metodo = "GET", dados = null) {
    const opcoes = { method: metodo, headers: {} };
    if (dados !== null) {
        opcoes.headers["Content-Type"] = "application/json";
        opcoes.body = JSON.stringify(dados);
    }

    const resposta = await fetch(API_DOCUMENTOS, opcoes);
    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok || !resultado.ok) {
        if (resposta.status === 401) {
            window.location.href = "login.php";
            throw new Error("Sua sessão expirou. Entre novamente.");
        }
        throw new Error(resultado.erro || "Não foi possível comunicar com o servidor.");
    }
    return resultado;
}

function exibirErro(erro) {
    console.error(erro);
    status.textContent = erro.message || "Ocorreu um erro.";
}

function formatarData(data) {
    if (!data) return "Agora";
    const normalizada = String(data).includes("T") ? String(data) : String(data).replace(" ", "T");
    const dataObj = new Date(normalizada);
    if (Number.isNaN(dataObj.getTime())) return String(data);
    return dataObj.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function escaparHtml(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function carregarTextos() {
    status.textContent = "Carregando textos...";
    try {
        const resultado = await requisitarDocumentos();
        textos = Array.isArray(resultado.documentos) ? resultado.documentos : [];
        renderizarLista();

        if (textos.length > 0) {
            textoAtualId = textos[0].id;
            carregarEditor(textos[0]);
        } else {
            await novoTexto();
        }
        status.textContent = "Pronto";
    } catch (erro) {
        exibirErro(erro);
    }
}

function renderizarLista() {
    const termo = pesquisa.value.trim().toLowerCase();
    const filtrados = textos
        .filter(t => (t.titulo || "Sem título").toLowerCase().includes(termo)
            || (t.html || "").replace(/<[^>]*>/g, " ").toLowerCase().includes(termo))
        .sort((a, b) => new Date(String(b.atualizadoEm).replace(" ", "T")) - new Date(String(a.atualizadoEm).replace(" ", "T")));

    listaTextos.innerHTML = "";
    if (filtrados.length === 0) {
        listaTextos.innerHTML = `<div class="item-vazio">${termo ? "Nenhum texto encontrado." : "Nenhum texto criado ainda."}</div>`;
    } else {
        filtrados.forEach(t => {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "item-texto" + (String(t.id) === String(textoAtualId) ? " ativo" : "");
            botao.innerHTML = `
                <span class="item-titulo">📄 ${escaparHtml(t.titulo || "Sem título")}</span>
                <span class="item-data">${escaparHtml(formatarData(t.atualizadoEm))}</span>
            `;
            botao.addEventListener("click", () => abrirTexto(t.id));
            listaTextos.appendChild(botao);
        });
    }
    contadorTextos.textContent = `${textos.length} ${textos.length === 1 ? "texto" : "textos"}`;
}

async function novoTexto() {
    try {
        await salvarTextoAtual(false);
        status.textContent = "Criando texto...";
        const resultado = await requisitarDocumentos("POST", { titulo: "Novo texto", html: "" });
        const novo = resultado.documento;
        textos.unshift(novo);
        textoAtualId = novo.id;
        carregarEditor(novo);
        renderizarLista();
        titulo.focus();
        titulo.select();
        status.textContent = "Novo texto criado";
    } catch (erro) {
        exibirErro(erro);
    }
}

async function abrirTexto(id) {
    try {
        await salvarTextoAtual(false);
        const texto = textos.find(t => String(t.id) === String(id));
        if (!texto) return;
        textoAtualId = texto.id;
        carregarEditor(texto);
        renderizarLista();
    } catch (erro) {
        exibirErro(erro);
    }
}

function carregarEditor(texto) {
    titulo.value = texto.titulo || "";
    editor.innerHTML = texto.html || "";
    ultimaAlteracao.textContent = "Última alteração: " + formatarData(texto.atualizadoEm);
    atualizarContador();
    status.textContent = "Texto carregado";
}

function salvarTextoAtual(mostrarStatus = true) {
    if (!textoAtualId) return Promise.resolve();

    // Serializa os salvamentos para evitar que respostas concorrentes se sobreponham.
    salvamentoEmAndamento = salvamentoEmAndamento.then(async () => {
        const id = textoAtualId;
        const texto = textos.find(t => String(t.id) === String(id));
        if (!texto) return;

        const tituloAtual = titulo.value.trim() || "Sem título";
        const htmlAtual = editor.innerHTML;

        try {
            const resultado = await requisitarDocumentos("PUT", {
                id,
                titulo: tituloAtual,
                html: htmlAtual
            });
            const atualizado = resultado.documento;
            const indice = textos.findIndex(t => String(t.id) === String(atualizado.id));
            if (indice >= 0) textos[indice] = atualizado;

            if (String(textoAtualId) === String(id)) {
                ultimaAlteracao.textContent = "Última alteração: " + formatarData(atualizado.atualizadoEm);
            }
            renderizarLista();
            if (mostrarStatus) status.textContent = "Salvo no banco de dados";
        } catch (erro) {
            exibirErro(erro);
        }
    });

    return salvamentoEmAndamento;
}

function agendarAutoSave() {
    status.textContent = "Salvando...";
    clearTimeout(timerAutoSave);
    timerAutoSave = setTimeout(() => salvarTextoAtual(), 650);
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

async function confirmarExclusao() {
    if (!textoAtualId) return;
    const idExcluido = textoAtualId;
    try {
        clearTimeout(timerAutoSave);
        await requisitarDocumentos("DELETE", { id: idExcluido });
        textos = textos.filter(t => String(t.id) !== String(idExcluido));
        textoAtualId = null;

        if (textos.length > 0) {
            textos.sort((a, b) => new Date(String(b.atualizadoEm).replace(" ", "T")) - new Date(String(a.atualizadoEm).replace(" ", "T")));
            textoAtualId = textos[0].id;
            carregarEditor(textos[0]);
        } else {
            titulo.value = "";
            editor.innerHTML = "";
            ultimaAlteracao.textContent = "Nenhum texto aberto";
            atualizarContador();
        }

        fecharModal();
        renderizarLista();
        status.textContent = "Texto excluído";
    } catch (erro) {
        exibirErro(erro);
    }
}

function limparAoSair() {
    // O autosave envia as alterações ao servidor; beforeunload não é confiável para fetch.
    clearTimeout(timerAutoSave);
}

async function baixarWord() {
    await salvarTextoAtual(false);
    const texto = textos.find(t => String(t.id) === String(textoAtualId));
    if (!texto) {
        alert("Crie ou abra um texto antes de baixar.");
        return;
    }

    const nome = (titulo.value.trim() || "meu-documento")
        .replace(/[\\/:*?"<>|]/g, "").trim() || "meu-documento";
    const btn = document.getElementById("baixar");
    btn.disabled = true;
    btn.textContent = "⏳ Gerando...";

    try {
        if (window.docx) {
            const linhas = (editor.innerText || "").split("\n");
            const paragrafos = [];
            if (titulo.value.trim()) {
                paragrafos.push(new docx.Paragraph({
                    children: [new docx.TextRun({ text: titulo.value.trim(), bold: true, size: 32 })],
                    spacing: { after: 300 }
                }));
            }
            linhas.forEach(linha => paragrafos.push(new docx.Paragraph({
                children: [new docx.TextRun({ text: linha })]
            })));
            const documento = new docx.Document({ sections: [{ properties: {}, children: paragrafos }] });
            const blob = await docx.Packer.toBlob(documento);
            baixarBlob(blob, nome + ".docx");
        } else {
            baixarDocFallback(titulo.value, editor.innerHTML, nome);
        }
        status.textContent = "Download concluído";
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível gerar o Word. Tentando formato compatível...");
        try {
            baixarDocFallback(titulo.value, editor.innerHTML, nome);
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
    const conteudo = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${escaparHtml(tituloTexto)}</title></head><body><h1>${escaparHtml(tituloTexto || "")}</h1>${html}</body></html>`;
    const blob = new Blob(["\ufeff", conteudo], { type: "application/msword" });
    baixarBlob(blob, nome + ".doc");
}

document.getElementById("novoTexto").addEventListener("click", novoTexto);
document.getElementById("salvar").addEventListener("click", () => salvarTextoAtual());
document.getElementById("baixar").addEventListener("click", baixarWord);
document.getElementById("excluir").addEventListener("click", pedirExclusao);
document.getElementById("cancelarExclusao").addEventListener("click", fecharModal);
document.getElementById("confirmarExclusao").addEventListener("click", confirmarExclusao);
pesquisa.addEventListener("input", renderizarLista);
titulo.addEventListener("input", agendarAutoSave);
editor.addEventListener("input", () => {
    atualizarContador();
    agendarAutoSave();
});
document.querySelectorAll(".toolbar button").forEach(botao => {
    botao.addEventListener("mousedown", e => e.preventDefault());
    botao.addEventListener("click", () => aplicarComando(botao.dataset.cmd));
});
document.getElementById("tamanhoFonte").addEventListener("change", e => alterarTamanho(e.target.value));
document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvarTextoAtual();
    }
});

window.addEventListener("beforeunload", limparAoSair);
carregarTextos();
