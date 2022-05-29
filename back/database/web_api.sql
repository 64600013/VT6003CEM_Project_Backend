-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2022-05-29 09:35:54
-- 伺服器版本： 10.4.22-MariaDB
-- PHP 版本： 7.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫: `web_api`
--

-- --------------------------------------------------------

--
-- 資料表結構 `dog`
--

CREATE TABLE `dog` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `age` int(100) NOT NULL,
  `sex` varchar(255) NOT NULL,
  `breed` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `dog`
--

INSERT INTO `dog` (`id`, `name`, `age`, `sex`, `breed`, `location`, `image`) VALUES
(1, 'testOne', 4, 'Boy', 'gold', 'Tai Po', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
(4, 'testssss', 4, 'boy', 'gold', 'Tai Po', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
(7, 'Jasons', 1, 'Boy', 'Bull', 'Tai Po', 'https://cdn.britannica.com/05/30105-004-644BE36D.jpg'),
(8, 'Jasonss', 1, 'Boy', 'Shiba', 'Tsuen Wan', 'https://cdn.britannica.com/05/30105-004-644BE36D.jpg'),
(12, 'Peter', 2, 'Boy', 'Gold', 'Tsuen Wan', 'https://www.hepper.com/wp-content/uploads/2021/11/Tan-Golden-Retriever-Puppy.jpg'),
(14, 'Petersa', 2, 'Female', 'Shiba', 'Sha Tin', '');

-- --------------------------------------------------------

--
-- 資料表結構 `worker`
--

CREATE TABLE `worker` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `age` int(100) NOT NULL,
  `sex` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `signup_code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `worker`
--

INSERT INTO `worker` (`id`, `email`, `password`, `name`, `age`, `sex`, `image`, `signup_code`) VALUES
(1, '321654014f@gmail.com', '2f078ff4f34a3c1d59a3dd1eac85e629c92800814bb442e81aa366849e59f0088b880af3ab2e1ff1dfc2e5c15217044bec27b61a15d259a7fcb413e5067aa5e8', 'test', 18, 'Boy', '', '1234'),
(2, 'junkmailtaker646@gmail.com', 'aeae379a6e857728e44164267fdb7a0e27b205d757cc19899586c89dbb221930f1813d02ff93a661859bc17065eac4d6edf3c38a034e6283a84754d52917e5b0', 'jason', 12, 'boy', '', '123');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `dog`
--
ALTER TABLE `dog`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `worker`
--
ALTER TABLE `worker`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `dog`
--
ALTER TABLE `dog`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `worker`
--
ALTER TABLE `worker`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
