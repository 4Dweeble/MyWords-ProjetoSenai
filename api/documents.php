<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';

$usuarioId = exigirLogin();
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function documentoParaResposta(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'titulo' => $row['titulo'],
        'html' => $row['texto'] ?? '',
        'criadoEm' => $row['data_criacao'],
        'atualizadoEm' => $row['data_modf'],
    ];
}

if ($metodo === 'GET') {
    $consulta = $pdo->prepare(
        'SELECT id, titulo, texto, data_criacao, data_modf
         FROM documento WHERE usuarios_lista_id = ?
         ORDER BY data_modf DESC, id DESC'
    );
    $consulta->execute([$usuarioId]);
    responder(['ok' => true, 'documentos' => array_map('documentoParaResposta', $consulta->fetchAll())]);
}

$dados = lerJson();

if ($metodo === 'POST') {
    $titulo = trim((string) ($dados['titulo'] ?? 'Novo texto'));
    $html = (string) ($dados['html'] ?? '');
    if ($titulo === '') $titulo = 'Sem título';

    $inserir = $pdo->prepare(
        'INSERT INTO documento (titulo, texto, data_criacao, data_modf, usuarios_lista_id)
         VALUES (?, ?, NOW(), NOW(), ?)'
    );
    $inserir->execute([$titulo, $html, $usuarioId]);
    $id = (int) $pdo->lastInsertId();

    $consulta = $pdo->prepare(
        'SELECT id, titulo, texto, data_criacao, data_modf FROM documento
         WHERE id = ? AND usuarios_lista_id = ?'
    );
    $consulta->execute([$id, $usuarioId]);
    responder(['ok' => true, 'documento' => documentoParaResposta($consulta->fetch())], 201);
}

if ($metodo === 'PUT') {
    $id = filter_var($dados['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) responder(['ok' => false, 'erro' => 'Documento inválido.'], 422);

    $titulo = trim((string) ($dados['titulo'] ?? 'Sem título'));
    if ($titulo === '') $titulo = 'Sem título';
    $html = (string) ($dados['html'] ?? '');

    $atualizar = $pdo->prepare(
        'UPDATE documento SET titulo = ?, texto = ?, data_modf = NOW()
         WHERE id = ? AND usuarios_lista_id = ?'
    );
    $atualizar->execute([$titulo, $html, $id, $usuarioId]);

    $consulta = $pdo->prepare(
        'SELECT id, titulo, texto, data_criacao, data_modf FROM documento
         WHERE id = ? AND usuarios_lista_id = ?'
    );
    $consulta->execute([$id, $usuarioId]);
    $row = $consulta->fetch();
    if (!$row) responder(['ok' => false, 'erro' => 'Documento não encontrado.'], 404);

    responder(['ok' => true, 'documento' => documentoParaResposta($row)]);
}

if ($metodo === 'DELETE') {
    $id = filter_var($dados['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) responder(['ok' => false, 'erro' => 'Documento inválido.'], 422);

    $excluir = $pdo->prepare('DELETE FROM documento WHERE id = ? AND usuarios_lista_id = ?');
    $excluir->execute([$id, $usuarioId]);
    if ($excluir->rowCount() === 0) responder(['ok' => false, 'erro' => 'Documento não encontrado.'], 404);
    responder(['ok' => true]);
}

header('Allow: GET, POST, PUT, DELETE');
responder(['ok' => false, 'erro' => 'Método não permitido.'], 405);
