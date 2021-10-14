## Documentacion para la API de Calomentor

### POST “{{URL}}/time-slot”

Descripción: Agrega timeslots para un día y mentor específico.

**Body:**

```bash
{
    user_id: ID del mentor (Obligatorio / string),
    slot_date: Fecha del slot (el mes esta basado en las posiciones del array empezando con enero en 00) (Obligatorio / string),
    slot_time: Horario del slot (Obligatorio / string),
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
    user_id: "364256538056982528",
    slot_date: "31/11/2021",
    slot_time: "16:00",
  }),
}).then("// Manejo de Respuesta");
```

### GET "{{URL}}/time-slot/{{id}}"

Descripción: Busca el slot por id

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
fetch(
  "http://localhost:3000/dev/time-slot/8e40ecda-9e82-4843-922a-a4a71302b630",
  {
    method: "GET",
  }
).then("// Manejo de Respuesta");
```

### GET "{{URL}}/time-slot/user/{{user_id}}"

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
fetch(
  "http://localhost:3000/dev/time-slot/user/8e40ecda-9e82-4843-922a-a4a71302b630?slot_date=14/11/2021",
  {
    method: "GET",
  }
).then("// Manejo de Respuesta");
```

### PATCH "{{URL}}/time-slot"

Descripción: Actualiza el slot con un id específico

**Body**

```bash
{
  id: string,
  is_occupied: bool
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
    is_occupied: true,
  }),
}).then("// Manejo de Respuesta");
```

### DELETE "{{URL}}/time-slot/{{slot_id}}"

Descripción: elimina el slot con un id específico

**Respuesta:**

```bash
{
  message: string,
}
```

**Ejemplo:**

```js
fetch(
  "http://localhost:3000/dev/time-slot/52a26576-d102-4c2b-a4ed-d9a5ac6c423e",
  {
    method: "DELETE",
  }
).then("// Manejo de Respuesta");
```

### POST "{{URL}}/sf/mentorship"

Descripción: Crea la mentoria y dispara los eventos de confirmacion y recordatorios 2 hs antes de la mentoria

**Body**

```bash
{
    mentor_id: string, //id discord
    mentee_id: string, //id discord
    mentee_name: string,
    mentee_username_discord: string,
    mentee_email: string,
    info: string, // opcional
    time_slot_id: string,
    time_slot_time: hora en utc 0
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
fetch("http://localhost:3000/dev/sf/mentorship", {
  method: "POST",
  body: JSON.stringify({
    mentor_id: "706602792005140532",
    mentee_id: "123123",
    mentee_name: "Fran",
    mentee_username_discord: "Fran",
    mentee_email: "fran.mper@gmail.com",
    info: "",
    time_slot_id: "7f21711d-8423-4053-9f43-c3d1071429c6",
    time_slot_time: "21:05",
  }),
}).then("// Manejo de Respuesta");
```
