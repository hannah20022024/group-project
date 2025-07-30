-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: currency_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `stock_pool`
--

DROP TABLE IF EXISTS `stock_pool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_pool` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(10) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `description` text,
  `current_price` decimal(10,2) DEFAULT NULL,
  `last_updated` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `symbol` (`symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_pool`
--

LOCK TABLES `stock_pool` WRITE;
/*!40000 ALTER TABLE `stock_pool` DISABLE KEYS */;
INSERT INTO `stock_pool` VALUES (1,'AAPL','Apple Inc.','Technology','Consumer electronics, software, and services',192.34,'2025-07-26'),(2,'NVDA','NVIDIA Corp.','Technology','Leader in GPU and AI chips',128.50,'2025-07-26'),(3,'JNJ','Johnson & Johnson','Medicine','Pharmaceuticals, medical devices, and consumer health',162.12,'2025-07-26'),(4,'PFE','Pfizer Inc.','Medicine','Global pharmaceutical company',34.89,'2025-07-26'),(5,'PLD','Prologis Inc.','Estate','Global leader in logistics real estate',123.45,'2025-07-26'),(6,'O','Realty Income Corp.','Estate','Monthly dividend REIT investing in retail and commercial real estate',59.87,'2025-07-26'),(19,'BIDU','Baidu Inc.','Technology','China - Search and AI, NASDAQ ADR',115.20,'2025-07-26'),(20,'BYD','BYD Electronic','Healthcare','China - Medical electronics, HKEX',28.10,'2025-07-26'),(21,'1109.HK','China Resources Land','Real Estate','China - Residential/commercial RE, HKEX',32.70,'2025-07-26');
/*!40000 ALTER TABLE `stock_pool` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-29  8:15:05
