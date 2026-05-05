# Elevando el Nivel de Validación en LibraryManager

Para igualar la robustez y limpieza de `uptask-MERN`, vamos a refactorizar el flujo de validación de `libraryManager` utilizando componentes compartidos, TanStack Query y un manejo de errores centralizado.

## Cambios Propuestos

### Componentes Compartidos
#### [NEW] [ErrorMessage.tsx](file:///c:/Users/Aless_UDC/Desktop/libraryManager/frontend/src/components/ErrorMessage.tsx)
Crear un componente reutilizable para mostrar errores de validación con un diseño consistente (rojo, tipografía pequeña, animaciones).

### Capa de API
#### [MODIFY] [auth.ts](file:///c:/Users/Aless_UDC/Desktop/libraryManager/frontend/src/api/auth.ts)
Refactorizar las llamadas a Axios para que capturen el error del backend (NestJS envía un array de mensajes o un string) y lancen un `Error` limpio. Esto permite que TanStack Query gestione el estado de error automáticamente.

### Formularios (Registro)
#### [MODIFY] [RegisterForm.tsx](file:///c:/Users/Aless_UDC/Desktop/libraryManager/frontend/src/components/auth/register/RegisterForm.tsx)
1. Reemplazar el estado manual `isSubmitting` por `useMutation` de `@tanstack/react-query`.
2. Mover la lógica de `toast` (éxito/error) a los callbacks `onSuccess` y `onError` de la mutación.
3. Simplificar la función `onSubmit`.

#### [MODIFY] [PersonalData.tsx](file:///c:/Users/Aless_UDC/Desktop/libraryManager/frontend/src/components/auth/register/PersonalData.tsx)
Reemplazar los `<span>` de error manuales por el nuevo componente `<ErrorMessage />`.

## Plan de Verificación

### Pruebas Manuales
1. **Validación Frontend**: Intentar enviar el formulario vacío y verificar que `<ErrorMessage />` se muestre correctamente.
2. **Validación Backend**: Intentar registrar un usuario con un email que ya existe. El backend devolverá un 400 o 409, la capa de API lanzará el error y el `toast` del `onError` de la mutación lo mostrará.
3. **Estado de Carga**: Verificar que el botón se deshabilite mientras `isPending` de la mutación sea true.
