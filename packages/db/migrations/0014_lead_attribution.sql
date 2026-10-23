-- Attribuzione osservata (utm_* e dominio del referrer) catturata al submit. JSON compatto, validato lato server. Additiva.
ALTER TABLE leads ADD COLUMN attribution TEXT;
