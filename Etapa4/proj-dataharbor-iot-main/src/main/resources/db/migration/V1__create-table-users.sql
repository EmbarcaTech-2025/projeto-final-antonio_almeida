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
VALUES
('98fda3da-a527-4d8b-89f2-9e59dd1749f7', 'a@a.com', '$2a$10$OVKiMx1bdq1Pud/rEga69O00MNmmEJ96u2DziVh13rTTcfuVFaF8y', '0', 'Antonio', 'de Almeida', 'a@a.com', '11934130986', 'Av Cel Sezefredo Fagundes, 20995', 'São Paulo', 'SP', 'Brasil'),
('3297efde-b161-4190-a0f3-3d8eebecf5c6', 'b@b.com', '$2a$10$/k205Hwg/bNOrfC9i1VlaeIJnTQS.XwJ1e.o5j9blDoWFPg29N0oK', '1', 'Antonio', 'de Almeida', 'b@b.com', '11934130986', 'Av Cel Sezefredo Fagundes, 20995', 'São Paulo', 'SP', 'Brasil'),
('bf140612-2b96-4d51-af39-6b47a66fe916', 'c@c.com', '$2a$10$TCeuN7DR3BvCnkXUpffu4OTTcm78k5K7OhIKIzUdwQN5Bxy1VwQli', '0', 'Antonio', 'de Almeida', 'c@c.com', '11934130986', 'Av Cel Sezefredo Fagundes, 20995', 'São Paulo', 'SP', 'Brasil'),
('78ef24f1-2f8e-4c84-bd91-8ae5fb4a6ded', 'd@d.com', '$2a$10$m522hdwX1AotxELFE/ogHO9.r/uxEGW3Zk4EZffdnpnYU.hC3g956', '1', 'Antonio', 'de Almeida', 'd@d.com', '(11) 93413-0986', 'Av Cel Sezefredo Fagundes, 20995', 'São Paulo', 'SP', 'Paraguai'),
('573f766b-b65c-49ee-a738-ccc4f6aa6e26', 'e@e.com', '$2a$10$dS.8s3OUVC086G7CTLqKBeY5jsUSJD0GDOU1XNPr4amkbU8wByUwG', '1', 'Antonioaaaaaa', 'ACFA', 'e@e.com', '551128265541', 'cinco pontas, 19', 'São Paulo', 'SP', 'Brasil');

