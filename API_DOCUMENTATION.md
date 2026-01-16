# API SL IEA - Sistema de Gestión de Antenas

## 📋 Estructura del Proyecto

```
api/
├── auth/              # Autenticación y usuarios (clientes)
│   ├── auth.model.js
│   ├── auth.dao.js
│   ├── auth.controller.js
│   └── auth.routes.js
├── supplier/          # Proveedores de servicios
│   ├── supplier.model.js
│   ├── supplier.dao.js
│   ├── supplier.controller.js
│   └── supplier.routes.js
├── plan/              # Planes de datos
│   ├── plan.model.js
│   ├── plan.dao.js
│   ├── plan.controller.js
│   └── plan.routes.js
├── antenna/           # Antenas
│   ├── antenna.model.js
│   ├── antenna.dao.js
│   ├── antenna.controller.js
│   └── antenna.routes.js
├── db/
│   └── database.js
├── config.js
└── server.js
```

## 🚀 Endpoints de la API

### 🔐 Autenticación (`/auth`)

#### Registrar Usuario/Cliente

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123",
  "telefono": "123456789",
  "direccion": "Calle Falsa 123",
  "dni": "12345678"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

---

### 🏢 Suppliers (`/suppliers`)

#### Crear Supplier

```http
POST /suppliers
Content-Type: application/json

{
  "name": "Starlink",
  "contact": "Elon Musk",
  "email": "starlink@ejemplo.com",
  "phone": "987654321"
}
```

#### Obtener Todos los Suppliers

```http
GET /suppliers
GET /suppliers?active=true
```

#### Obtener Supplier por ID

```http
GET /suppliers/:id
```

#### Actualizar Supplier

```http
PUT /suppliers/:id
Content-Type: application/json

{
  "phone": "111222333"
}
```

#### Eliminar Supplier

```http
DELETE /suppliers/:id
```

---

### 📦 Plans (`/plans`)

#### Crear Plan

```http
POST /plans
Content-Type: application/json

{
  "name": "Plan Básico",
  "supplier": "67xxxxxxxxxxxxx",
  "dataAmount": "50GB",
  "price": 5000,
  "description": "Plan ideal para navegación básica"
}
```

#### Obtener Todos los Plans

```http
GET /plans
GET /plans?supplier=67xxxxxxxxxxxxx
GET /plans?active=true
```

#### Obtener Plans por Supplier

```http
GET /plans/supplier/:supplierId
```

#### Obtener Plan por ID

```http
GET /plans/:id
```

#### Actualizar Plan

```http
PUT /plans/:id
Content-Type: application/json

{
  "price": 5500
}
```

#### Eliminar Plan

```http
DELETE /plans/:id
```

---

### 📡 Antennas (`/antennas`)

#### Crear Antenna

```http
POST /antennas
Content-Type: application/json

# Antenna en comodato
{
  "name": "Antena Casa Principal",
  "kitNumber": "KIT-001",
  "client": "67xxxxxxxxxxxxx",
  "supplier": "67xxxxxxxxxxxxx",
  "purchaseType": "comodato",
  "notes": "Instalada en el techo"
}

# Antenna comprada en un pago
{
  "name": "Antena Oficina",
  "kitNumber": "KIT-002",
  "client": "67xxxxxxxxxxxxx",
  "supplier": "67xxxxxxxxxxxxx",
  "purchaseType": "one_payment",
  "notes": "Compra en efectivo"
}

# Antenna en cuotas
{
  "name": "Antena Campo",
  "kitNumber": "KIT-003",
  "client": "67xxxxxxxxxxxxx",
  "supplier": "67xxxxxxxxxxxxx",
  "purchaseType": "installments",
  "totalInstallments": 12,
  "installmentAmount": 500,
  "notes": "12 cuotas mensuales"
}
```

#### Obtener Todas las Antennas

```http
GET /antennas
GET /antennas?status=active
GET /antennas?client=67xxxxxxxxxxxxx
GET /antennas?supplier=67xxxxxxxxxxxxx
```

#### Obtener Antennas por Cliente

```http
GET /antennas/client/:clientId
```

#### Obtener Antenna por Número de Kit

```http
GET /antennas/kit/:kitNumber
```

#### Obtener Antenna por ID

```http
GET /antennas/:id
```

#### Actualizar Antenna

```http
PUT /antennas/:id
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "notes": "Notas actualizadas"
}
```

#### Activar Antenna con un Plan

