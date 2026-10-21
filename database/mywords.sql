CREATE DATABASE IF NOT EXISTS mywords
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mywords;

CREATE TABLE IF NOT EXISTS usuarios_lista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    texto LONGTEXT,
    data_criacao DATETIME NOT NULL,
    data_modf DATETIME NOT NULL,
    usuarios_lista_id INT NOT NULL,
    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (usuarios_lista_id)
        REFERENCES usuarios_lista(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tokens temporários para redefinição de senha (válidos por até 1 hora).
CREATE TABLE IF NOT EXISTS tokens_redefinicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios_lista(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_token_expira (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
