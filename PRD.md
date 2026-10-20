# MyWords-ProjetoSenai

> **Status do Projeto:** 🟡 Em Desenvolvimento (Etapa 1/5 - Concepção)  
> **Tecnologias Previstas:** HTML5, CSS3, JavaScript, PHP, MySQL, Git/GitHub.

---

## 1. Visão Geral do Produto (PRD)

### 1.1. O Problema

A criação deste sistema surgiu da necessidade de organizar e armazenar textos de forma simples e prática, evitando que documentos e anotações fiquem espalhados em diferentes arquivos, pastas ou dispositivos. Muitas vezes, o usuário precisa localizar rapidamente um texto específico, editá-lo ou baixá-lo em um formato adequado, mas não possui uma ferramenta centralizada para isso.

O sistema busca oferecer um espaço único para criar, organizar, editar, salvar e acessar textos, facilitando o gerenciamento das informações e, futuramente, permitindo que os arquivos possam ser acessados de diferentes dispositivos por meio de uma conta de usuário.

### 1.2. Público-Alvo

- Usuário Comum: Pessoa que deseja criar, editar, organizar, salvar e acessar seus textos de maneira simples e prática.

- Administrador: Responsável por gerenciar os usuários, textos e demais informações do sistema, garantindo seu correto funcionamento.

### 1.3. Solução Proposta

O MyWords será um sistema desenvolvido para facilitar a criação, edição, organização e gerenciamento de textos em um único ambiente. A plataforma permitirá que o usuário crie novos documentos, edite conteúdos existentes, pesquise textos e faça o download dos documentos, tornando o processo mais simples e organizado.

## 2. Requisitos do Sistema

### Requisitos Funcionais (RF)
- [ ] **RF01:** O sistema deve permitir o cadastro de novos usuários.
- [ ] **RF02:** O sistema deve permitir o login e autenticação de usuários.
- [ ] **RF03:** O sistema deve exibir uma listagem do que já foi escrito.
- [ ] **RF04:** O sistema deve permitir a criação de novos Textos.
- [ ] **RF05:** O sistema deve permitir a edição de Textos.
- [ ] **RF06:** O sistema deve permitir a exclusão de Textos.
- [ ] **RF07:** O sistema deve permitir o download de Textos em formado .docx ou .doc.

### Requisitos Não Funcionais (RNF)
- [ ] **RNF01:** A interface deve ser responsiva (mobile e desktop).
- [ ] **RNF02:** Persistência de dados realizada em banco MySQL utilizando PDO no PHP.
- [ ] **RNF03:** Validação de campos obrigatórios no front-end via JavaScript.
- [ ] **RNF04:** A estética visual do site deve ser neutra com detalhes em azul ou preto caso necessário.**

### Regras de Negócio (RN)
- **RN01:** Cadastro de textos: O sistema deve permitir que o usuário crie novos textos/documentos.
- **RN02:** Identificação do texto: Todo texto deve possuir um título para facilitar sua identificação e organização.
- **RN03:** Download: O usuário deve poder realizar o download de seus textos em um formato compatível com editores de documentos.
- **RN04:** Segurança: Os dados dos usuários e seus textos devem ser armazenados de forma segura, evitando acesso ou alteração por pessoas não autorizadas.

---

## 3. Estrutura do Repositório

```text
MyWords-ProjetoSenai/
│
├── css/              # Folhas de estilo
├── js/               # Scripts JavaScript
├── database/         # Scripts de banco de dados
├── docs/             # Documentação e wireframes
│   └── wireframes/
├── views/            # Arquivos HTML e páginas PHP
└── README.md         # Documento da PRD e guia do projeto
```

---

## 4. Desenvolvedor(es)
- **Pedro Luís de Melo Vieira** - *Desenvolvedor Full-Stack* - [GitHub] https://github.com/4Dweeble
