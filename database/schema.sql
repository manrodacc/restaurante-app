
CREATE DATABASE IF NOT EXISTS restaurante_db;
USE restaurante_db;

-- TABLA ESTADO PEDIDO
CREATE TABLE IF NOT EXISTS estado_pedido (
	id_estado INT AUTO_INCREMENT PRIMARY KEY,
	nombre_estado VARCHAR(50) NOT NULL
);

INSERT INTO estado_pedido (nombre_estado) VALUES 
('Pendiente'), ('En cocina'), ('Listo'), ('Asignado'), ('En camino'), ('Llegó'), ('Entregado')
ON DUPLICATE KEY UPDATE nombre_estado=VALUES(nombre_estado);

-- TABLA USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
	id_usuario INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	correo VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
	telefono VARCHAR(20),
	rol ENUM('admin', 'cliente', 'repartidor') DEFAULT 'cliente',
	lat DECIMAL(10, 8),
	lng DECIMAL(11, 8),
	estado TINYINT DEFAULT 1
);

-- TABLA PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
	id_producto INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion TEXT,
	precio DECIMAL(10, 2) NOT NULL,
	imagen VARCHAR(255),
	estado TINYINT DEFAULT 1
);

-- TABLA PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
	id_pedido INT AUTO_INCREMENT PRIMARY KEY,
	id_usuario INT NOT NULL,
	id_repartidor INT DEFAULT NULL,
	id_estado INT DEFAULT 1,
	fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
	direccion TEXT NOT NULL,
	metodo_pago VARCHAR(50),
	total DECIMAL(10, 2) DEFAULT 0.00,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_repartidor) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_estado) REFERENCES estado_pedido(id_estado)
);

-- TABLA DETALLE PEDIDO
CREATE TABLE IF NOT EXISTS detalle_pedido (
	id_detalle INT AUTO_INCREMENT PRIMARY KEY,
	id_pedido INT NOT NULL,
	id_producto INT NOT NULL,
	cantidad INT NOT NULL,
	FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
	FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- TABLA PAGOS
CREATE TABLE IF NOT EXISTS pagos (
	id_pago INT AUTO_INCREMENT PRIMARY KEY,
	id_pedido INT NOT NULL,
	metodo_pago VARCHAR(50),
	monto DECIMAL(10, 2),
	estado VARCHAR(50) DEFAULT 'completado',
	FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);

-- Insertar Admin por defecto (password: admin123)
INSERT INTO usuarios (nombre, correo, password, rol) 
VALUES ('Admin', 'admin@restaurante.com', '$2a$10$XQ9jO1M2N3K4L5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F', 'admin')
ON DUPLICATE KEY UPDATE correo=correo;
