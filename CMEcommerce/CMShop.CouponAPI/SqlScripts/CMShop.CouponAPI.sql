-- Script SQL para CouponAPI
-- Database: CMShopping_coupon_api
-- Data: 2025-08-12

/*
Observações:
- Script compatível com SQL Server.
- Execute em um banco de dados existente (use CREATE DATABASE se necessário).
- Inclui dados de seed pré-definidos no código.
*/

-- USE master;
-- IF DB_ID(N'CMShopping_coupon_api') IS NULL
--     CREATE DATABASE CMShopping_coupon_api;
-- GO
-- USE CMShopping_coupon_api;
-- GO

/* Tabela de cupons baseada no modelo Coupon.cs */
IF OBJECT_ID(N'dbo.coupon', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.coupon (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_coupon PRIMARY KEY,
        coupon_code NVARCHAR(30) NOT NULL,
        discount_amount DECIMAL(18,2) NOT NULL
    );
END
GO

/* Índice único para garantir que não há códigos duplicados */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_coupon_coupon_code' AND object_id = OBJECT_ID(N'dbo.coupon'))
BEGIN
    CREATE UNIQUE INDEX IX_coupon_coupon_code ON dbo.coupon (coupon_code);
END
GO

/* Inserir dados de seed (baseados no OnModelCreating do SqlContext) */
IF NOT EXISTS (SELECT 1 FROM dbo.coupon WHERE id = 1)
BEGIN
    SET IDENTITY_INSERT dbo.coupon ON;
    
    INSERT INTO dbo.coupon (id, coupon_code, discount_amount)
    VALUES 
    (1, N'Claudio_2025_10', 10.00),
    (2, N'Matheus_2025_15', 15.00);
    
    SET IDENTITY_INSERT dbo.coupon OFF;
END
GO

/* Inserir cupons adicionais para teste */
IF NOT EXISTS (SELECT 1 FROM dbo.coupon WHERE coupon_code = N'PROMO2025')
BEGIN
    INSERT INTO dbo.coupon (coupon_code, discount_amount)
    VALUES 
    (N'PROMO2025', 25.00),
    (N'DESCONTO5', 5.00),
    (N'BLACKFRIDAY', 50.00),
    (N'NATAL2025', 20.00);
END
GO

/* Verificar dados inseridos */
SELECT 
    id,
    coupon_code,
    discount_amount
FROM dbo.coupon
ORDER BY id;
GO

PRINT 'Script executado com sucesso!';
PRINT 'Tabela: coupon criada';
PRINT 'Dados de seed inseridos';
GO
