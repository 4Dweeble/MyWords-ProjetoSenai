CREATE DATABASE IF NOT EXISTS mywords;

USE mywords;

CREATE TABLE IF NOT EXISTS usuarios_lista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

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
);