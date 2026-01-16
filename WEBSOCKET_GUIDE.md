# Guía de WebSocket para Notificaciones en Tiempo Real

## Descripción General

El sistema de notificaciones utiliza **Socket.IO** para comunicación en tiempo real entre el servidor y los clientes. Esto permite que los administradores reciban notificaciones instantáneas cuando se crean nuevas solicitudes, y que los clientes reciban actualizaciones sobre sus solicitudes.

## Tipos de Solicitudes Disponibles

1. **`add_data`** - Agregar GB a un plan existente
2. **`activate_antenna`** - Dar de alta una antena
3. **`deactivate_antenna`** - Dar de baja una antena
4. **`suspend_antenna`** - Suspender una antena temporalmente
5. **`change_plan`** - Cambiar el plan de una antena

## Instalación en el Cliente

### Frontend (React/Vue/JavaScript)

```bash
npm install socket.io-client
```

## Conexión al Servidor WebSocket

### Ejemplo básico en JavaScript/React

```javascript
import { io } from "socket.io-client";

// Conectar al servidor
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true,
});

// Cuando se establece la conexión
socket.on("connect", () => {
  console.log("✅ Conectado al servidor WebSocket");

  // Unirse a la sala correspondiente según el rol del usuario
  const userId = "USER_ID_AQUI"; // Obtener del contexto de autenticación
  const role = "admin"; // o 'user'

  socket.emit("join", { userId, role });
});

// Escuchar notificaciones
socket.on("notification", (notification) => {
  console.log("📬 Nueva notificación:", notification);

  // Mostrar la notificación al usuario
  // Puedes usar una librería como react-toastify, antd notification, etc.
  showNotification(notification);
});

// Manejo de desconexión
socket.on("disconnect", () => {
  console.log("❌ Desconectado del servidor WebSocket");
});

// Manejo de errores
socket.on("connect_error", (error) => {
  console.error("❌ Error de conexión:", error);
});
```

### Ejemplo en React con Context

```javascript
// SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children, userId, userRole }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Crear conexión
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Conectado al servidor WebSocket");
      setConnected(true);

      // Unirse a la sala correspondiente
      newSocket.emit("join", { userId, role: userRole });
    });

    newSocket.on("notification", (notification) => {
      console.log("📬 Nueva notificación:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Desconectado");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, userRole]);

  return (
    <SocketContext.Provider value={{ socket, notifications, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket debe usarse dentro de SocketProvider");
  }
  return context;
};
```

```javascript
// App.js
import { SocketProvider } from "./SocketContext";

function App() {
  const user = getCurrentUser(); // Obtener usuario autenticado

  return (
    <SocketProvider userId={user.id} userRole={user.role}>
      <YourApp />
    </SocketProvider>
  );
}
```

