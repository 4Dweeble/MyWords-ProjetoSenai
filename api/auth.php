<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {
    if (!empty($_SESSION['usuario_id'])) {
        responder([
            'ok' => true,
            'logado' => true,
            'usuario' => [
                'id' => (int) $_SESSION['usuario_id'],
                'nome' => (string) ($_SESSION['usuario_nome'] ?? '')
            ]
        ]);
    }
    responder(['ok' => true, 'logado' => false]);
}

if ($metodo !== 'POST') {
    header('Allow: GET, POST');
    responder(['ok' => false, 'erro' => 'Método não permitido.'], 405);
}

$dados = lerJson();
$acao = (string) ($dados['acao'] ?? '');

if ($acao === 'atualizar_perfil') {
    $usuarioId = exigirLogin();
    $nome = trim((string) ($dados['nome'] ?? ''));
    $email = mb_strtolower(trim((string) ($dados['email'] ?? '')));
    $senhaAtual = (string) ($dados['senhaAtual'] ?? '');
    $novaSenha = (string) ($dados['novaSenha'] ?? '');
    $confirmarSenha = (string) ($dados['confirmarSenha'] ?? '');

    if ($nome === '' || mb_strlen($nome) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 100) {
        responder(['ok' => false, 'erro' => 'Informe um nome e um e-mail válido.'], 422);
    }

    $consulta = $pdo->prepare('SELECT id, senha FROM usuarios_lista WHERE id = ? LIMIT 1');
    $consulta->execute([$usuarioId]);
    $usuario = $consulta->fetch();
    if (!$usuario) {
        session_destroy();
        responder(['ok' => false, 'erro' => 'Usuário não encontrado. Entre novamente.'], 401);
    }

    $consultaEmail = $pdo->prepare('SELECT id FROM usuarios_lista WHERE email = ? AND id <> ? LIMIT 1');
    $consultaEmail->execute([$email, $usuarioId]);
    if ($consultaEmail->fetch()) {
        responder(['ok' => false, 'erro' => 'Este e-mail já está sendo usado por outra conta.'], 409);
    }

    $alterarSenha = $senhaAtual !== '' || $novaSenha !== '' || $confirmarSenha !== '';
    if ($alterarSenha) {
        if ($senhaAtual === '' || $novaSenha === '' || $confirmarSenha === '') {
            responder(['ok' => false, 'erro' => 'Para trocar a senha, preencha a senha atual, a nova senha e a confirmação.'], 422);
        }
        if (strlen($novaSenha) < 6) {
            responder(['ok' => false, 'erro' => 'A nova senha precisa ter pelo menos 6 caracteres.'], 422);
        }
        if ($novaSenha !== $confirmarSenha) {
            responder(['ok' => false, 'erro' => 'A nova senha e a confirmação não coincidem.'], 422);
        }
        if (!password_verify($senhaAtual, $usuario['senha'])) {
            responder(['ok' => false, 'erro' => 'A senha atual está incorreta.'], 422);
        }
        $hashSenha = password_hash($novaSenha, PASSWORD_DEFAULT);
        $atualizar = $pdo->prepare('UPDATE usuarios_lista SET nome = ?, email = ?, senha = ? WHERE id = ?');
        $atualizar->execute([$nome, $email, $hashSenha, $usuarioId]);
    } else {
        $atualizar = $pdo->prepare('UPDATE usuarios_lista SET nome = ?, email = ? WHERE id = ?');
        $atualizar->execute([$nome, $email, $usuarioId]);
    }

    $_SESSION['usuario_nome'] = $nome;
    responder(['ok' => true, 'mensagem' => 'Cadastro atualizado com sucesso.', 'usuario' => ['id' => $usuarioId, 'nome' => $nome, 'email' => $email]]);
}

if ($acao === 'cadastro') {
    $nome = trim((string) ($dados['nome'] ?? ''));
    $email = mb_strtolower(trim((string) ($dados['email'] ?? '')));
    $senha = (string) ($dados['senha'] ?? '');

    if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($senha) < 6) {
        responder(['ok' => false, 'erro' => 'Informe nome, email válido e senha com pelo menos 6 caracteres.'], 422);
    }

    $consulta = $pdo->prepare('SELECT id FROM usuarios_lista WHERE email = ? LIMIT 1');
    $consulta->execute([$email]);
    if ($consulta->fetch()) {
        responder(['ok' => false, 'erro' => 'Este email já está cadastrado.'], 409);
    }

    $hash = password_hash($senha, PASSWORD_DEFAULT);
    $inserir = $pdo->prepare('INSERT INTO usuarios_lista (nome, email, senha) VALUES (?, ?, ?)');
    $inserir->execute([$nome, $email, $hash]);

    responder(['ok' => true, 'mensagem' => 'Cadastro realizado! Agora entre com seu email e senha.'], 201);
}

