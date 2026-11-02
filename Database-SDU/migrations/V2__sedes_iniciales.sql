INSERT INTO sedes (id_sede, nombre_sede) VALUES
    (1, 'SEDE 1'),
    (2, 'SEDE 2'),
    (22, 'POSGRADOS'),
    (3, 'SEDE 3'),
    (4, 'EUREKA'),
    (23, 'LA PERLA'),
    (24, 'ILE')
ON CONFLICT (nombre_sede) DO NOTHING;

SELECT setval(pg_get_serial_sequence('sedes', 'id_sede'), (SELECT MAX(id_sede) FROM sedes));
