-- Limpar disponibilidade atual
truncate table availability_weekly;

-- Inserir nova disponibilidade: Todos os dias (0-6) das 16:15 às 21:15
insert into availability_weekly (day_of_week, start_time, end_time)
values 
(0, '16:15', '21:15'), -- Domingo
(1, '16:15', '21:15'), -- Segunda
(2, '16:15', '21:15'), -- Terça
(3, '16:15', '21:15'), -- Quarta
(4, '16:15', '21:15'), -- Quinta
(5, '16:15', '21:15'), -- Sexta
(6, '16:15', '21:15'); -- Sábado
