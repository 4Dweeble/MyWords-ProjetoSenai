<?php
$token = isset($_GET['token']) ? (string) $_GET['token'] : '';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar senha - MyWords</title>
    <link rel="stylesheet" href="../css/auth.css">
</head>
<body>
    <div class="auth-app">
        <header class="auth-topbar">
            <div class="brand">✍️ <span>MyWords</span></div>
            <div class="auth-top-actions"><a class="auth-link" href="login.php">Login</a></div>
        </header>
        <main class="auth-main">
            <section class="auth-card">
                <h1 id="tituloRecuperacao"><?= $token !== '' ? 'Criar nova senha' : 'Esqueci a senha' ?></h1>
                <p class="descricao" id="descricaoRecuperacao"><?= $token !== '' ? 'Escolha uma nova senha para sua conta.' : 'Informe o e-mail cadastrado. Enviaremos um link para redefinir sua senha.' ?></p>
                <form id="formRecuperar" data-token="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
                    <div class="form-group" id="grupoEmail">
                        <label for="email">E-mail</label>
                        <input id="email" name="email" type="email" autocomplete="email" required>
                    </div>
                    <div class="form-group" id="grupoNovaSenha" <?= $token === '' ? 'hidden' : '' ?>>
                        <label for="novaSenha">Nova senha</label>
                        <input id="novaSenha" name="novaSenha" type="password" minlength="6" autocomplete="new-password" <?= $token !== '' ? 'required' : '' ?>>
                    </div>
                    <button class="btn-auth" type="submit" id="botaoRecuperar"><?= $token !== '' ? 'Trocar senha' : 'Enviar link de recuperação' ?></button>
                    <div id="mensagem" class="auth-mensagem" aria-live="polite"></div>
                </form>
                <p class="auth-alternativa"><a href="login.php">Já tenho login</a></p>
            </section>
        </main>
    </div>
    <script src="../js/auth.js"></script>
</body>
</html>
