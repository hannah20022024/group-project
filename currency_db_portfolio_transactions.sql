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
-- Table structure for table `portfolio_transactions`
--

DROP TABLE IF EXISTS `portfolio_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolio_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(10) NOT NULL,
  `shares` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `type` enum('buy','sell') NOT NULL,
  `transaction_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `portfolio_transactions_chk_1` CHECK ((`shares` > 0)),
  CONSTRAINT `portfolio_transactions_chk_2` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio_transactions`
--

LOCK TABLES `portfolio_transactions` WRITE;
/*!40000 ALTER TABLE `portfolio_transactions` DISABLE KEYS */;
INSERT INTO `portfolio_transactions` VALUES (16,'AAPL',50,178.00,'buy','2025-07-29 00:00:00'),(17,'BYD',30,250.00,'buy','2025-07-29 00:00:00'),(18,'JNJ',40,320.00,'buy','2025-07-29 00:00:00'),(19,'PFE',40,70.00,'buy','2025-07-29 00:00:00'),(20,'NVDA',50,360.00,'buy','2025-07-29 00:00:00'),(29,'AAPL',3,214.05,'sell','2025-07-29 00:00:00'),(30,'AAPL',3,214.05,'buy','2025-07-29 00:00:00'),(31,'AAPL',5,214.05,'buy','2025-07-29 00:00:00'),(32,'AAPL',5,214.05,'sell','2025-07-29 00:00:00'),(33,'AAPL',5,214.05,'sell','2025-07-29 00:00:00'),(34,'AAPL',5,214.05,'buy','2025-07-29 00:00:00');
/*!40000 ALTER TABLE `portfolio_transactions` ENABLE KEYS */;
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
