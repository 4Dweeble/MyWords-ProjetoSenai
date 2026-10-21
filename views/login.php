<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - MyWords</title>
    <link rel="stylesheet" href="../css/auth.css">
</head>
<body>
    <div class="auth-app">
        <header class="auth-topbar">
            <div class="brand">✍️ <span>MyWords</span></div>
            <div class="auth-top-actions">
                <a class="auth-link" href="cadastro.php">Cadastro</a>
            </div>
        </header>
        <main class="auth-main">
            <section class="auth-card">
                <h1>Login</h1>
                <p class="descricao">Entre na sua conta para acessar seus textos.</p>
                <form id="formLogin">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input id="email" name="email" type="email" autocomplete="username" required>
                    </div>
                    <div class="form-group">
                        <label for="senha">Senha</label>
                        <input id="senha" name="senha" type="password" autocomplete="current-password" required>
                    </div>
                    <button class="btn-auth" type="submit">Confirmar</button>
                    <p class="auth-alternativa esqueci"><a href="recuperar.php">Esqueci a senha</a></p>
                    <div id="mensagem" class="auth-mensagem" aria-live="polite"></div>
                </form>
                <p class="auth-alternativa">Não possuo login. <a href="cadastro.php">Cadastrar</a></p>
            </section>
        </main>
    </div>
    <script src="../js/auth.js"></script>
</body>
</html>
