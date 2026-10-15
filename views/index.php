<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/bootstrap.php';
if (empty($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}
$nomeUsuario = htmlspecialchars((string) ($_SESSION['usuario_nome'] ?? 'Usuário'), ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Textos - MyWords</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="app">
        <aside class="sidebar">
            <div class="brand">✍️ <span>MyWords</span></div>
            <button id="novoTexto" class="btn-novo">＋ Novo texto</button>
            <div class="pesquisa">
                <span>🔍</span>
                <input id="pesquisa" type="search" placeholder="Pesquisar textos...">
            </div>
            <nav>
                <div class="nav-titulo">MEUS TEXTOS</div>
                <div id="listaTextos" class="lista-textos"></div>
            </nav>
            <div class="sidebar-footer"><span id="contadorTextos">0 textos</span></div>
        </aside>
        <main class="conteudo">
            <header class="topbar">
                <div><div class="status" id="status">Conectando...</div></div>
                <div class="top-actions">
                    <span class="usuario-logado"><?= $nomeUsuario ?></span>
                    <button id="salvar" class="btn-secundario">💾 Salvar</button>
                    <button id="baixar" class="btn-word">📥 Baixar Word</button>
                    <a href="../api/logout.php" class="btn-secundario" style="text-decoration:none;color:inherit;">Sair</a>
                </div>
            </header>
            <section class="editor-area">
                <input id="titulo" class="titulo" type="text" placeholder="Título do texto" maxlength="100">
                <div class="info">
                    <span id="ultimaAlteracao">Nenhum texto aberto</span>
                    <span id="contadorPalavras">0 palavras</span>
                </div>
                <div class="toolbar">
                    <button data-cmd="bold" type="button"><strong>N</strong></button>
                    <button data-cmd="italic" type="button"><em>I</em></button>
                    <button data-cmd="underline" type="button"><u>S</u></button>
                    <span class="separador"></span>
                    <select id="tamanhoFonte">
                        <option value="">Tamanho</option>
                        <option value="2">Pequeno</option>
                        <option value="3">Normal</option>
                        <option value="5">Grande</option>
                        <option value="7">Muito grande</option>
                    </select>
                    <button data-cmd="justifyLeft" type="button">⇤</button>
                    <button data-cmd="justifyCenter" type="button">≡</button>
                    <button data-cmd="justifyRight" type="button">⇥</button>
                    <button data-cmd="insertUnorderedList" type="button">• Lista</button>
                </div>
                <div id="editor" class="editor" contenteditable="true" spellcheck="true"></div>
                <div class="rodape-editor">
                    <button id="excluir" class="btn-excluir" type="button">🗑️ Excluir texto</button>
                    <span>Salvamento automático ativado</span>
                </div>
            </section>
        </main>
    </div>
    <div id="modalConfirmacao" class="modal hidden">
        <div class="modal-card">
            <h2>Excluir texto?</h2>
            <p>O texto será removido da sua lista. Esta ação não poderá ser desfeita.</p>
            <div class="modal-actions">
                <button id="cancelarExclusao" class="btn-secundario" type="button">Cancelar</button>
                <button id="confirmarExclusao" class="btn-excluir-confirmar" type="button">Excluir</button>
            </div>
        </div>
    </div>
    <script src="https://unpkg.com/docx@8.5.0/build/index.js"></script>
    <script src="../js/script.js"></script>
</body>
</html>
