CREATE USER stupid WITH PASSWORD 'stupid';
CREATE DATABASE stupid_synonyms lc_collate 'en_US.UTF-8' lc_ctype 'en_US.UTF-8' encoding 'UTF8' template template0;
GRANT ALL PRIVILEGES ON DATABASE stupid_synonyms TO stupid;
