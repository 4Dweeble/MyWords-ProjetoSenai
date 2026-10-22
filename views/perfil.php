<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/bootstrap.php';
if (empty($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}
$consulta = $pdo->prepare('SELECT nome, email FROM usuarios_lista WHERE id = ? LIMIT 1');
$consulta->execute([(int) $_SESSION['usuario_id']]);
$usuario = $consulta->fetch();
if (!$usuario) {
    session_destroy();
    header('Location: login.php');
    exit;
}
$nome = htmlspecialchars((string) $usuario['nome'], ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars((string) $usuario['email'], ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu perfil - MyWords</title>
    <link rel="stylesheet" href="../css/auth.css">
</head>
<body>
    <div class="auth-app">
        <header class="auth-topbar">
            <div class="brand">✍️ <span>MyWords</span></div>
            <div class="auth-top-actions">
                <a class="auth-link" href="index.php">Voltar aos meus textos</a>
                <a class="auth-link" href="../api/logout.php">Sair</a>
            </div>
        </header>
        <main class="auth-main">
            <section class="auth-card">
                <h1>Meu perfil</h1>
                <p class="descricao">Edite os dados da sua conta MyWords.</p>
                <form id="formPerfil">
                    <div class="form-group">
                        <label for="nome">Nome</label>
                        <input id="nome" name="nome" type="text" maxlength="100" value="<?= $nome ?>" autocomplete="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input id="email" name="email" type="email" maxlength="100" value="<?= $email ?>" autocomplete="email" required>
                    </div>
                    <hr class="perfil-separador">
                    <p class="descricao perfil-aviso">Para manter sua senha atual, deixe os campos de senha em branco.</p>
                    <div class="form-group">
                        <label for="senhaAtual">Senha atual (necessária para trocar a senha)</label>
                        <input id="senhaAtual" name="senhaAtual" type="password" autocomplete="current-password">
                    </div>
                    <div class="form-group">
                        <label for="novaSenha">Nova senha</label>
                        <input id="novaSenha" name="novaSenha" type="password" minlength="6" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="confirmarSenha">Confirmar nova senha</label>
                        <input id="confirmarSenha" name="confirmarSenha" type="password" minlength="6" autocomplete="new-password">
                    </div>
                    <button class="btn-auth" type="submit">Salvar alterações</button>
                    <div id="mensagem" class="auth-mensagem" aria-live="polite"></div>
                </form>
            </section>
        </main>
    </div>
    <script src="../js/auth.js"></script>
</body>
</html>
