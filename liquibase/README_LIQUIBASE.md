# 🏛️ Liquibase en ParkFlow 2099 - Control de Versiones de Base de Datos

Este módulo implementa **Liquibase** como el estándar corporativo para el versionamiento, migración y montaje determinista de la base de datos MySQL / MariaDB (`parkflow_db`) de ParkFlow.

---

## 🚀 ¿Qué es Liquibase y por qué se usa en ParkFlow?

Liquibase es una herramienta líder en la industria que permite:
1. **Control de Cambios Declarativo**: Cada modificación estructural (tablas, columnas, índices) y datos semilla se define en **ChangeSets** inmutables.
2. **Trazabilidad & Auditoría**: Registra en la tabla `DATABASECHANGELOG` cada cambio ejecutado, autor, fecha exacta, suma de verificación MD5 (`MD5SUM`) y tiempo de ejecución.
3. **Control de Concurrencia**: La tabla `DATABASECHANGELOGLOCK` previene que múltiples instancias o despliegues simultáneos corrompan el esquema.
4. **Rollback Seguro**: Cada migración incluye instrucciones declarativas de reversión.
5. **Independencia de Entorno**: Funciona idénticamente en desarrollo local (XAMPP), servidores staging, contenedores Docker y producción.

---

## 📁 Estructura del Módulo

```text
ParkFlow/
├── montar_base_datos.bat               # Acceso rápido en raíz para montar la DB con 1 clic
└── liquibase/
    ├── changelog/
    │   ├── changelog-master.xml        # Master Changelog oficial en formato XML
    │   ├── changelog-master.sql        # Master Changelog alternativo en Formatted SQL
    │   ├── v1.0.0/
    │   │   ├── 01-create-schema-and-tables.xml     # Creación de tablas base (cells, tariffs, etc.)
    │   │   ├── 02-seed-tariffs-and-settings.xml    # Tarifas y configuración
    │   │   ├── 03-seed-cells.xml                   # Carga de 50 celdas (Zona A y Zona B)
    │   │   ├── 04-seed-users.xml                   # Usuarios, contraseñas BCRYPT y firmas SHA-256
    │   │   ├── 05-seed-movements-and-transactions.xml # Auditoría y tickets históricos
    │   │   └── 06-create-indexes.xml               # Índices de alta concurrencia
    │   └── v1.1.0/
    │       └── 01-add-shift-operators.xml          # Extensión para Operadores de Turno
    ├── liquibase.properties           # Archivo de propiedades de conexión JDBC
    ├── pom.xml                        # Configuración Maven con liquibase-maven-plugin
    ├── docker-compose.yml             # Despliegue con contenedor oficial liquibase/liquibase
    ├── ejecutar_liquibase.bat         # Script interactivo de ejecución para Windows
    ├── liquibase_status.bat           # Consulta de estado de cambios pendientes
    ├── liquibase_rollback.bat         # Reversión de ChangeSets
    └── run_migrations.php             # Motor nativo PHP de Liquibase (compatible con XAMPP)
```

---

## 🛠️ Métodos para Ejecutar las Migraciones

### Método 1: Doble Clic en Windows (El más rápido)
1. Abre la carpeta `ParkFlow` y haz doble clic en `montar_base_datos.bat` (o en `liquibase/ejecutar_liquibase.bat`).
2. El script detectará automáticamente MySQL en el puerto 3306 y aplicará todos los ChangeSets pendientes.

### Método 2: Con Maven y Java
Si tienes Apache Maven y Java instalados:
```bash
cd ParkFlow/liquibase
mvn liquibase:update
```
Para ver el estado de las migraciones:
```bash
mvn liquibase:status
```
Para revertir el último cambio:
```bash
mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

### Método 3: Con la API REST de PHP
Puedes invocar la migración directamente desde tu navegador o frontend:
- **Ejecutar migraciones**: `http://localhost/parkflow-api/liquibase_migrate.php?action=migrate`
- **Ver historial y estado**: `http://localhost/parkflow-api/liquibase_migrate.php?action=status`

### Método 4: Con Docker
```bash
cd ParkFlow/liquibase
docker compose run --rm liquibase update
```

---

## 🔍 Tablas de Sistema Creadas por Liquibase

Una vez montada la base de datos, en `parkflow_db` encontrarás:
- **`DATABASECHANGELOG`**:
  | ID | AUTHOR | FILENAME | DATEEXECUTED | ORDEREXECUTED | EXECTYPE | MD5SUM |
  |----|--------|----------|--------------|---------------|----------|--------|
  | v1.0.0-01-create-tables | parkflow-dev | changelog-master.sql | 2026-11-04 ... | 1 | EXECUTED | 9:... |
  | v1.0.0-02-seed-tariffs-and-settings | parkflow-dev | changelog-master.sql | 2026-11-04 ... | 2 | EXECUTED | 9:... |
  | ... | ... | ... | ... | ... | ... | ... |

- **`DATABASECHANGELOGLOCK`**:
  Garantiza que ningún otro proceso pueda escribir o migrar simultáneamente mientras se aplican cambios.
