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
-- Table structure for table `userhave`
--

DROP TABLE IF EXISTS `userhave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhave` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(10) NOT NULL,
  `shares` int NOT NULL,
  `buy_price` decimal(10,2) NOT NULL,
  `buy_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_purchase` (`symbol`,`buy_price`,`buy_date`),
  CONSTRAINT `userhave_ibfk_1` FOREIGN KEY (`symbol`) REFERENCES `stock_pool` (`symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userhave`
--

LOCK TABLES `userhave` WRITE;
/*!40000 ALTER TABLE `userhave` DISABLE KEYS */;
INSERT INTO `userhave` VALUES (34,'AAPL',40,180.00,'2025-06-01'),(35,'BYD',148,50.00,'2025-06-10'),(36,'JNJ',80,160.00,'2025-05-15'),(37,'PFE',40,70.00,'2025-07-01'),(38,'NVDA',90,200.00,'2025-07-10'),(44,'AAPL',10,214.05,'2025-07-29');
/*!40000 ALTER TABLE `userhave` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-29  8:15:04
