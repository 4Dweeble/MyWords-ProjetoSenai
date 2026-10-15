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

responder(['ok' => false, 'erro' => 'Ação não reconhecida.'], 400);
