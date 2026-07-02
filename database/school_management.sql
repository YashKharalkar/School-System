CREATE DATABASE  IF NOT EXISTS `school_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `school_management`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: school_management
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `admin_tasks`
--

DROP TABLE IF EXISTS `admin_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `admin_tasks_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_tasks`
--

LOCK TABLES `admin_tasks` WRITE;
/*!40000 ALTER TABLE `admin_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `date` date NOT NULL,
  `status` enum('Present','Absent','Late') NOT NULL,
  `marked_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`date`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates_applications`
--

DROP TABLE IF EXISTS `certificates_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `purpose` text,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `certificates_applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates_applications`
--

LOCK TABLES `certificates_applications` WRITE;
/*!40000 ALTER TABLE `certificates_applications` DISABLE KEYS */;
INSERT INTO `certificates_applications` VALUES (1,150,'Bonafide Certificate','For higher education verification','Done','2026-07-02 09:29:41','2026-07-02 12:27:54'),(2,1,'Bonafide Certificate','Education loan verification','Done','2026-07-02 13:14:41','2026-07-02 15:35:46');
/*!40000 ALTER TABLE `certificates_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_fees`
--

DROP TABLE IF EXISTS `class_fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_fees` (
  `class` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_fees`
--

LOCK TABLES `class_fees` WRITE;
/*!40000 ALTER TABLE `class_fees` DISABLE KEYS */;
INSERT INTO `class_fees` VALUES ('10th',10000.00,'2026-07-02 07:35:28'),('1st',25000.00,'2026-07-02 07:35:17');
/*!40000 ALTER TABLE `class_fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `document_type` enum('Birth Certificate','Aadhar Card','Passport Photo','Address Proof','Medical Certificate','Transfer Certificate','Marksheet') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_timetable`
--

DROP TABLE IF EXISTS `exam_timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_timetable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class` varchar(10) NOT NULL,
  `section` varchar(5) DEFAULT 'A',
  `exam_name` varchar(100) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `effective_from` date DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `exam_timetable_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_timetable`
--

LOCK TABLES `exam_timetable` WRITE;
/*!40000 ALTER TABLE `exam_timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_payments`
--

DROP TABLE IF EXISTS `fee_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fee_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `receipt_no` varchar(50) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fee_id` (`fee_id`),
  CONSTRAINT `fee_payments_ibfk_1` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_payments`
--

LOCK TABLES `fee_payments` WRITE;
/*!40000 ALTER TABLE `fee_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structures`
--

DROP TABLE IF EXISTS `fee_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_structures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `fee_structures_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structures`
--

LOCK TABLES `fee_structures` WRITE;
/*!40000 ALTER TABLE `fee_structures` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fees`
--

DROP TABLE IF EXISTS `fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `total_fee` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT '0.00',
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fees`
--

LOCK TABLES `fees` WRITE;
/*!40000 ALTER TABLE `fees` DISABLE KEYS */;
/*!40000 ALTER TABLE `fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `target_classes` varchar(500) DEFAULT '["Everyone"]',
  `target_sections` varchar(500) DEFAULT '["Everyone"]',
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_logs`
--

DROP TABLE IF EXISTS `sms_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sent_by` int DEFAULT NULL,
  `class` varchar(10) DEFAULT NULL,
  `section` varchar(5) DEFAULT NULL,
  `recipients` text,
  `message` text NOT NULL,
  `status` enum('Sent','Failed','Pending') DEFAULT 'Sent',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sent_by` (`sent_by`),
  CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_logs`
--

LOCK TABLES `sms_logs` WRITE;
/*!40000 ALTER TABLE `sms_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `admission_no` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `parent_mobile` varchar(15) DEFAULT NULL,
  `address` text,
  `class` varchar(10) NOT NULL,
  `section` varchar(5) DEFAULT 'A',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `photo_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_no` (`admission_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,2,'269256','Meera Verma','Naresh Verma','Vijaya Verma','2019-10-04','Female','9449814902','90, Wyra, Telangana','1st','A','2026-06-28 17:47:08','2026-06-28 17:47:08',NULL),(2,3,'261876','Rishi Das','Dinesh Das','Shanti Das','2020-11-22','Male','9597383819','478, Madhira, Telangana','1st','A','2026-06-28 17:47:08','2026-06-28 17:47:08',NULL),(3,4,'266406','Vihaan Mehta','Prakash Mehta','Saroj Mehta','2019-08-22','Male','9487484366','395, Wyra, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(4,5,'263063','Pooja Jain','Vijay Jain','Kavita Jain','2020-04-04','Female','9848512275','435, Yellandu, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(5,6,'264407','Riya Mehta','Ganesh Mehta','Asha Mehta','2020-07-12','Female','9097895631','112, Kodamendhi, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(6,7,'269266','Diya Mishra','Satish Mishra','Rekha Mishra','2020-04-27','Female','9137425885','250, Yellandu, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(7,8,'262308','Priya Reddy','Rakesh Reddy','Radha Reddy','2020-09-20','Female','8999126035','371, Palvancha, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(8,9,'263124','Pranav Reddy','Prakash Reddy','Lata Reddy','2020-09-07','Male','8944514763','344, Wyra, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(9,10,'266754','Kiara Jain','Mahesh Jain','Poonam Jain','2019-07-15','Female','9094162060','43, Yellandu, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(10,11,'266022','Sanya Iyer','Mukesh Iyer','Poonam Iyer','2020-10-12','Female','9626641292','395, Yellandu, Telangana','1st','A','2026-06-28 17:47:09','2026-06-28 17:47:09',NULL),(11,12,'267323','Ayaan Rao','Suresh Rao','Shanti Rao','2020-10-18','Male','9696317875','273, Kodamendhi, Telangana','1st','A','2026-06-28 17:47:10','2026-06-28 17:47:10',NULL),(12,13,'267892','Arnav Shah','Rakesh Shah','Padma Shah','2019-04-15','Male','8954708254','435, Kothagudem, Telangana','1st','A','2026-06-28 17:47:10','2026-06-28 17:47:10',NULL),(13,14,'263688','Ayaan Verma','Harish Verma','Poonam Verma','2019-11-09','Male','9451970107','376, Wyra, Telangana','1st','A','2026-06-28 17:47:10','2026-06-28 17:47:10',NULL),(14,15,'266876','Rishi Iyer','Sanjay Iyer','Suman Iyer','2020-03-25','Male','8951901522','20, Wyra, Telangana','1st','A','2026-06-28 17:47:10','2026-06-28 17:47:10',NULL),(15,16,'262978','Aadhya Saxena','Ajay Saxena','Radha Saxena','2019-12-08','Female','9142005928','225, Manuguru, Telangana','1st','A','2026-06-28 17:47:10','2026-06-28 17:47:10',NULL),(16,17,'267850','Pranav Thakur','Mohan Thakur','Sunita Thakur','2018-05-07','Male','9395673762','83, Sathupalli, Telangana','2nd','A','2026-06-28 17:47:10','2026-06-28 17:47:10',NULL),(17,18,'262016','Reyansh Sharma','Suresh Sharma','Suman Sharma','2019-04-04','Male','8934076857','347, Palvancha, Telangana','2nd','A','2026-06-28 17:47:11','2026-06-28 17:47:11',NULL),(18,19,'261296','Kabir Saxena','Rajesh Saxena','Seema Saxena','2019-01-21','Male','9560966302','323, Bhadrachalam, Telangana','2nd','A','2026-06-28 17:47:11','2026-06-28 17:47:11',NULL),(19,20,'268267','Pooja Jain','Mahesh Jain','Vijaya Jain','2018-05-05','Female','9836152017','398, Sathupalli, Telangana','2nd','A','2026-06-28 17:47:11','2026-06-28 17:47:11',NULL),(20,21,'269207','Tanvi Saxena','Deepak Saxena','Savita Saxena','2019-06-12','Female','8993380608','189, Bhadrachalam, Telangana','2nd','A','2026-06-28 17:47:11','2026-06-28 17:47:11',NULL),(21,22,'266975','Dev Reddy','Mahesh Reddy','Saroj Reddy','2019-03-17','Male','9428009902','378, Khammam, Telangana','2nd','A','2026-06-28 17:47:11','2026-06-28 17:47:11',NULL),(22,23,'269125','Priya Sharma','Sanjay Sharma','Sunita Sharma','2019-05-27','Female','8898820751','444, Sathupalli, Telangana','2nd','A','2026-06-28 17:47:11','2026-06-28 17:47:11',NULL),(23,24,'265516','Jiya Kumar','Vijay Kumar','Kiran Kumar','2019-09-17','Female','9075633532','7, Palvancha, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(24,25,'266990','Sai Nair','Dinesh Nair','Kavita Nair','2019-12-26','Male','9715157717','50, Palvancha, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(25,26,'267925','Aarav Yadav','Mukesh Yadav','Savita Yadav','2018-06-09','Male','9094583294','221, Yellandu, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(26,27,'262789','Anika Patel','Anil Patel','Radha Patel','2019-01-15','Female','9815687169','81, Khammam, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(27,28,'263571','Kiara Nair','Naresh Nair','Vijaya Nair','2018-06-15','Female','9423449794','484, Madhira, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(28,29,'261214','Sanya Das','Mahesh Das','Suman Das','2018-03-25','Female','9752058037','64, Kothagudem, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(29,30,'262796','Kiara Rao','Ramesh Rao','Geeta Rao','2019-07-09','Female','9199453690','376, Khammam, Telangana','2nd','A','2026-06-28 17:47:12','2026-06-28 17:47:12',NULL),(30,31,'268693','Reyansh Mishra','Rakesh Mishra','Shanti Mishra','2018-05-07','Male','9866301738','147, Khammam, Telangana','2nd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(31,32,'262213','Arnav Iyer','Ganesh Iyer','Suman Iyer','2018-09-06','Male','9022869880','154, Bhadrachalam, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(32,33,'268044','Kiara Reddy','Rajesh Reddy','Padma Reddy','2017-09-02','Female','9083340831','140, Bhadrachalam, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(33,34,'266249','Pranav Shah','Ajay Shah','Neelam Shah','2018-11-14','Male','9429969756','84, Palvancha, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(34,35,'261909','Aadhya Yadav','Ramesh Yadav','Geeta Yadav','2017-06-23','Female','9688175004','415, Bhadrachalam, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(35,36,'269010','Tanvi Sharma','Deepak Sharma','Vijaya Sharma','2017-07-23','Female','9369233891','42, Bhadrachalam, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(36,37,'265236','Anika Chauhan','Satish Chauhan','Asha Chauhan','2017-05-27','Female','9475407901','493, Wyra, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(37,38,'262585','Tara Sharma','Deepak Sharma','Kiran Sharma','2017-12-04','Female','9136804002','460, Khammam, Telangana','3rd','A','2026-06-28 17:47:13','2026-06-28 17:47:13',NULL),(38,39,'262618','Myra Yadav','Vijay Yadav','Usha Yadav','2017-09-02','Female','9339166785','274, Manuguru, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(39,40,'265261','Aditya Thakur','Suresh Thakur','Usha Thakur','2018-11-26','Male','9536902229','162, Kothagudem, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(40,41,'264037','Priya Kumar','Mukesh Kumar','Neelam Kumar','2017-05-05','Female','8982275914','387, Palvancha, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(41,42,'262631','Aditya Singh','Sunil Singh','Neelam Singh','2017-04-08','Male','9047193995','496, Madhira, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(42,43,'261084','Yash Verma','Deepak Verma','Usha Verma','2017-04-07','Male','9447440382','435, Wyra, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(43,44,'263478','Rishi Iyer','Harish Iyer','Sunita Iyer','2017-08-16','Male','8884023648','76, Manuguru, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(44,45,'266632','Nisha Thakur','Mukesh Thakur','Sunita Thakur','2018-03-28','Female','9675895781','385, Kothagudem, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(45,46,'265402','Priya Pandey','Vijay Pandey','Sunita Pandey','2018-11-13','Female','9712026443','69, Kodamendhi, Telangana','3rd','A','2026-06-28 17:47:14','2026-06-28 17:47:14',NULL),(46,47,'269137','Ananya Pandey','Satish Pandey','Rekha Pandey','2016-11-06','Female','9888049458','375, Manuguru, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(47,48,'262074','Nisha Das','Rakesh Das','Neelam Das','2017-01-28','Female','9765480407','416, Palvancha, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(48,49,'264618','Shreya Kumar','Ramesh Kumar','Rekha Kumar','2017-02-25','Female','9532232803','256, Yellandu, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(49,50,'266934','Kartik Nair','Satish Nair','Neelam Nair','2017-08-14','Male','8850701813','101, Manuguru, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(50,51,'267717','Ishaan Das','Ganesh Das','Radha Das','2016-10-03','Male','9860847453','223, Palvancha, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(51,52,'265415','Vihaan Jain','Ganesh Jain','Saroj Jain','2017-04-25','Male','8845105956','95, Manuguru, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(52,53,'264481','Sanya Sharma','Sunil Sharma','Rekha Sharma','2016-05-04','Female','8971150892','474, Kothagudem, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(53,54,'268846','Ishaan Mehta','Sanjay Mehta','Savita Mehta','2016-08-19','Male','9358614793','428, Khammam, Telangana','4th','A','2026-06-28 17:47:15','2026-06-28 17:47:15',NULL),(54,55,'264416','Tanvi Shah','Mahesh Shah','Sunita Shah','2017-01-19','Female','9738917039','145, Bhadrachalam, Telangana','4th','A','2026-06-28 17:47:16','2026-06-28 17:47:16',NULL),(55,56,'263270','Isha Jain','Mukesh Jain','Saroj Jain','2017-04-21','Female','9598293615','488, Wyra, Telangana','4th','A','2026-06-28 17:47:16','2026-06-28 17:47:16',NULL),(56,57,'267450','Yash Shah','Dinesh Shah','Anita Shah','2017-11-26','Male','9492603878','489, Sathupalli, Telangana','4th','A','2026-06-28 17:47:16','2026-06-28 17:47:16',NULL),(57,58,'261515','Aadhya Reddy','Rajesh Reddy','Kavita Reddy','2017-07-14','Female','9616100964','241, Madhira, Telangana','4th','A','2026-06-28 17:47:16','2026-06-28 17:47:16',NULL),(58,59,'264663','Vivaan Thakur','Suresh Thakur','Savita Thakur','2017-05-02','Male','8933916621','176, Kothagudem, Telangana','4th','A','2026-06-28 17:47:16','2026-06-28 17:47:16',NULL),(59,60,'269631','Dev Chauhan','Rakesh Chauhan','Asha Chauhan','2016-11-10','Male','9716667763','213, Palvancha, Telangana','4th','A','2026-06-28 17:47:16','2026-06-28 17:47:16',NULL),(60,61,'265884','Tara Yadav','Ganesh Yadav','Kavita Yadav','2016-01-25','Female','9746227250','261, Palvancha, Telangana','4th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(61,62,'262185','Sai Mishra','Ramesh Mishra','Asha Mishra','2015-03-19','Male','9026952659','230, Kothagudem, Telangana','5th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(62,63,'261558','Vihaan Das','Manish Das','Saroj Das','2016-03-05','Male','9890495690','349, Bhadrachalam, Telangana','5th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(63,64,'261999','Pranav Rao','Dinesh Rao','Anita Rao','2016-08-23','Male','9422916771','143, Wyra, Telangana','5th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(64,65,'265915','Pranav Shah','Vijay Shah','Sunita Shah','2015-09-18','Male','9493610425','202, Yellandu, Telangana','5th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(65,66,'262168','Dev Gupta','Manish Gupta','Seema Gupta','2016-03-11','Male','9856595333','100, Khammam, Telangana','5th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(66,67,'268855','Aditya Rao','Sanjay Rao','Lata Rao','2016-02-14','Male','8978822613','453, Kothagudem, Telangana','5th','A','2026-06-28 17:47:17','2026-06-28 17:47:17',NULL),(67,68,'265133','Reyansh Thakur','Mukesh Thakur','Meena Thakur','2015-01-27','Male','9664074437','429, Yellandu, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(68,69,'262159','Priya Saxena','Dinesh Saxena','Shanti Saxena','2016-02-08','Female','9095501430','273, Kothagudem, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(69,70,'269972','Nisha Sharma','Rajesh Sharma','Rekha Sharma','2015-09-12','Female','8997687745','161, Khammam, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(70,71,'264667','Rishi Chauhan','Mukesh Chauhan','Shanti Chauhan','2015-01-27','Male','8847590765','321, Yellandu, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(71,72,'265525','Meera Kumar','Vijay Kumar','Kiran Kumar','2016-10-04','Female','9731041220','364, Khammam, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(72,73,'269073','Priya Mishra','Suresh Mishra','Radha Mishra','2016-09-04','Female','9112341161','316, Yellandu, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(73,74,'263755','Pooja Rao','Anil Rao','Seema Rao','2015-07-05','Female','9639293450','424, Kodamendhi, Telangana','5th','A','2026-06-28 17:47:18','2026-06-28 17:47:18',NULL),(74,75,'263487','Arjun Rao','Rajesh Rao','Meena Rao','2016-12-16','Male','9366946219','52, Sathupalli, Telangana','5th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(75,76,'269703','Reyansh Patel','Satish Patel','Padma Patel','2016-09-09','Male','9174467793','214, Madhira, Telangana','5th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(76,77,'263516','Pooja Yadav','Rajesh Yadav','Suman Yadav','2014-01-26','Female','9749904007','440, Sathupalli, Telangana','6th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(77,78,'269769','Shreya Patel','Prakash Patel','Savita Patel','2014-10-21','Female','9364494141','22, Wyra, Telangana','6th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(78,79,'261885','Vihaan Iyer','Deepak Iyer','Rekha Iyer','2015-05-27','Male','9579228420','53, Yellandu, Telangana','6th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(79,80,'262879','Ishaan Singh','Satish Singh','Poonam Singh','2015-10-01','Male','8961333847','474, Manuguru, Telangana','6th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(80,81,'266937','Priya Reddy','Mukesh Reddy','Saroj Reddy','2015-10-02','Female','8887480788','323, Yellandu, Telangana','6th','A','2026-06-28 17:47:19','2026-06-28 17:47:19',NULL),(81,82,'262496','Vivaan Rao','Satish Rao','Rekha Rao','2014-03-08','Male','8892264627','224, Kothagudem, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(82,83,'262102','Isha Gupta','Anil Gupta','Rekha Gupta','2015-02-02','Female','9337050258','51, Wyra, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(83,84,'261134','Harsh Chauhan','Anil Chauhan','Usha Chauhan','2014-06-13','Male','8944581228','105, Kodamendhi, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(84,85,'268169','Harsh Iyer','Prakash Iyer','Radha Iyer','2015-01-05','Male','8888610950','171, Kothagudem, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(85,86,'269756','Ananya Reddy','Mohan Reddy','Poonam Reddy','2014-09-18','Female','9519540100','403, Wyra, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(86,87,'267511','Ayaan Jain','Suresh Jain','Savita Jain','2015-02-11','Male','9517554822','308, Sathupalli, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(87,88,'267616','Riya Mishra','Mohan Mishra','Anita Mishra','2014-07-23','Female','9520019557','453, Manuguru, Telangana','6th','A','2026-06-28 17:47:20','2026-06-28 17:47:20',NULL),(88,89,'262486','Tanvi Yadav','Vijay Yadav','Vijaya Yadav','2015-07-06','Female','8884961377','309, Yellandu, Telangana','6th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(89,90,'267840','Aadhya Das','Deepak Das','Seema Das','2015-04-06','Female','9715912515','148, Palvancha, Telangana','6th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(90,91,'265553','Anika Shah','Mahesh Shah','Suman Shah','2015-12-25','Female','9426856172','306, Madhira, Telangana','6th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(91,92,'267224','Aarav Chauhan','Ajay Chauhan','Seema Chauhan','2013-03-24','Male','8846197483','406, Kothagudem, Telangana','7th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(92,93,'269628','Aarav Mehta','Prakash Mehta','Sunita Mehta','2013-09-15','Male','9016861271','377, Wyra, Telangana','7th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(93,94,'267536','Kavya Patel','Manish Patel','Shanti Patel','2014-01-05','Female','8859662222','298, Yellandu, Telangana','7th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(94,95,'264766','Rohan Chauhan','Mukesh Chauhan','Anita Chauhan','2013-04-13','Male','8845457264','337, Kothagudem, Telangana','7th','A','2026-06-28 17:47:21','2026-06-28 17:47:21',NULL),(95,96,'265598','Dev Mehta','Deepak Mehta','Saroj Mehta','2013-02-04','Male','9435884967','17, Madhira, Telangana','7th','A','2026-06-28 17:47:22','2026-06-28 17:47:22',NULL),(96,97,'265921','Pranav Nair','Manish Nair','Meena Nair','2014-04-06','Male','9728980612','164, Yellandu, Telangana','7th','A','2026-06-28 17:47:22','2026-06-28 17:47:22',NULL),(97,98,'264316','Ayaan Mehta','Dinesh Mehta','Savita Mehta','2014-07-18','Male','9123560784','82, Sathupalli, Telangana','7th','A','2026-06-28 17:47:22','2026-06-28 17:47:22',NULL),(98,99,'264725','Aditya Thakur','Suresh Thakur','Padma Thakur','2014-11-17','Male','9764392167','43, Manuguru, Telangana','7th','A','2026-06-28 17:47:22','2026-06-28 17:47:22',NULL),(99,100,'268376','Shreya Saxena','Harish Saxena','Usha Saxena','2014-06-19','Female','9726221331','233, Khammam, Telangana','7th','A','2026-06-28 17:47:22','2026-06-28 17:47:22',NULL),(100,101,'265431','Vivaan Shah','Mukesh Shah','Usha Shah','2014-01-16','Male','9887781705','107, Sathupalli, Telangana','7th','A','2026-06-28 17:47:22','2026-06-28 17:47:22',NULL),(101,102,'267338','Nisha Singh','Deepak Singh','Lata Singh','2013-09-03','Female','8830058689','126, Wyra, Telangana','7th','A','2026-06-28 17:47:23','2026-06-28 17:47:23',NULL),(102,103,'261085','Ananya Verma','Rajesh Verma','Kiran Verma','2013-12-06','Female','9149378017','278, Sathupalli, Telangana','7th','A','2026-06-28 17:47:23','2026-06-28 17:47:23',NULL),(103,104,'265270','Sai Rao','Rajesh Rao','Poonam Rao','2014-03-24','Male','8876813083','65, Kothagudem, Telangana','7th','A','2026-06-28 17:47:23','2026-06-28 17:47:23',NULL),(104,105,'264129','Neha Nair','Sunil Nair','Neelam Nair','2014-02-03','Female','9183611682','274, Palvancha, Telangana','7th','A','2026-06-28 17:47:23','2026-06-28 17:47:23',NULL),(105,106,'265201','Shreya Pandey','Satish Pandey','Seema Pandey','2014-06-11','Female','9770110608','120, Manuguru, Telangana','7th','A','2026-06-28 17:47:23','2026-06-28 17:47:23',NULL),(106,107,'264645','Meera Reddy','Sanjay Reddy','Geeta Reddy','2013-11-07','Female','9572930540','185, Wyra, Telangana','8th','A','2026-06-28 17:47:24','2026-06-28 17:47:24',NULL),(107,108,'261116','Pranav Sharma','Ramesh Sharma','Kavita Sharma','2013-08-20','Male','9683270244','262, Bhadrachalam, Telangana','8th','A','2026-06-28 17:47:24','2026-06-28 17:47:24',NULL),(108,109,'265811','Kabir Mishra','Satish Mishra','Anita Mishra','2013-08-19','Male','9029011761','154, Kodamendhi, Telangana','8th','A','2026-06-28 17:47:24','2026-06-28 17:47:24',NULL),(109,110,'261615','Vivaan Yadav','Manish Yadav','Geeta Yadav','2012-03-09','Male','8835758947','318, Manuguru, Telangana','8th','A','2026-06-28 17:47:24','2026-06-28 17:47:24',NULL),(110,111,'263813','Harsh Mehta','Prakash Mehta','Sunita Mehta','2012-04-18','Male','9412422072','220, Kothagudem, Telangana','8th','A','2026-06-28 17:47:24','2026-06-28 17:47:24',NULL),(111,112,'265006','Dev Das','Suresh Das','Suman Das','2013-02-28','Male','9325850599','475, Kothagudem, Telangana','8th','A','2026-06-28 17:47:24','2026-06-28 17:47:24',NULL),(112,113,'266113','Pooja Chauhan','Ramesh Chauhan','Seema Chauhan','2013-04-03','Female','9851037991','53, Kothagudem, Telangana','8th','A','2026-06-28 17:47:25','2026-06-28 17:47:25',NULL),(113,114,'262017','Shreya Verma','Ajay Verma','Shanti Verma','2012-08-19','Female','9471542749','327, Manuguru, Telangana','8th','A','2026-06-28 17:47:25','2026-06-28 17:47:25',NULL),(114,115,'268769','Pranav Patel','Mukesh Patel','Poonam Patel','2013-02-17','Male','8919836897','477, Khammam, Telangana','8th','A','2026-06-28 17:47:25','2026-06-28 17:47:25',NULL),(115,116,'264312','Pooja Mehta','Rajesh Mehta','Rekha Mehta','2012-08-11','Female','9049182412','76, Sathupalli, Telangana','8th','A','2026-06-28 17:47:25','2026-06-28 17:47:25',NULL),(116,117,'264191','Krishna Iyer','Ganesh Iyer','Savita Iyer','2012-08-24','Male','9853735384','356, Yellandu, Telangana','8th','A','2026-06-28 17:47:25','2026-06-28 17:47:25',NULL),(117,118,'269240','Ishaan Thakur','Rajesh Thakur','Shanti Thakur','2013-02-06','Male','9796270678','150, Kodamendhi, Telangana','8th','A','2026-06-28 17:47:25','2026-06-28 17:47:25',NULL),(118,119,'266823','Tara Saxena','Mohan Saxena','Saroj Saxena','2012-05-24','Female','9755739136','161, Manuguru, Telangana','8th','A','2026-06-28 17:47:26','2026-06-28 17:47:26',NULL),(119,120,'263991','Kavya Verma','Sanjay Verma','Vijaya Verma','2012-07-05','Female','9699139400','155, Kothagudem, Telangana','8th','A','2026-06-28 17:47:26','2026-06-28 17:47:26',NULL),(120,121,'264913','Ayaan Kumar','Sanjay Kumar','Padma Kumar','2012-04-08','Male','9560097014','76, Bhadrachalam, Telangana','8th','A','2026-06-28 17:47:26','2026-06-28 17:47:26',NULL),(121,122,'264227','Ayaan Mishra','Naresh Mishra','Usha Mishra','2012-10-02','Male','9759155376','359, Palvancha, Telangana','9th','A','2026-06-28 17:47:26','2026-06-28 17:47:26',NULL),(122,123,'262436','Meera Pandey','Mahesh Pandey','Saroj Pandey','2012-10-24','Female','9097266142','226, Wyra, Telangana','9th','A','2026-06-28 17:47:26','2026-06-28 17:47:26',NULL),(123,124,'269692','Kavya Saxena','Mohan Saxena','Suman Saxena','2011-09-13','Female','8977714463','127, Yellandu, Telangana','9th','A','2026-06-28 17:47:27','2026-06-28 17:47:27',NULL),(124,125,'268979','Jiya Singh','Satish Singh','Usha Singh','2012-11-06','Female','9764867848','192, Bhadrachalam, Telangana','9th','A','2026-06-28 17:47:27','2026-06-28 17:47:27',NULL),(125,126,'261827','Kavya Rao','Vijay Rao','Anita Rao','2011-11-23','Female','9471741756','398, Kodamendhi, Telangana','9th','A','2026-06-28 17:47:27','2026-06-28 17:47:27',NULL),(126,127,'266380','Harsh Thakur','Ajay Thakur','Geeta Thakur','2011-01-20','Male','9352490972','17, Manuguru, Telangana','9th','A','2026-06-28 17:47:27','2026-06-28 17:47:27',NULL),(127,128,'269000','Ayaan Mehta','Ramesh Mehta','Saroj Mehta','2012-10-14','Male','8988377481','30, Bhadrachalam, Telangana','9th','A','2026-06-28 17:47:27','2026-06-28 17:47:27',NULL),(128,129,'265888','Arjun Reddy','Mahesh Reddy','Seema Reddy','2012-04-07','Male','8872287428','53, Palvancha, Telangana','9th','A','2026-06-28 17:47:28','2026-06-28 17:47:28',NULL),(129,130,'262600','Jiya Saxena','Sunil Saxena','Geeta Saxena','2012-04-01','Female','9457898282','404, Yellandu, Telangana','9th','A','2026-06-28 17:47:28','2026-06-28 17:47:28',NULL),(130,131,'267010','Ananya Chauhan','Dinesh Chauhan','Sunita Chauhan','2012-09-14','Female','9364044656','347, Sathupalli, Telangana','9th','A','2026-06-28 17:47:28','2026-06-28 17:47:28',NULL),(131,132,'267009','Tara Das','Satish Das','Anita Das','2012-03-24','Female','9499323252','124, Khammam, Telangana','9th','A','2026-06-28 17:47:28','2026-06-28 17:47:28',NULL),(132,133,'264458','Tanvi Reddy','Ramesh Reddy','Shanti Reddy','2012-01-08','Female','9425734650','107, Sathupalli, Telangana','9th','A','2026-06-28 17:47:28','2026-06-28 17:47:28',NULL),(133,134,'261769','Yash Mishra','Sunil Mishra','Saroj Mishra','2011-06-03','Male','8816069920','165, Kodamendhi, Telangana','9th','A','2026-06-28 17:47:29','2026-06-28 17:47:29',NULL),(134,135,'261987','Kavya Thakur','Dinesh Thakur','Shanti Thakur','2012-09-22','Female','9065569584','262, Palvancha, Telangana','9th','A','2026-06-28 17:47:29','2026-06-28 17:47:29',NULL),(135,136,'267911','Harsh Verma','Manish Verma','Lata Verma','2012-02-11','Male','9661180958','213, Madhira, Telangana','9th','A','2026-06-28 17:47:29','2026-06-28 17:47:29',NULL),(136,137,'267365','Krishna Kumar','Harish Kumar','Geeta Kumar','2010-12-13','Male','9888669015','432, Madhira, Telangana','10th','A','2026-06-28 17:47:29','2026-06-28 17:47:29',NULL),(137,138,'261626','Reyansh Kumar','Naresh Kumar','Geeta Kumar','2011-07-28','Male','9510526370','429, Bhadrachalam, Telangana','10th','A','2026-06-28 17:47:29','2026-06-28 17:47:29',NULL),(138,139,'263595','Ayaan Kumar','Harish Kumar','Asha Kumar','2011-07-18','Male','9015853757','47, Palvancha, Telangana','10th','A','2026-06-28 17:47:30','2026-06-28 17:47:30',NULL),(139,140,'261764','Aadhya Shah','Dinesh Shah','Poonam Shah','2010-12-13','Female','9120528198','22, Manuguru, Telangana','10th','A','2026-06-28 17:47:30','2026-06-28 17:47:30',NULL),(140,141,'262630','Kiara Das','Manish Das','Neelam Das','2010-12-10','Female','8959302693','59, Yellandu, Telangana','10th','A','2026-06-28 17:47:30','2026-06-28 17:47:30',NULL),(141,142,'265155','Rohan Sharma','Harish Sharma','Kiran Sharma','2011-02-16','Male','9754364987','196, Khammam, Telangana','10th','A','2026-06-28 17:47:30','2026-06-28 17:47:30',NULL),(142,143,'261263','Isha Jain','Harish Jain','Geeta Jain','2010-11-25','Female','9812117446','341, Wyra, Telangana','10th','A','2026-06-28 17:47:30','2026-06-28 17:47:30',NULL),(143,144,'269936','Shreya Singh','Ajay Singh','Rekha Singh','2010-03-28','Female','8873314578','474, Yellandu, Telangana','10th','A','2026-06-28 17:47:30','2026-06-28 17:47:30',NULL),(144,145,'264695','Pranav Verma','Ramesh Verma','Rekha Verma','2011-03-04','Male','9128908098','147, Palvancha, Telangana','10th','A','2026-06-28 17:47:31','2026-06-28 17:47:31',NULL),(145,146,'268023','Sai Sharma','Ganesh Sharma','Asha Sharma','2010-02-28','Male','8845096641','281, Manuguru, Telangana','10th','A','2026-06-28 17:47:31','2026-06-28 17:47:31',NULL),(146,147,'264077','Reyansh Singh','Mahesh Singh','Asha Singh','2011-02-04','Male','9758274923','211, Bhadrachalam, Telangana','10th','A','2026-06-28 17:47:31','2026-06-28 17:47:31',NULL),(147,148,'261317','Nisha Rao','Vijay Rao','Rekha Rao','2010-04-06','Female','9849821387','472, Bhadrachalam, Telangana','10th','A','2026-06-28 17:47:31','2026-06-28 17:47:31',NULL),(148,149,'265060','Krishna Saxena','Prakash Saxena','Seema Saxena','2011-01-12','Male','8869431348','443, Kothagudem, Telangana','10th','A','2026-06-28 17:47:31','2026-06-28 17:47:31',NULL),(149,150,'269566','Sara Mehta','Naresh Mehta','Saroj Mehta','2010-03-13','Female','9074886625','40, Yellandu, Telangana','10th','A','2026-06-28 17:47:31','2026-06-28 17:47:31',NULL),(150,151,'269621','Nisha Patel','Sanjay Patel','Shanti Patel','2011-07-09','Female','9196384765','159, Sathupalli, Telangana','10th','A','2026-06-28 17:47:32','2026-06-28 17:47:32',NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class` varchar(10) NOT NULL,
  `section` varchar(5) DEFAULT 'A',
  `type` enum('Weekly Timetable','Exam Timetable') DEFAULT 'Weekly Timetable',
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `effective_from` date DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable`
--

LOCK TABLES `timetable` WRITE;
/*!40000 ALTER TABLE `timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','student') NOT NULL DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$7SdanwhLBu8VdUz64mF5SeUHgzB42NOBH36uOJdATNm1WJeSAsuWq','admin','2026-06-28 17:47:08','2026-06-28 18:08:08'),(2,'meera269256','$2a$10$JB/PU8QvTCZvaoC1qqzx0.TnJjZ9d2rY5pOvBKYJI/AN/CqUGrKY6','student','2026-06-28 17:47:08','2026-06-28 17:47:08'),(3,'rishi261876','$2a$10$EmZOmGAsT5VGXq1NMYQYvuc0tuIRs2JhfTZUW0U1u5drxSsbUY5Ki','student','2026-06-28 17:47:08','2026-06-28 17:47:08'),(4,'vihaan266406','$2a$10$WzQBSro72JPrf9qM2yc2SOVC.3Fef2YYp1oZmj74SZTaEZSo9twEO','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(5,'pooja263063','$2a$10$VyC/tCInoMhgT9EY0NcO5.XkHohI1TxEhO1d8hIW0e6gpX7ruMWfm','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(6,'riya264407','$2a$10$Z/a1E5as2F4P7hdQwltMoe7hXG/r3229uhy5B9.sNoSBnkJaz3V.i','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(7,'diya269266','$2a$10$IYV8GE7iNvzV4vnjhFBJhudYhTrGNMNUYxR1.bMwJe3Wn7oD44VfG','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(8,'priya262308','$2a$10$UwxIbdEYlvHU7sWC94bex.Nzm3mnnSv/J0Trh9IP/udM9EDPDGInu','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(9,'pranav263124','$2a$10$2zy0qU02p.uc1z0A.0V7hOQA491yiBvoB27Y6RUMZdqHTBD8aN2bK','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(10,'kiara266754','$2a$10$HzQXejWNwTOAch8l3ZFc9OuEba9CIOGMDFm/iHQv8CrJgG2wbwBBC','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(11,'sanya266022','$2a$10$zVYw4Sx7K3vDZvXUD1HQS.azJqDBcbTW9rjIW/KmopF3wzrN9GKx6','student','2026-06-28 17:47:09','2026-06-28 17:47:09'),(12,'ayaan267323','$2a$10$0ziVNrGYaK/UQ8BObLwVOeBDf199C1GOuFBDsCo0dF26Ssq0A5tL2','student','2026-06-28 17:47:10','2026-06-28 17:47:10'),(13,'arnav267892','$2a$10$oq1P1tZd8EMTPtX19yH.T.OpZ9DPIWpbos0NfNdwiKjYCF9tmIHlS','student','2026-06-28 17:47:10','2026-06-28 17:47:10'),(14,'ayaan263688','$2a$10$obDoj8EEI33JYaFKD/8gTuxDEkEbRtozfURC.I7vE05sC5QfLjSi2','student','2026-06-28 17:47:10','2026-06-28 17:47:10'),(15,'rishi266876','$2a$10$22QXuTErwrhmZHpfkYlaf.EmfwZVl3oJRMQOqAhWYoOw71zFFkGYe','student','2026-06-28 17:47:10','2026-06-28 17:47:10'),(16,'aadhya262978','$2a$10$DMtLhsjrWYzLRMgtg5dcC.Vh3Qhyp00aA6/crHXsb8DlGvhq39QTa','student','2026-06-28 17:47:10','2026-06-28 17:47:10'),(17,'pranav267850','$2a$10$5KR4FOthipOYZM9LWVXQyeXjuMTGNc/m4dhBT3RWNCYulVKS6BELS','student','2026-06-28 17:47:10','2026-06-28 17:47:10'),(18,'reyansh262016','$2a$10$5k69o1IXf7JCUm6DpcPgLOA./9pqqm1WDlnGkJDYX.Q.tPXeMeV9e','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(19,'kabir261296','$2a$10$WMGu67peZe9MlvXw8Btd/e7Bj/uqGc81mUoexSawobPrx0w0Kci1q','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(20,'pooja268267','$2a$10$NJPyaQJQWQciQK54EvhRMuZiuN2hGDLew09836Spirkqd9Ei/H18m','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(21,'tanvi269207','$2a$10$nnOh7zwxXtnsmJhfwu3kDO7S7hrGBlPd1SDYG.7N5SMTBqaNaE8cC','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(22,'dev266975','$2a$10$5YS.56nRosFNMnR0NtuDyuoCHAA0HIcs.ctSJyYBmu9EgTjsIJV6C','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(23,'priya269125','$2a$10$MEtDMkanE1tWXH0JOQJ1AemRP5K9Ar2u8qM7y.chgyVcPPIsX6MOO','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(24,'jiya265516','$2a$10$Kr6XwAIBB7KOVCI5gV8Lq..yk4zXJylalPXXgrJ610Ty9rnEPB/9q','student','2026-06-28 17:47:11','2026-06-28 17:47:11'),(25,'sai266990','$2a$10$qokmYUiAe3G5VS8I2JO6QuCN1ofihCx5iqKpNalfMp4.QP05FtwGi','student','2026-06-28 17:47:12','2026-06-28 17:47:12'),(26,'aarav267925','$2a$10$mXiKYx11T3.2YhBYkap60ueB0FYxmB29QsVBd8pJjYNMX2r33JozO','student','2026-06-28 17:47:12','2026-06-28 17:47:12'),(27,'anika262789','$2a$10$6z10DbI1S0W0z6.237vIleMhgAAcxoNrQDLRGyd1QgaaJ46PuA13S','student','2026-06-28 17:47:12','2026-06-28 17:47:12'),(28,'kiara263571','$2a$10$f2r45HBBXuyOp8IBjGzYg.1joXQM18oEjMk/uFzgaDFiPQMLCvn1S','student','2026-06-28 17:47:12','2026-06-28 17:47:12'),(29,'sanya261214','$2a$10$7GmxNPcLRR5Y3xcrLndbe.IGCAuiX4RbjTQ84BoGdnF7BNPfZrZ8G','student','2026-06-28 17:47:12','2026-06-28 17:47:12'),(30,'kiara262796','$2a$10$dnpD4F10AS6upzqIrzlqWOCaMAhdoJag8W/i3PtD6gGyzbK7SlReO','student','2026-06-28 17:47:12','2026-06-28 17:47:12'),(31,'reyansh268693','$2a$10$DpU4NZxG8QqUbBL4rwdRUu2D9v3x.OIVXRBgUlYte0GPYVt.Kfhj6','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(32,'arnav262213','$2a$10$zanTlCtL8TxzCa9mMHw5CekztpCT81CsHbfYoq8Z/NZYiF5VqV7Sq','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(33,'kiara268044','$2a$10$kJROHA2tc.iuAYrHY3FtFOBZmAbIg7yEvjj4TRVLhgJkcFxmkdv1q','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(34,'pranav266249','$2a$10$R8VRK28mywPQ6LKK4Uf6Fu.gZVnkUlGLIpsLjhJ1A79/Dfp1.fRBW','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(35,'aadhya261909','$2a$10$3kp9J2YZdS.JLjYDIBcv5.l4K7b6AsOG21wYr1ESZeh5zGtBcIC2W','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(36,'tanvi269010','$2a$10$CM4u92IHbDcwTHlzaFQt/ufUiP0Y4VXnK2YSdBhWsptxxVe2yufZW','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(37,'anika265236','$2a$10$wHJCQ3M/lKApSn/n/twtAOeqHewmKsi1Z/DIaNKEA/i3tmBsThQt6','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(38,'tara262585','$2a$10$xKTBvV4R/lCwly6KBVOIBul8iYNT54yrvX6f75cseTFV9M3robK/C','student','2026-06-28 17:47:13','2026-06-28 17:47:13'),(39,'myra262618','$2a$10$UJs0fiHT8n1R/ASHEbWu8OfknoUyhrNFuce8LPiQe1g5fBOWPW77C','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(40,'aditya265261','$2a$10$EEsg84IJ8FrmhpZNACH95OcfJ5m95ApnAHhgqzyHyjzOaNeN57AnC','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(41,'priya264037','$2a$10$VeuqzYX6lzIu5eX4mq0OoOBhQS6RxWX4oV61i9jjmymMi2.SAZ0he','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(42,'aditya262631','$2a$10$q4mVHhlx7rFDIgvu9Em9/.tXVl05szUyzzgbQfvkLn9kkcoSUgRP2','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(43,'yash261084','$2a$10$GjvYu3Z2jbsSmVpSvF/uFuNsbfMyhcfuW7C2gdUn3MITyg.F/bxre','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(44,'rishi263478','$2a$10$W.YddvcLqtD/v24xtc0hu.xmXo0/pKaJ1KjMEiG2k92OSrVuNaqhu','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(45,'nisha266632','$2a$10$AB0qXEfMmJv2YSLWLc37YeNuQoe25uR8dLGr7KpUrKF.5H95FqV42','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(46,'priya265402','$2a$10$loMhkYw94tdwIyRP9DtuNeesS4rBxBHGmT46//Q8jnE.agp9CmQnu','student','2026-06-28 17:47:14','2026-06-28 17:47:14'),(47,'ananya269137','$2a$10$caojHi3O6btxG.V8Sk5gyOaljoO2eZ/DjIS8wkgy1gAs6oUuPSPM2','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(48,'nisha262074','$2a$10$bdK4acEr8WFiPySbi8A3VuvfMByDiQwPbRev.pS9z1mQVwNrUPvtG','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(49,'shreya264618','$2a$10$PlV56OaaQyoAnuocXiyscu.6SpxZNNlgjbRnpUS45.uc8iqGzCsmC','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(50,'kartik266934','$2a$10$ZJywvUDgyjFrc/u99nIaRuD71Df9PkrdmeYSC2rG6JmHPtKbBEHAC','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(51,'ishaan267717','$2a$10$VdFHOVkmRLsBCtcLIqiod.8XU8Ew4KR.c17BSRxIhT8HCLJrufAAu','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(52,'vihaan265415','$2a$10$AlyQ8l3JaRV/SeGCriwqJ.3k/rU7fUVrovNlOz1FVdag1j9GhaYJa','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(53,'sanya264481','$2a$10$jJ7.83jiIcXAM.s6dd8NWun8iB2ZA3vtVGgqejr/4yQ1eLme3HcrO','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(54,'ishaan268846','$2a$10$JNXQ/TwCUCnQmXcSb.7fSe6PPd6p15Y8hbAvlXkODZFukYnCNt4ia','student','2026-06-28 17:47:15','2026-06-28 17:47:15'),(55,'tanvi264416','$2a$10$kZn7sBZDIyFoMSQ//GyoIeM/CN4NaEhXln5fwC98QRHFJOx.orEe2','student','2026-06-28 17:47:16','2026-06-28 17:47:16'),(56,'isha263270','$2a$10$eymxXe640.dXOa6Qxmt4deJi0EtX61.ORZ.zSS3Tm04PxgnzpA3Va','student','2026-06-28 17:47:16','2026-06-28 17:47:16'),(57,'yash267450','$2a$10$1YcPZdZGpsI8QSUhFl2QTelQVAauLNBbrUgLjHjhhlhOWqZdKgG/K','student','2026-06-28 17:47:16','2026-06-28 17:47:16'),(58,'aadhya261515','$2a$10$4zZMRsH4mRoRJCpqNqpUbOHxMj1iqQrxHaFBa702PUVRPrjIJgBUa','student','2026-06-28 17:47:16','2026-06-28 17:47:16'),(59,'vivaan264663','$2a$10$xWGU7OFtf0fNvDfkWnoU3uIRr5ZymNeRB1eovM7/Zh837Sg/6Oama','student','2026-06-28 17:47:16','2026-06-28 17:47:16'),(60,'dev269631','$2a$10$U9fURn2ApxRFGiNa.aK74Oi9KxZvaAHB35dbHxXSV7kAoJFkpQdfy','student','2026-06-28 17:47:16','2026-06-28 17:47:16'),(61,'tara265884','$2a$10$Aev.7LXWWImZdCMhkY6kp.NFg2kMbJULIDuNeg8IuuJitpnc4CHIi','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(62,'sai262185','$2a$10$fCXpK6Va3r8ZP6wTzFbeRegWxPPrkzGabomWb2kaCZMShldJ7d62y','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(63,'vihaan261558','$2a$10$.3NBiRMAiaiA8dPoNX1U/uyKvkdEB6S9S.FoPv1nbEHrFlDQ1Hrdm','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(64,'pranav261999','$2a$10$UfyGWCoHKV5Y5W/KGu/IwOg38cMyWIWCOuZ7VjVr3cIyezeW3SzVi','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(65,'pranav265915','$2a$10$n8ZzsvIWhVV/dk0jk.YQ6eOYCJZDNGM16fGYMsRMuIK3jpoFv/KEC','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(66,'dev262168','$2a$10$mLi.z44A2vjfjKkYfdYcielMY4EKKVdwL8iWdGs71HGG3h7v/dLJi','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(67,'aditya268855','$2a$10$r8tyZHVsVqqI9C0V6lrrpuD7u.YXnXZA6fH/Da5XTmlVr1kgtlKzW','student','2026-06-28 17:47:17','2026-06-28 17:47:17'),(68,'reyansh265133','$2a$10$9iPtvGNBg8qY1sp8Y9QRFut.2Lo16x3e3rW0gCZvK4.zDyOtGRDpS','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(69,'priya262159','$2a$10$irt8wCVJgOXdUYwF8UyO1uYg3Mg6yVN75jKiuQ1cVLQEl1MM0gyW2','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(70,'nisha269972','$2a$10$CiUbJa9ypI8FOvW9JlFz5u7y.ZOpiXLbd.sbbxzTC43r.s/mncuu.','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(71,'rishi264667','$2a$10$iEGgRA36lPUjAVyKecJvb.RdRuDr7pysnOhtPPdyjuyy4jcmLMLum','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(72,'meera265525','$2a$10$KCmPekso49Ks.pvcepfxQe42PSJCvJfhpZ/glsf5CeMDos2m6J5Qi','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(73,'priya269073','$2a$10$T3qTvJPSlZUhM9C.2YVh.ehCJ4Fg7KMCfy0h537RidTdr1btzv7Yy','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(74,'pooja263755','$2a$10$jBY3TgnYCe3kRW1pYscHcOO93wgXjnrhnYyTCOnXWvw5iIaJU/oAe','student','2026-06-28 17:47:18','2026-06-28 17:47:18'),(75,'arjun263487','$2a$10$sZPKtmNBIm8lyiB8ql/xpuvPEpzVTT9YBtY.gyg7I6u0Fj3ow.DSq','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(76,'reyansh269703','$2a$10$6knwYRMglPmFriKxua.cmeDFx64dAH0Ge4EV/rxnRgAps2bDp/bLC','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(77,'pooja263516','$2a$10$EdTtzuzEpbEX/KNxz3CmLeRWX.4Y/ZDHmj6EDRg4TBDPzqLrrfeia','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(78,'shreya269769','$2a$10$RS7V3VWtTImlE21xABNsueebgqmPB.yXnkofPPcWNPnpPXGDzHyQe','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(79,'vihaan261885','$2a$10$oBnZnO8EDhUi/nPfljBaKOBqiBTdEaYUXjmvxuWIr8AFUDUenSbem','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(80,'ishaan262879','$2a$10$lhMbhjKFcPdwn5lsvJeZB.5XSEsaPasrFJkPKCkv1FNpI9il3Mpze','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(81,'priya266937','$2a$10$jXei7z3zlwP/Se07393Jc.RABp4py3gTLkrX0Qos0ahlDc17GQ65i','student','2026-06-28 17:47:19','2026-06-28 17:47:19'),(82,'vivaan262496','$2a$10$nHuKP4iF9oQKv2RBrA9IueMMoI8g3OO239EXrtGQULp5EvSZbQOfC','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(83,'isha262102','$2a$10$FX44iNBKdsIpIDKkTTbUNOOZY98fLJitpc7eRibgEvxC8/.uuq3J2','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(84,'harsh261134','$2a$10$eUilxXrlxHPIoX0W8dO8VOFl7PBo0dJrHWzjEqtIueUtIU5dYs3hW','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(85,'harsh268169','$2a$10$CHHvjom5ie.hLb7mx1BO3.31jjFqt.WYY9aQ0y3MIEthOw2XjNQ/m','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(86,'ananya269756','$2a$10$j.PCUgSG/btacCKrIUMFqOJIbbpzi5SLbXLvb6j26/I7Buix/QU.O','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(87,'ayaan267511','$2a$10$KpQ1kqT2JJzo0MwqAV42G.qI3oXm3QcvPwSY7JOBz5p7tmRSRwVvO','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(88,'riya267616','$2a$10$WLslmKdWOIVkJzYmEykAT.YT3rFIoGQdwPMuGzLAexX4C26uiub7q','student','2026-06-28 17:47:20','2026-06-28 17:47:20'),(89,'tanvi262486','$2a$10$oUNOeWh5hvWGt/jcTKF41ezHT95x.q.jhS1/92UUeHF1QCJxFxfMa','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(90,'aadhya267840','$2a$10$Gccl00WoCuIcwSkbvoxYoe4QKtyhG1xAkVZusOpHmlussgDxd8FK.','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(91,'anika265553','$2a$10$wLq.qnzt50ShcpZ54z4GMOjOioz4316ZgT3DOdO6qXssonCCLXGU.','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(92,'aarav267224','$2a$10$fRNLwQhMnBrwTT6d3FUwheqBmzHnrKlh1tR/vHji1TJuquLSA3qSW','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(93,'aarav269628','$2a$10$DRuGevcVMRFNJFm.5Q/SwegtIemg3QYPgJra37euQ7W6NNWX8sC3O','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(94,'kavya267536','$2a$10$Is5oN1Vg2sZUZW4iMrcmh.RwLzzPZjST.Wq9mz8yy7fZy1.M9NhBq','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(95,'rohan264766','$2a$10$I91QM1gscF81o5Bme4h2QeyD2D5pXX8w4S0M71bdK.8HadtG.OKQm','student','2026-06-28 17:47:21','2026-06-28 17:47:21'),(96,'dev265598','$2a$10$T1XX5R6in1eLHkSeoDsyzehzPTTgyf142n3Sw2NGO5cMyvLZ4SSOW','student','2026-06-28 17:47:22','2026-06-28 17:47:22'),(97,'pranav265921','$2a$10$9i9emd4QMRSNcw2qXH.xeuh1tS5ciSlRo2BqQq.NV3TnTG.qQOJzS','student','2026-06-28 17:47:22','2026-06-28 17:47:22'),(98,'ayaan264316','$2a$10$uFaXTUfsMthNLQsaqP29vuzg.6C4x9CFMDRa3Ha5ly21wDulWTUMS','student','2026-06-28 17:47:22','2026-06-28 17:47:22'),(99,'aditya264725','$2a$10$4xuhUwYLaZ4Wc4uPudFjpOXDd.hZQGv4Qe19Dohi2L5Nq9n1w.8Qe','student','2026-06-28 17:47:22','2026-06-28 17:47:22'),(100,'shreya268376','$2a$10$MwhwcMwHWJIoAJ90nHhKiObRoEuhFh5n3sTLmeJlrIRSt4X2Up4eK','student','2026-06-28 17:47:22','2026-06-28 17:47:22'),(101,'vivaan265431','$2a$10$1Vr8Cfeg77cX9kt7bXVwquVTZF9K6nFBC35Wo/8TMo6MiyxlwbcdS','student','2026-06-28 17:47:22','2026-06-28 17:47:22'),(102,'nisha267338','$2a$10$L2jhfzmLgpWkhph4sW.Xauo5v80fXU1mjjeqAKTPSfihUoypvSR5q','student','2026-06-28 17:47:23','2026-06-28 17:47:23'),(103,'ananya261085','$2a$10$x/0wSS0W0fet4QW1NqtryuZUprCzZByqnIFmcIhYAQLBzLekPg/wO','student','2026-06-28 17:47:23','2026-06-28 17:47:23'),(104,'sai265270','$2a$10$gE/TeoamdHVFB21.2/Bd5OxqzM5hexD3LgO0/tgoy1QwZRq5xmwaG','student','2026-06-28 17:47:23','2026-06-28 17:47:23'),(105,'neha264129','$2a$10$w6y1jLFoYFbWFHOJoSua6OqW3SiavEHMryi.jFyJfJ8crWoSW.z1q','student','2026-06-28 17:47:23','2026-06-28 17:47:23'),(106,'shreya265201','$2a$10$SWL89UaHPpCOCns9GMNUA.9JOAlpIGVCAFNDcTsWcB6IRPwI6dxY.','student','2026-06-28 17:47:23','2026-06-28 17:47:23'),(107,'meera264645','$2a$10$qPhTAUiAWlUBVCHaKOth1uFZWrGvDeH3gx.lX5xMwwyN4WPIi0y7G','student','2026-06-28 17:47:24','2026-06-28 17:47:24'),(108,'pranav261116','$2a$10$gKt9oLuQEy1MQdZGQghJQeVTFpN8kt4HgRMKVxRQ6AWdXRnYPcrmi','student','2026-06-28 17:47:24','2026-06-28 17:47:24'),(109,'kabir265811','$2a$10$uXZ/ZTTg/9ZG03Pd9j48/.4LO3xmd4H3LCsSQUAVRdSx25iLHjbS2','student','2026-06-28 17:47:24','2026-06-28 17:47:24'),(110,'vivaan261615','$2a$10$D/ecLQLxNfCuqOo.ugzZe.ajInAelcluWp0JRJCGbsmcLMOTsXa3G','student','2026-06-28 17:47:24','2026-06-28 17:47:24'),(111,'harsh263813','$2a$10$er1.IF5k2kKYOpFPtA0NW.vfwufrW1Dy.5E9u5I3r8AIjjOHwk1RS','student','2026-06-28 17:47:24','2026-06-28 17:47:24'),(112,'dev265006','$2a$10$HQzVJza.kTzZ27cXGDFWwO78D.2ybkyP1Vzdnmjrx7mi.8TvSQEUK','student','2026-06-28 17:47:24','2026-06-28 17:47:24'),(113,'pooja266113','$2a$10$RR7xrF7IF7mY.rBycWKegeXbnHMnYpI.mPlISNKvSHOko/H8f73IK','student','2026-06-28 17:47:25','2026-06-28 17:47:25'),(114,'shreya262017','$2a$10$CU/oE58sdOdN2w0Q1ZwL7uZeuAjipdGdPEs6Tk2ByMYL0T0EjER8y','student','2026-06-28 17:47:25','2026-06-28 17:47:25'),(115,'pranav268769','$2a$10$Rrvv9bMTk8D7tGV.Im3NHewDhSgayXe1MhuRkiImXUuG5dQVzYS8u','student','2026-06-28 17:47:25','2026-06-28 17:47:25'),(116,'pooja264312','$2a$10$KBITOvVJZ.FlzLsdoTDsHOJT6BaWErGtPSoIi0suuHpYofvuMDZYq','student','2026-06-28 17:47:25','2026-06-28 17:47:25'),(117,'krishna264191','$2a$10$20ZGPUEugimp7kjF4PKziuklWuaKAFmUSr0r9HI0lPFpGUtbCWZYa','student','2026-06-28 17:47:25','2026-06-28 17:47:25'),(118,'ishaan269240','$2a$10$C6Hf9mUGPCvJulVSvzaYnesr1ub3mx5zBOlWwRd5lkSbPTS3zJg6a','student','2026-06-28 17:47:25','2026-06-28 17:47:25'),(119,'tara266823','$2a$10$RZ/RxxmicLtCBh3nNsOfnel1tQkPq.QM4opY3hJoLQUSIAB71HSpm','student','2026-06-28 17:47:26','2026-06-28 17:47:26'),(120,'kavya263991','$2a$10$J73hvF7liW3mQaQs7R7j7eKcHua4RFWQ/X9en3wLi1Rd2x0/6cbNu','student','2026-06-28 17:47:26','2026-06-28 17:47:26'),(121,'ayaan264913','$2a$10$exPShKT5IYghLhI/8RAyQuT18eopDdLWIFNUR19CftgS0ZCuxv0B2','student','2026-06-28 17:47:26','2026-06-28 17:47:26'),(122,'ayaan264227','$2a$10$VVnM1zblzI1G.3T60irZnOCikhDp638RNoq6CH3tgTga/dJhM0Uze','student','2026-06-28 17:47:26','2026-06-28 17:47:26'),(123,'meera262436','$2a$10$UHXyAcF5X/1/y6Zwpp6fAOVge9h/fTBwfs3Xo7YcqmqxQiCfvef0W','student','2026-06-28 17:47:26','2026-06-28 17:47:26'),(124,'kavya269692','$2a$10$nudEuFYmP6tVyoTt1s8yD.8DAsPClAkofbM1KzaQCkz9rs/ZI1KMq','student','2026-06-28 17:47:27','2026-06-28 17:47:27'),(125,'jiya268979','$2a$10$wtVB7WNU101czL.2RtsHsu.6CMx0CVQPHXaLdTHRHfDe2seJ85w0C','student','2026-06-28 17:47:27','2026-06-28 17:47:27'),(126,'kavya261827','$2a$10$ycHPg3NARqgCUEgEhArkrOTTd0YRD54AhsxIqAFcxEgFe7jfEKOb2','student','2026-06-28 17:47:27','2026-06-28 17:47:27'),(127,'harsh266380','$2a$10$O9DlbaiHttI441nLAu6xwu2w4VumyW4LlC37ER0848Jj6SBTg4Eoy','student','2026-06-28 17:47:27','2026-06-28 17:47:27'),(128,'ayaan269000','$2a$10$vc6avB.my2DiHYTWBBGYIuawFv7kr/GpaI1htsd9YZVVzoca0gAVK','student','2026-06-28 17:47:27','2026-06-28 17:47:27'),(129,'arjun265888','$2a$10$C3Wu.IC7R3g2/UU6Wv6QK.Dn/BOe2MFUxopb4AtN2E4QX7gQH4CNu','student','2026-06-28 17:47:28','2026-06-28 17:47:28'),(130,'jiya262600','$2a$10$b9xzdsFWveOyuu2Gy8ner.Kka1DqTh1..s6n7nNG.LAoM8pR7I0ki','student','2026-06-28 17:47:28','2026-06-28 17:47:28'),(131,'ananya267010','$2a$10$BcfkHjXAwRRGZ3rgYvvlseMmqy55u6WP1oxTKg0AFAvckakkTnO2C','student','2026-06-28 17:47:28','2026-06-28 17:47:28'),(132,'tara267009','$2a$10$8HKKU1s0xCneBoo5TvK07uw6I2Et41YJmyxpfIlrareBw0qaOPlGi','student','2026-06-28 17:47:28','2026-06-28 17:47:28'),(133,'tanvi264458','$2a$10$Zv4Yzq1RSzYdxw33eAlOG.Xs7IM2jfAaihZt8r0as26Jqiupnm4oC','student','2026-06-28 17:47:28','2026-06-28 17:47:28'),(134,'yash261769','$2a$10$8eEllnzqqqHXcXRjBBgog.tnhqxWIczG6KMZZSKg/gz91F6s8KibS','student','2026-06-28 17:47:29','2026-06-28 17:47:29'),(135,'kavya261987','$2a$10$icgIzZqTAWks./XMdknXCulwl1M8IbVsvLPwlNYLpaWanllrk/3X6','student','2026-06-28 17:47:29','2026-06-28 17:47:29'),(136,'harsh267911','$2a$10$kxRcCpZRZnpb6GddwSRtfOrAwVeh7NfNDFS1zGXJKKKAsV5z8nF7S','student','2026-06-28 17:47:29','2026-06-28 17:47:29'),(137,'krishna267365','$2a$10$gk4zGiJDwNuZ.VFcNMSKieivKWiJ0aV07nwHtrUY6jJ83il0xwudm','student','2026-06-28 17:47:29','2026-06-28 17:47:29'),(138,'reyansh261626','$2a$10$cL.wYKkydBA9MUIPBKGBqOjzUqETco8lKAmSLJH0MICG8qWU5EkLW','student','2026-06-28 17:47:29','2026-06-28 17:47:29'),(139,'ayaan263595','$2a$10$tfA2d4jWUohR4.R.wJOoLezzFyR4fSWcFS06/M6XnAR3hroTAkkkW','student','2026-06-28 17:47:29','2026-06-28 17:47:29'),(140,'aadhya261764','$2a$10$lCsokoy5v87X0joFkPsM5ONsArxqFuODT4q/DTgViEo9ty.LWQYtu','student','2026-06-28 17:47:30','2026-06-28 17:47:30'),(141,'kiara262630','$2a$10$/iHXUm00q/xeLc2IkQDMCO8fH/wagMLXKEBObZNb35DhqUyU1nkpC','student','2026-06-28 17:47:30','2026-06-28 17:47:30'),(142,'rohan265155','$2a$10$FGidPQmFwVMsbSNTG2Y9aenl2huAZx5tu5XfnzMVAR13bnd7mY4ZS','student','2026-06-28 17:47:30','2026-06-28 17:47:30'),(143,'isha261263','$2a$10$/RbU83BGYdXwoWb3XgGPE.g8ebQZnh161zi.KDAG/N0R0eO7hPh3W','student','2026-06-28 17:47:30','2026-06-28 17:47:30'),(144,'shreya269936','$2a$10$9QXKFmx4CPVroa01oItAmORiRmX9WILfjBDmKZmzYPI0QeN8d1wGq','student','2026-06-28 17:47:30','2026-06-28 17:47:30'),(145,'pranav264695','$2a$10$2YcLrQuIrn1KbU0zIICSv.XyTFHmlMAt3EjAQmkAH4b1V7zctqXuK','student','2026-06-28 17:47:31','2026-06-28 17:47:31'),(146,'sai268023','$2a$10$0FG6LULc.YFmOd0/k/DMT.J85PJ08s2JQrLwWw2.IDM6oiuGLWoUK','student','2026-06-28 17:47:31','2026-06-28 17:47:31'),(147,'reyansh264077','$2a$10$x/nb7MHoTD1Ou5yZVCa2T.PAp/k7cGuqCQn/9lmEOGEqVzoOCLYUq','student','2026-06-28 17:47:31','2026-06-28 17:47:31'),(148,'nisha261317','$2a$10$vJleVPZCezjfA2YAi2s8p.vGz8H.kX72oqJr2Xtuh2Jld0FcnOqma','student','2026-06-28 17:47:31','2026-06-28 17:47:31'),(149,'krishna265060','$2a$10$euOApyl7jlutKbp/lzx.S.KNzaYgQLJhP/vTCWGoDimb3owq9CtSG','student','2026-06-28 17:47:31','2026-06-28 17:47:31'),(150,'sara269566','$2a$10$Xlks500mO8IwV2Q.s0aiXebvDPGfVuAkyzfYcqO/oQaLRoUFfM7/S','student','2026-06-28 17:47:31','2026-06-28 17:47:31'),(151,'nisha269621','$2a$10$4M6WAQeXKzBk.iyASz42b.0o6qW0bxXXp6XlHWL.kv9tUvoqL6cnK','student','2026-06-28 17:47:32','2026-06-28 17:47:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-02 22:45:36
