## Documentacion para la API de Calomentor

### POST “{{URL}}/time-slot”

Descripción: Agrega timeslots para un día y mentor específico.

**Body:**

```bash
{
    user_id: ID del mentor (Obligatorio / string),
    slot_date: Fecha del slot (el mes esta basado en las posiciones del array empezando con enero en 00) (Obligatorio / string),
    slots: Slots de tiempo con hora de inicio de cada slot (Obligatorio / array de objetos / keys "time: string" y "is_occupied: boolean")
}
```

**Respuesta:**

Array de objetos, donde cada objeto devuelve:

```bash
{
    message: string,
}
```

Nota: se validará que para este usuario y esa fecha no exista ningun slot agregado, si existe utilizar endpoint update

**Ejemplo:**

```js
fetch("http://localhost:3000/dev/time-slot", {
  method: "POST",
  body: JSON.stringify({
    user_id: "3",
    slot_date: "14/11/2021",
    slots: [
      {
        time: "12:00",
        is_occupied: false,
      },
      {
        time: "13:00",
        is_occupied: false,
      },
    ],
  }),
}).then("// Manejo de Respuesta");
```

### GET "{{URL}}/time-slot/{{user_id}}"

Descripción: Busca todos los slots para un usuario y fecha específica

**Parámetros:**

Enviados por URL como query param

- slot_date: Fecha a buscar (Opcional, por defecto null, trae todos los slots para el user_id )

**Respuesta:**

```bash
{
  message: string,
  data: array de los slots encontrados
}
```

Nota: Recordar que en el mes se utiliza enero como 0 y hasta el 11 que sería diciembre.

**Ejemplo:**

```js
fetch("http://localhost:3000/dev/time-slot/2?slot_date=14/11/2021", {
  method: "GET",
}).then("// Manejo de Respuesta");
```

### PATCH "{{URL}}/time-slot"

Descripción: Actualiza el slot con un id específico

**Body**

```bash
{
  id: string,
  slot: objeto con el slot a actualizar
}
```

**Respuesta:**

```bash
{
  message: string,
  data: objeto con el slot actualizado
}
```

**Ejemplo:**

```js
fetch("http://localhost:3000/dev/time-slot", {
  method: "PATCH",
  body: JSON.stringify({
    id: "52a26576-d102-4c2b-a4ed-d9a5ac6c423e",
    slot: {
      time: "12:00",
      is_occupied: true,
    },
  }),
}).then("// Manejo de Respuesta");
```
