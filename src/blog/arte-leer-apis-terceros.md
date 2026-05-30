---
title: "El arte de leer APIs de terceros sin perder la cordura"
resumen: "Estrategias de integración que sobreviven cambios inesperados en contratos externos, versioning roto y documentación desactualizada."
categoria: Python
etiquetas: [python, apis, integraciones, backend]
date: 2025-04-21
---

Toda empresa que usa software de terceros eventualmente enfrenta el mismo momento: una API externa cambia sin aviso, tu integración colapsa en producción a las 2am, y el equipo pasa el fin de semana parchando en lugar de construyendo.

No tiene por qué ser así.

## El contrato que nunca firmaste

Cuando consumes una API de terceros, estás implícitamente confiando en que el proveedor respetará su propio contrato: que los endpoints no cambiarán sin versioning, que los campos no desaparecerán sin deprecation warnings, que los rate limits estarán documentados y serán estables.

Esta confianza es, con frecuencia, mal depositada.

## La capa de abstracción que te salva

El error arquitectónico más común en integraciones es consumir la API directamente desde la lógica de negocio:

```python
# Frágil: la lógica de negocio conoce los detalles de la API
def procesar_pago(orden):
    response = requests.post(
        'https://api.proveedor.com/v2/payments',
        json={'amount': orden.total, 'currency': 'USD', 'ref': orden.id}
    )
    if response.json()['status'] == 'approved':
        orden.marcar_pagada()
```

La solución es introducir una capa de abstracción que aísle tu dominio de los detalles del proveedor:

```python
# Robusto: el dominio no sabe nada de HTTP ni del proveedor
class PasarelaPagoAdapter:
    def __init__(self, cliente_http: ClienteHTTP):
        self._cliente = cliente_http
    
    def procesar_pago(self, monto: Decimal, referencia: str) -> ResultadoPago:
        try:
            respuesta = self._cliente.post('/payments', {
                'amount': float(monto),
                'currency': 'USD',
                'ref': referencia
            })
            return ResultadoPago(
                aprobado=respuesta['status'] == 'approved',
                id_transaccion=respuesta.get('transaction_id')
            )
        except ExcepcionHTTP as e:
            raise ErrorPasarela(f"Pago fallido: {e}") from e
```

Cuando el proveedor cambie su API (y lo hará), solo tocas el adapter. Tu lógica de negocio no sabe que algo cambió.

## Manejo defensivo de respuestas

Las APIs de terceros mienten. A veces activamente (documentación desactualizada), a veces pasivamente (comportamiento no documentado).

Reglas defensivas para parsear respuestas externas:

1. **Nunca asumir la presencia de un campo**: usar `.get()` con defaults explícitos
2. **Nunca asumir el tipo**: validar y convertir explícitamente
3. **Loguear siempre la respuesta raw** en desarrollo y staging
4. **Manejar el caso de éxito parcial**: algunas APIs retornan 200 con errores en el body

Integrar APIs de terceros con resiliencia no es complejidad innecesaria. Es la diferencia entre un sistema que duerme y uno que te despierta.