```http
PATCH /antennas/:id/activate
Content-Type: application/json

{
  "planId": "67xxxxxxxxxxxxx"
}
```

#### Desactivar Antenna

```http
PATCH /antennas/:id/deactivate
```

#### Registrar Pago de Cuota

```http
PATCH /antennas/:id/pay-installment
```

#### Eliminar Antenna

```http
DELETE /antennas/:id
```

---

## 📊 Modelos de Datos

### Usuario/Cliente

```javascript
{
  "_id": ObjectId,
  "username": String (único),
  "email": String (único),
  "password": String (hasheado),
  "telefono": String (opcional),
  "direccion": String (opcional),
  "dni": String (opcional, único),
  "activo": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Supplier

```javascript
{
  "_id": ObjectId,
  "name": String (único),
  "contact": String,
  "email": String (único),
  "phone": String,
  "active": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Plan

```javascript
{
  "_id": ObjectId,
  "name": String,
  "supplier": ObjectId (ref: Supplier),
  "dataAmount": String, // "50GB", "100GB", etc.
  "price": Number,
  "description": String,
  "active": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Antenna

```javascript
{
  "_id": ObjectId,
  "name": String (puede estar vacío),
  "kitNumber": String (único),
  "client": ObjectId (ref: User),
  "supplier": ObjectId (ref: Supplier),
  "purchaseType": String, // "comodato" | "one_payment" | "installments"
  "paidInstallments": Number,
  "totalInstallments": Number,
  "installmentAmount": Number,
  "status": String, // "active" | "inactive"
  "plan": ObjectId (ref: Plan), // null si está inactive
  "activationDate": Date,
  "deactivationDate": Date,
  "notes": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## 🔄 Flujo de Trabajo Típico

### 1. Configuración Inicial

```bash
# 1. Crear supplier
POST /suppliers
{
  "name": "Starlink",
  "email": "starlink@ejemplo.com",
  "phone": "123456789"
}

# 2. Crear planes para ese supplier
POST /plans
{
  "name": "Plan 50GB",
  "supplier": "<id_del_supplier>",
  "dataAmount": "50GB",
  "price": 5000
}
```

### 2. Registrar Cliente

```bash
POST /auth/register
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "pass123"
}
```

### 3. Registrar Antenna del Cliente

```bash
POST /antennas
{
  "kitNumber": "KIT-001",
  "client": "<id_del_cliente>",
  "supplier": "<id_del_supplier>",
  "purchaseType": "installments",
  "totalInstallments": 12,
  "installmentAmount": 500
}
```

### 4. Activar Antenna con un Plan

```bash
PATCH /antennas/<id_antenna>/activate
{
  "planId": "<id_del_plan>"
}
```

### 5. Registrar Pagos de Cuotas

```bash
# Cada mes, registrar el pago
PATCH /antennas/<id_antenna>/pay-installment
```

### 6. Consultar Antennas de un Cliente

```bash
GET /antennas/client/<id_cliente>
```

---

## ⚙️ Variables de Entorno (.env)

```env
PORT=3000
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h
DB_URI=mongodb://localhost:27017/db-sl-iea
```

---

## 🎯 Características Especiales

### Validaciones Automáticas

- ✅ Una antenna activada DEBE tener un plan asignado
- ✅ Si purchaseType es "installments", debe especificar totalInstallments > 0
- ✅ No se pueden pagar más cuotas de las totales
- ✅ Campos únicos: kitNumber, email (usuarios y suppliers), username

### Relaciones Automáticas

- 🔗 Las antennas se relacionan con clients, suppliers y plans
- 🔗 Los plans se relacionan con suppliers
- 🔗 Todas las consultas hacen `populate()` automáticamente

### Control de Cuotas

- 📊 Seguimiento de cuotas pagadas vs totales
- 💰 Registro de monto por cuota
- ✅ No permite pagar más cuotas de las necesarias

---

## 🧪 Comandos para Desarrollo

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Iniciar servidor en producción
npm start
```

---

## 📝 Notas Importantes

1. **Número de Kit**: Cada antenna debe tener un kitNumber único e irrepetible
2. **Estados de Antenna**: Solo pueden ser "active" o "inactive"
3. **Formas de Compra**: "comodato", "one_payment" o "installments"
4. **Autenticación**: Los endpoints están preparados para agregar middleware de autenticación JWT
5. **Soft Delete**: Todos los modelos tienen campo `active` para soft delete