```javascript
// Component.js
import { useSocket } from "./SocketContext";

function AdminDashboard() {
  const { notifications, connected } = useSocket();

  return (
    <div>
      <div>Estado: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</div>
      <h2>Notificaciones ({notifications.length})</h2>
      {notifications.map((notif, index) => (
        <div key={index}>
          <p>{notif.message}</p>
          <small>{new Date(notif.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

## Estructura de Notificaciones

### Notificación de Nueva Solicitud (Para Administradores)

```javascript
{
  type: "new_request",
  message: "Nueva solicitud: Cambiar plan",
  request: {
    id: "673a1234567890abcdef",
    type: "change_plan",
    client: "673a0987654321fedcba",
    status: "pending",
    createdAt: "2025-11-17T12:00:00.000Z"
  },
  timestamp: "2025-11-17T12:00:00.000Z"
}
```

### Notificación de Actualización (Para Clientes)

```javascript
{
  type: "request_update",
  message: "Tu solicitud ha sido actualizada: En proceso",
  request: {
    id: "673a1234567890abcdef",
    type: "change_plan",
    status: "in_progress",
    updatedAt: "2025-11-17T12:05:00.000Z"
  },
  timestamp: "2025-11-17T12:05:00.000Z"
}
```

### Notificación de Cambio de Estado (Para Clientes)

```javascript
{
  type: "request_status_change",
  message: "El estado de tu solicitud cambió de \"Pendiente\" a \"En proceso\"",
  request: {
    id: "673a1234567890abcdef",
    type: "change_plan",
    status: "in_progress",
    previousStatus: "pending",
    updatedAt: "2025-11-17T12:05:00.000Z"
  },
  timestamp: "2025-11-17T12:05:00.000Z"
}
```

## Salas (Rooms)

El sistema utiliza salas de Socket.IO para dirigir las notificaciones:

- **`admins`**: Todos los usuarios con rol de administrador se unen a esta sala
- **`user_{userId}`**: Cada usuario tiene su propia sala personal (ej: `user_673a0987654321fedcba`)

### Cómo unirse a una sala

```javascript
// Al conectar, emitir evento 'join' con los datos del usuario
socket.emit("join", {
  userId: "673a0987654321fedcba",
  role: "admin", // o 'user'
});
```

## Eventos del Cliente

### `join`

Unirse a la sala correspondiente según el rol

```javascript
socket.emit("join", {
  userId: string, // ID del usuario
  role: string, // 'admin' o 'user'
});
```

## Eventos del Servidor

### `notification`

El servidor emite notificaciones cuando:

- Se crea una nueva solicitud → a `admins`
- Se actualiza una solicitud → al cliente específico
- Cambia el estado de una solicitud → al cliente específico

```javascript
socket.on("notification", (data) => {
  // Manejar la notificación
  console.log(data);
});
```

## Ejemplo de Creación de Solicitud

### Solicitud de Cambio de Plan

```javascript
fetch("http://localhost:3000/requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "change_plan",
    client: "673a0987654321fedcba",
    antenna: "673a1111111111111111",
    additionalData: {
      planToAssign: "673a2222222222222222",
      reason: "Necesito más velocidad",
      notes: "Por favor procesar lo antes posible",
    },
    comments: "Cliente solicita upgrade de plan",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Solicitud creada:", data);
    // Los administradores recibirán automáticamente una notificación WebSocket
  });
```

### Solicitud de Suspender Antena

```javascript
fetch("http://localhost:3000/requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "suspend_antenna",
    client: "673a0987654321fedcba",
    antenna: "673a1111111111111111",
    additionalData: {
      reason: "Ausente por vacaciones",
      notes: "Del 20 al 30 de noviembre",
    },
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Solicitud creada:", data);
  });
```

### Solicitud de Activar Antena

```javascript
fetch("http://localhost:3000/requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "activate_antenna",
    client: "673a0987654321fedcba",
    antenna: "673a1111111111111111",
    additionalData: {
      planToAssign: "673a2222222222222222",
      notes: "Nueva instalación",
    },
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Solicitud creada:", data);
  });
```

## Testing de WebSocket

### Usando el navegador (Console)

```javascript
// En la consola del navegador
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Conectado!");
  socket.emit("join", { userId: "test123", role: "admin" });
});

socket.on("notification", (data) => {
  console.log("Notificación recibida:", data);
});
```

### Usando Postman o Thunder Client

1. Crear una nueva solicitud POST a `http://localhost:3000/requests`
2. Tener abierta una conexión WebSocket escuchando notificaciones
3. Al crear la solicitud, verificar que se recibe la notificación

## Notas Importantes

1. **CORS**: En producción, configura el origen permitido en `socket.service.js`:

   ```javascript
   cors: {
     origin: "https://tu-dominio.com",
     methods: ["GET", "POST"]
   }
   ```

2. **Autenticación**: Considera agregar autenticación JWT a las conexiones WebSocket:

   ```javascript
   io.use((socket, next) => {
     const token = socket.handshake.auth.token;
     // Verificar token
     next();
   });
   ```

3. **Persistencia**: Las notificaciones solo se envían a clientes conectados. Para notificaciones persistentes, considera guardarlas en la base de datos.

4. **Reconexión**: Socket.IO maneja la reconexión automáticamente, pero puedes personalizarla:
   ```javascript
   const socket = io("http://localhost:3000", {
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 1000,
   });
   ```

## Problemas Comunes

### El cliente no recibe notificaciones

- Verificar que el cliente se haya unido a la sala correcta con `socket.emit('join', ...)`
- Verificar que el `userId` y `role` sean correctos
- Revisar la consola del servidor para ver los logs de conexión

### Error de CORS

- Configurar correctamente el origen en `socket.service.js`
- Asegurarse de que el frontend esté en la lista de orígenes permitidos

### Múltiples notificaciones duplicadas

- Evitar crear múltiples instancias de socket
- Limpiar las conexiones en `useEffect` cleanup
