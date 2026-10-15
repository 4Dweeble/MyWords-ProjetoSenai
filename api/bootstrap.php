<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_start();
}

$host = 'localhost';
$dbname = 'mywords';
$username = 'root';
$password = ''; // Configuração padrão comum do WampServer. Altere se seu MySQL tiver senha.

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    if (str_contains($_SERVER['SCRIPT_NAME'] ?? '', '/api/')) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok' => false,
            'erro' => 'Não foi possível conectar ao MySQL. Confira se o WampServer está iniciado e se o banco mywords foi importado.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>MyWords - conexão</title><body style="font-family:Arial;padding:2rem"><h1>Banco de dados indisponível</h1><p>Confira se o WampServer está iniciado, se o banco <strong>mywords</strong> foi importado e se as credenciais em <code>api/bootstrap.php</code> estão corretas.</p></body></html>';
    }
    exit;
}

function responder(array $dados, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function exigirLogin(): int
{
    if (empty($_SESSION['usuario_id'])) {
        responder(['ok' => false, 'erro' => 'Sua sessão expirou. Entre novamente.'], 401);
    }
    return (int) $_SESSION['usuario_id'];
}

function lerJson(): array
{
    $dados = json_decode(file_get_contents('php://input'), true);
    return is_array($dados) ? $dados : [];
}
