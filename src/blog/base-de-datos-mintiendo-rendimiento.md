---
title: "Tu base de datos está mintiendo sobre su rendimiento"
resumen: "Patrones de consulta que parecen eficientes en desarrollo pero colapsan bajo carga real en producción. El checklist que necesitas antes de lanzar."
categoria: Performance
etiquetas: [bases-de-datos, performance, sql, optimizacion]
date: 2025-04-07
---

El entorno de desarrollo miente sistemáticamente. Con 200 registros todo parece rápido. Con 2 millones de registros y 50 usuarios concurrentes, los problemas emergen de formas que nadie anticipó.

## El problema N+1 que nadie detecta hasta producción

El problema N+1 es uno de los más costosos y más fáciles de prevenir. Ocurre cuando ejecutas una consulta para obtener N registros y luego N consultas adicionales para obtener datos relacionados de cada uno.

```sql
-- Primera consulta: obtener pedidos
SELECT * FROM pedidos WHERE estado = 'pendiente';
-- Resultado: 500 pedidos

-- Luego, para CADA pedido:
SELECT * FROM clientes WHERE id = 1;
SELECT * FROM clientes WHERE id = 2;
-- ... 498 consultas más
```

En desarrollo con 10 pedidos, esto es invisible. En producción con 500 pedidos, son **501 consultas** donde debería haber **1**.

La solución: un JOIN que carga todo en una sola ida al servidor:

```sql
SELECT p.*, c.nombre, c.email
FROM pedidos p
INNER JOIN clientes c ON c.id = p.cliente_id
WHERE p.estado = 'pendiente';
```

## Índices: la diferencia entre milisegundos y minutos

Un índice ausente en una columna usada frecuentemente en WHERE o JOIN puede convertir una consulta de 3ms en una de 45 segundos cuando la tabla crece.

La regla básica: toda columna que aparezca frecuentemente en condiciones de filtrado o en joins debería tener un índice. Pero con matices:

- Los índices aceleran lecturas y **ralentizan escrituras**
- En tablas con escritura masiva, un índice mal colocado puede ser más costoso que la consulta que pretende optimizar
- Los índices compuestos tienen un orden: `(fecha, estado)` no es lo mismo que `(estado, fecha)`

Antes de lanzar a producción, revisa el plan de ejecución (`EXPLAIN ANALYZE` en PostgreSQL) de tus consultas más críticas. Si ves `Seq Scan` en tablas grandes, tienes trabajo pendiente.

El rendimiento de base de datos no es un problema de infraestructura. Es un problema de diseño. Y como todo problema de diseño, es más barato resolverlo antes de que llegue el tráfico real.