if ($acao === 'login') {
    $email = mb_strtolower(trim((string) ($dados['email'] ?? '')));
    $senha = (string) ($dados['senha'] ?? '');

    $consulta = $pdo->prepare('SELECT id, nome, email, senha FROM usuarios_lista WHERE email = ? LIMIT 1');
    $consulta->execute([$email]);
    $usuario = $consulta->fetch();

    if (!$usuario || !password_verify($senha, $usuario['senha'])) {
        responder(['ok' => false, 'erro' => 'Email ou senha incorretos.'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) $usuario['id'];
    $_SESSION['usuario_nome'] = $usuario['nome'];

    responder([
        'ok' => true,
        'mensagem' => 'Login realizado com sucesso.',
        'usuario' => ['id' => (int) $usuario['id'], 'nome' => $usuario['nome']]
    ]);
}

if ($acao === 'solicitar_redefinicao') {
    $email = mb_strtolower(trim((string) ($dados['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        responder(['ok' => false, 'erro' => 'Informe um e-mail válido.'], 422);
    }

    $consulta = $pdo->prepare('SELECT id FROM usuarios_lista WHERE email = ? LIMIT 1');
    $consulta->execute([$email]);
    $usuario = $consulta->fetch();

    // A resposta é igual exista ou não uma conta, evitando revelar e-mails cadastrados.
    if ($usuario) {
        $token = bin2hex(random_bytes(32));
        $hashToken = hash('sha256', $token);
        $expira = (new DateTimeImmutable('+1 hour'))->format('Y-m-d H:i:s');
        $pdo->prepare('DELETE FROM tokens_redefinicao WHERE usuario_id = ?')->execute([(int) $usuario['id']]);
        $pdo->prepare('INSERT INTO tokens_redefinicao (usuario_id, token_hash, expira_em) VALUES (?, ?, ?)')
            ->execute([(int) $usuario['id'], $hashToken, $expira]);

        $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        $esquema = $https ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/auth.php')), '/\\');
        $link = $esquema . '://' . $host . $base . '/views/recuperar.php?token=' . urlencode($token);
        $assunto = 'Recuperação de senha - MyWords';
        $mensagemEmail = "Você solicitou a redefinição da senha do MyWords.\nAcesse o link abaixo em até 1 hora:\n$link\n\nSe não foi você, ignore esta mensagem.";
        $cabecalhos = "Content-Type: text/plain; charset=UTF-8\r\n";
        @mail($email, $assunto, $mensagemEmail, $cabecalhos);
    }

    responder(['ok' => true, 'mensagem' => 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve.']);
}

if ($acao === 'redefinir_senha') {
    $token = trim((string) ($dados['token'] ?? ''));
    $novaSenha = (string) ($dados['novaSenha'] ?? '');
    if (strlen($novaSenha) < 6) {
        responder(['ok' => false, 'erro' => 'A nova senha precisa ter pelo menos 6 caracteres.'], 422);
    }
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        responder(['ok' => false, 'erro' => 'Link de recuperação inválido ou expirado.'], 400);
    }

    $consulta = $pdo->prepare('SELECT id, usuario_id FROM tokens_redefinicao WHERE token_hash = ? AND expira_em > NOW() LIMIT 1');
    $consulta->execute([hash('sha256', $token)]);
    $registro = $consulta->fetch();
    if (!$registro) {
        responder(['ok' => false, 'erro' => 'Link de recuperação inválido ou expirado. Solicite um novo link.'], 400);
    }

    $hashSenha = password_hash($novaSenha, PASSWORD_DEFAULT);
    $pdo->prepare('UPDATE usuarios_lista SET senha = ? WHERE id = ?')->execute([$hashSenha, (int) $registro['usuario_id']]);
    $pdo->prepare('DELETE FROM tokens_redefinicao WHERE usuario_id = ?')->execute([(int) $registro['usuario_id']]);
    responder(['ok' => true, 'mensagem' => 'Senha alterada com sucesso. Você já pode entrar.']);
}

responder(['ok' => false, 'erro' => 'Ação não reconhecida.'], 400);
