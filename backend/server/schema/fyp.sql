-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 
-- 伺服器版本： 10.1.38-MariaDB
-- PHP 版本： 7.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `fyp`
--

-- --------------------------------------------------------

--
-- 資料表結構 `application`
--

CREATE TABLE `application` (
  `application_id` int(11) NOT NULL,
  `run_id` varchar(255) NOT NULL,
  `sid` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `registe_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `application_form`
--

CREATE TABLE `application_form` (
  `form_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `run_id` varchar(255) NOT NULL,
  `internal` tinyint(1) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `quota` int(11) NOT NULL,
  `remark` text,
  `online_url` varchar(255) DEFAULT NULL,
  `online_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `approve_request`
--

CREATE TABLE `approve_request` (
  `request_id` int(11) NOT NULL,
  `association_id` varchar(255) NOT NULL,
  `request_type` varchar(20) NOT NULL,
  `event_id` varchar(255) DEFAULT NULL,
  `post_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolve_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `association`
--

CREATE TABLE `association` (
  `association_id` varchar(255) NOT NULL,
  `title` varchar(100) CHARACTER SET utf8 NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `country_code` varchar(10) NOT NULL,
  `phone_no` varchar(255) DEFAULT NULL,
  `venue_id` varchar(100) DEFAULT NULL,
  `introduction` text CHARACTER SET utf8,
  `description` text CHARACTER SET utf8,
  `type` varchar(20) NOT NULL,
  `official` tinyint(1) NOT NULL DEFAULT '0',
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `parent_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `association_role`
--

CREATE TABLE `association_role` (
  `role_id` int(11) NOT NULL,
  `sid` varchar(255) NOT NULL,
  `association_id` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `sid` varchar(10) NOT NULL,
  `run_id` varchar(50) NOT NULL,
  `application_id` int(11) NOT NULL,
  `check_in` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `college`
--

CREATE TABLE `college` (
  `sid` varchar(20) NOT NULL,
  `college` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `cu_link`
--

CREATE TABLE `cu_link` (
  `sid` varchar(20) NOT NULL,
  `cid` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `event`
--

CREATE TABLE `event` (
  `event_id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 NOT NULL,
  `association_id` varchar(100) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_public` tinyint(1) NOT NULL,
  `profile_image` varchar(512) NOT NULL,
  `category` varchar(40) NOT NULL,
  `form` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `major`
--

CREATE TABLE `major` (
  `id` int(11) NOT NULL,
  `major` varchar(100) NOT NULL,
  `association_ids` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `major_of`
--

CREATE TABLE `major_of` (
  `sid` varchar(20) NOT NULL,
  `major_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `member`
--

CREATE TABLE `member` (
  `id` int(11) NOT NULL,
  `sid` varchar(10) NOT NULL,
  `association_id` varchar(255) NOT NULL,
  `register_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `notification`
--

CREATE TABLE `notification` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` varchar(255) CHARACTER SET utf8 NOT NULL,
  `redirect_url` varchar(100) NOT NULL,
  `image_url` varchar(100) NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `notification_read`
--

CREATE TABLE `notification_read` (
  `id` int(11) NOT NULL,
  `sid` varchar(20) NOT NULL,
  `last_read` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `notification_registration`
--

CREATE TABLE `notification_registration` (
  `id` int(11) NOT NULL,
  `sid` varchar(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `registration_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `device_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `run`
--

CREATE TABLE `run` (
  `run_id` varchar(255) NOT NULL,
  `event_id` int(11) NOT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `all_day` tinyint(1) NOT NULL,
  `repeat` tinyint(1) NOT NULL,
  `repeat_style` varchar(10) DEFAULT NULL,
  `online` tinyint(1) NOT NULL,
  `venue_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `survey`
--

CREATE TABLE `survey` (
  `id` int(11) NOT NULL,
  `question_json` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `survey_meta`
--

CREATE TABLE `survey_meta` (
  `id` varchar(50) NOT NULL,
  `survey_id` int(11) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `event_id` int(11) NOT NULL,
  `association_id` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `survey_question_meta`
--

CREATE TABLE `survey_question_meta` (
  `id` int(11) NOT NULL,
  `survey_id` int(11) NOT NULL,
  `document_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `user_notification`
--

CREATE TABLE `user_notification` (
  `id` int(11) NOT NULL,
  `notification_id` varchar(50) NOT NULL,
  `sid` varchar(20) NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `send_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `user_private`
--

CREATE TABLE `user_private` (
  `firebase_uid` varchar(255) NOT NULL,
  `public_uid` varchar(255) NOT NULL,
  `sid` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `register_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `user_profile`
--

CREATE TABLE `user_profile` (
  `sid` varchar(10) NOT NULL,
  `public` tinyint(1) NOT NULL DEFAULT '1',
  `introduction` text CHARACTER SET utf8,
  `email` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `country_code` varchar(5) DEFAULT NULL,
  `phone_no` varchar(20) DEFAULT NULL,
  `major` varchar(50) NOT NULL,
  `college` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `venue`
--

CREATE TABLE `venue` (
  `venue_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `lat` varchar(10) DEFAULT NULL,
  `lng` varchar(10) DEFAULT NULL,
  `place_id` varchar(100) DEFAULT NULL,
  `zoom` int(11) DEFAULT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `application`
--
ALTER TABLE `application`
  ADD PRIMARY KEY (`application_id`);

--
-- 資料表索引 `application_form`
--
ALTER TABLE `application_form`
  ADD PRIMARY KEY (`form_id`);

--
-- 資料表索引 `approve_request`
--
ALTER TABLE `approve_request`
  ADD PRIMARY KEY (`request_id`);

--
-- 資料表索引 `association`
--
ALTER TABLE `association`
  ADD PRIMARY KEY (`association_id`);

--
-- 資料表索引 `association_role`
--
ALTER TABLE `association_role`
  ADD PRIMARY KEY (`role_id`);

--
-- 資料表索引 `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `college`
--
ALTER TABLE `college`
  ADD PRIMARY KEY (`sid`);

--
-- 資料表索引 `cu_link`
--
ALTER TABLE `cu_link`
  ADD PRIMARY KEY (`sid`);

--
-- 資料表索引 `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`event_id`);

--
-- 資料表索引 `major`
--
ALTER TABLE `major`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `major_of`
--
ALTER TABLE `major_of`
  ADD PRIMARY KEY (`sid`);

--
-- 資料表索引 `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `notification_read`
--
ALTER TABLE `notification_read`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `notification_registration`
--
ALTER TABLE `notification_registration`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `run`
--
ALTER TABLE `run`
  ADD PRIMARY KEY (`run_id`);

--
-- 資料表索引 `survey`
--
ALTER TABLE `survey`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `survey_meta`
--
ALTER TABLE `survey_meta`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `survey_question_meta`
--
ALTER TABLE `survey_question_meta`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `user_notification`
--
ALTER TABLE `user_notification`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `user_private`
--
ALTER TABLE `user_private`
  ADD UNIQUE KEY `firebase_uid` (`firebase_uid`);

--
-- 資料表索引 `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`sid`);

--
-- 資料表索引 `venue`
--
ALTER TABLE `venue`
  ADD PRIMARY KEY (`venue_id`);

--
-- 在傾印的資料表使用自動增長(AUTO_INCREMENT)
--

--
-- 使用資料表自動增長(AUTO_INCREMENT) `application`
--
ALTER TABLE `application`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `application_form`
--
ALTER TABLE `application_form`
  MODIFY `form_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `approve_request`
--
ALTER TABLE `approve_request`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `association_role`
--
ALTER TABLE `association_role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `major`
--
ALTER TABLE `major`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `member`
--
ALTER TABLE `member`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `notification_read`
--
ALTER TABLE `notification_read`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `notification_registration`
--
ALTER TABLE `notification_registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `survey`
--
ALTER TABLE `survey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `survey_question_meta`
--
ALTER TABLE `survey_question_meta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `user_notification`
--
ALTER TABLE `user_notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動增長(AUTO_INCREMENT) `venue`
--
ALTER TABLE `venue`
  MODIFY `venue_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
