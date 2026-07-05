-- =============================================
-- SCHEMA PARA SUPABASE (PostgreSQL)
-- Migrado desde MySQL
-- =============================================

-- TABLA ESTADO PEDIDO
CREATE TABLE IF NOT EXISTS estado_pedido (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL
);

INSERT INTO estado_pedido (nombre_estado) VALUES 
('Pendiente'), ('En cocina'), ('Listo'), ('Asignado'), ('En camino'), ('Llegó'), ('Entregado')
ON CONFLICT DO NOTHING;

-- TABLA USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol TEXT DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente', 'repartidor')),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    estado SMALLINT DEFAULT 1
);

-- TABLA PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen VARCHAR(255),
    estado SMALLINT DEFAULT 1
);

-- TABLA PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    id_repartidor INT DEFAULT NULL REFERENCES usuarios(id_usuario),
    id_estado INT DEFAULT 1 REFERENCES estado_pedido(id_estado),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion TEXT NOT NULL,
    metodo_pago VARCHAR(50),
    total DECIMAL(10, 2) DEFAULT 0.00
);

-- TABLA DETALLE PEDIDO
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_producto INT NOT NULL REFERENCES productos(id_producto),
    cantidad INT NOT NULL
);

-- TABLA PAGOS
CREATE TABLE IF NOT EXISTS pagos (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    metodo_pago VARCHAR(50),
    monto DECIMAL(10, 2),
    estado VARCHAR(50) DEFAULT 'completado'
);

-- Insertar Admin por defecto (password: admin123)
-- Nota: Deberás actualizar este hash después de registrar el admin desde la app
INSERT INTO usuarios (nombre, correo, password, rol) 
VALUES ('Admin', 'admin@restaurante.com', '$2a$10$XQ9jO1M2N3K4L5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F', 'admin')
ON CONFLICT (correo) DO NOTHING;
