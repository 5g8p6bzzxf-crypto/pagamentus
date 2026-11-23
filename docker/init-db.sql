-- Criação dos ambientes separados de banco (conforme SPEC-1.2)
CREATE DATABASE pagamentus_prod;
CREATE DATABASE pagamentus_test;

GRANT ALL PRIVILEGES ON DATABASE pagamentus_prod TO usuario_fake;
GRANT ALL PRIVILEGES ON DATABASE pagamentus_test TO usuario_fake;
