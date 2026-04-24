INSERT INTO settings (id,data)
VALUES (1,'{}')
ON CONFLICT DO NOTHING;

INSERT INTO sales_config (id,data)
VALUES (1,'{}')
ON CONFLICT DO NOTHING;
