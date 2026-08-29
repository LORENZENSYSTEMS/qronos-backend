# CLAUDE.md

## Regla fundamental

- Los principios SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) deben cumplirse **siempre, sin excepción**, en todo el código que se escriba o modifique en este repositorio.

## Convención de nombres

Los nombres en el código deben verse limpios y consistentes. Aplica **siempre, sin excepción**:

- **`camelCase`** para variables, funciones y métodos: `horaInicio`, `empresaId`, `getCanchasByEmpresa`.
- **`PascalCase`** para clases, y para los archivos que definen clases: `CanchaService`, `CanchaController.js`, `CanchaRepository.js`.
- **`PascalCase`** para carpetas de módulos: `src/routes/Cancha/`, `src/routes/Mesa/`, `src/routes/Cliente/`.
- **`UPPER_SNAKE_CASE`** para constantes.
- Los campos de Base de Datos (Prisma) se respetan tal cual vienen (`empresa_id`, `hora_inicio`). NUNCA se renombran los campos de datos; se acceden con `data.empresa_id` y se trasladan a variables `camelCase` apenas se reciben: `const empresaId = data.empresa_id`.
- Está prohibido el `snake_case` en identificadores de código (variables, funciones, métodos, clases). Si aparece `snake_case`, es un identificador de datos externo o un campo de BD, no un nombre de código.