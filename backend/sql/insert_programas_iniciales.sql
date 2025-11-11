-- Script para actualizar usuarios existentes con los campos faltantes
-- Ejecutar este script en phpMyAdmin

-- Actualizar usuario 1: Ana Martínez (Administrador)
UPDATE usuarios 
SET 
    telefono = '3001234567',
    direccion = 'Calle 100 #15-20, Bogotá',
    programa = 'Administración Institucional'
WHERE id = 1;

-- Actualizar usuario 2: Carlos Gómez (Director de Programa Académico)
UPDATE usuarios 
SET 
    telefono = '3109876543',
    direccion = 'Carrera 7 #45-30, Bogotá',
    programa = 'Ingeniería de Sistemas'
WHERE id = 2;

-- Actualizar usuario 3: Laura Ruiz (Profesor)
UPDATE usuarios 
SET 
    telefono = '3156789012',
    direccion = 'Avenida Caracas #80-10, Bogotá',
    programa = 'Ingeniería de Sistemas'
WHERE id = 3;

-- Actualizar usuario 4: Diego Torres (Estudiante) - ya tiene datos
UPDATE usuarios 
SET 
    telefono = COALESCE(telefono, '3171111111'),
    direccion = COALESCE(direccion, 'Calle 123 #45-67, Bogotá'),
    programa = COALESCE(programa, 'Ingeniería de Sistemas')
WHERE id = 4;

-- Verificar los cambios
SELECT id, nombre, correo, rol, programa, telefono, direccion
FROM usuarios
ORDER BY id;

