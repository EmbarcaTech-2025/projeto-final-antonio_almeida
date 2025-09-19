CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL
);

-- Inserir os dados na tabela users
INSERT INTO users (id, login, password, role, firstname, lastname, email, mobile, street, city, state, country)
('98fda3da-a527-4d8b-89f2-9e59dd1749f7', 'acfa@acfa.com', '$2a$10$OVKiMx1bdq1Pud/rEga69O00MNmmEJ96u2DziVh13rTTcfuVFaF8y', '0', 'ACFA', 'de Almeida', 'acfa@acfa.br', '11934130986', 'Av Sezefredo, 995', 'São Paulo', 'SP', 'Brasil'),
('3297efde-b161-4190-a0f3-3d8eebecf5c6', 'jcfa@jcfa.com', '$2a$10$/k205Hwg/bNOrfC9i1VlaeIJnTQS.XwJ1e.o5j9blDoWFPg29N0oK', '1', 'ACFA', 'de Almeida', 'jcfa@jcfa.com', '11934130986', 'Av Sezefredo, 995', 'São Paulo', 'SP', 'Brasil');
