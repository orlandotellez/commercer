-- Agregar inventario para productos existentes
-- Este script crea registros en la tabla inventory para productos que no tengan

INSERT INTO inventory (product_id, stock_current, stock_minimum, last_updated)
SELECT 
    p.id,
    COALESCE(p.stock, 10), -- Usar el stock del product 10
    5, -- Stock mínimo de ejemplo
    CURRENT_TIMESTAMP
FROM product p
WHERE NOT EXISTS (
    SELECT 1 FROM inventory i WHERE i.product_id = p.id
);

-- Verificar el resultado
SELECT p.name, i.stock_current, i.stock_minimum 
FROM product p 
LEFT JOIN inventory i ON p.id = i.product_id 
ORDER BY p.name;
