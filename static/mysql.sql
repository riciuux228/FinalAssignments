-- 创建数据库
CREATE DATABASE IF NOT EXISTS `arcicle_sys` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 使用数据库
USE `arcicle_sys`;

-- 创建文章表
CREATE TABLE `yesapi_bjy_article` (
    `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '唯一标识，主键',
    `aid` INT(10) NOT NULL COMMENT '文章表主键，唯一标识符',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `author` VARCHAR(50) NOT NULL COMMENT '作者',
    `content` MEDIUMTEXT NOT NULL COMMENT '文章内容',
    `keywords` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '关键字，用于SEO',
    `description` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '文章简短描述，用于SEO',
    `is_show` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '文章是否显示 1是 0否',
    `is_delete` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否删除 1是 0否',
    `is_top` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否置顶 1是 0否',
    `is_original` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '是否原创 1是 0否',
    `click` INT(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT '点击数',
    `addtime` INT(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT '添加时间，Unix时间戳',
    `cid` TINYINT(2) UNSIGNED NOT NULL DEFAULT '0' COMMENT '分类ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_aid` (`aid`),  -- 给aid添加唯一索引
    KEY `idx_click` (`click`),  -- 添加点击数的索引
    KEY `idx_cid` (`cid`)       -- 添加分类ID的索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='博客-文章表';


-- 插入一篇文章
INSERT INTO `yesapi_bjy_article` (`aid`, `title`, `author`, `content`, `keywords`, `description`, `is_show`, `is_delete`, `is_top`, `is_original`, `click`, `addtime`, `cid`)
VALUES (1, '如何优化数据库查询', '张三', '本文讨论了如何通过索引优化数据库查询...', '优化,数据库,查询', '数据库优化教程', 1, 0, 0, 1, 100, UNIX_TIMESTAMP(), 2);

-- 插入多篇文章
INSERT INTO `yesapi_bjy_article` (`aid`, `title`, `author`, `content`, `keywords`, `description`, `is_show`, `is_delete`, `is_top`, `is_original`, `click`, `addtime`, `cid`)
VALUES 
(2, '如何学习Python', '李四', 'Python是当前最流行的编程语言之一...', 'Python,编程,学习', 'Python学习教程', 1, 0, 1, 1, 500, UNIX_TIMESTAMP(), 3),
(3, 'MySQL索引详解', '王五', '本文深入讨论了MySQL中的索引优化...', 'MySQL,索引,优化', 'MySQL索引优化', 1, 0, 0, 1, 250, UNIX_TIMESTAMP(), 2);

-- 修改文章标题和内容
UPDATE `yesapi_bjy_article`
SET `title` = '如何高效学习Python编程', `content` = '本文将讨论如何高效学习Python编程，并推荐相关资源。'
WHERE `aid` = 2;

-- 修改文章的点击数（模拟点击量增加）
UPDATE `yesapi_bjy_article`
SET `click` = `click` + 1
WHERE `aid` = 1;

-- 将文章设置为置顶
UPDATE `yesapi_bjy_article`
SET `is_top` = 1
WHERE `aid` = 3;

-- 软删除文章（不实际删除数据，而是将is_delete设置为1）
UPDATE `yesapi_bjy_article`
SET `is_delete` = 1
WHERE `aid` = 1;

-- 真正删除一篇文章（物理删除）
DELETE FROM `yesapi_bjy_article`
WHERE `aid` = 3;

-- 删除所有已经软删除的文章
DELETE FROM `yesapi_bjy_article`
WHERE `is_delete` = 1;

-- 查询所有显示的文章
SELECT * FROM `yesapi_bjy_article`
WHERE `is_show` = 1 AND `is_delete` = 0;

-- 查询点击量超过100的置顶文章
SELECT `title`, `author`, `click` FROM `yesapi_bjy_article`
WHERE `is_top` = 1 AND `click` > 100 AND `is_delete` = 0;

-- 查询某个分类下的文章
SELECT `title`, `description`, `author` FROM `yesapi_bjy_article`
WHERE `cid` = 2 AND `is_show` = 1;

CREATE TABLE `yesapi_bjy_comments` (
    `comment_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论主键，唯一标识',
    `article_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '关联文章的ID',
    `user_id` BIGINT(20) UNSIGNED DEFAULT NULL COMMENT '用户ID（如果有用户表）',
    `username` VARCHAR(50) NOT NULL COMMENT '评论者用户名或昵称',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `parent_comment_id` BIGINT(20) UNSIGNED DEFAULT NULL COMMENT '父评论ID，用于回复功能',
    `is_show` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '评论是否显示 1是 0否',
    `is_delete` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否删除 1是 0否',
    `addtime` INT(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT '评论添加时间（Unix时间戳）',
    PRIMARY KEY (`comment_id`),
    KEY `idx_article_id` (`article_id`),  -- 为文章ID创建索引，加快查询
    KEY `idx_parent_comment_id` (`parent_comment_id`)  -- 为父评论ID创建索引，加快评论回复查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='博客文章评论表';

-- 插入一条顶级评论（直接对文章评论）
INSERT INTO `yesapi_bjy_comments` (`article_id`, `user_id`, `username`, `content`, `addtime`)
VALUES (1, 12345, '张三', '这篇文章写得很不错，学到了很多！', UNIX_TIMESTAMP());

-- 插入一条回复评论（对某条评论的回复）
INSERT INTO `yesapi_bjy_comments` (`article_id`, `user_id`, `username`, `content`, `parent_comment_id`, `addtime`)
VALUES (1, 67890, '李四', '我也有同感！', 1, UNIX_TIMESTAMP());

-- 修改评论内容
UPDATE `yesapi_bjy_comments`
SET `content` = '这篇文章的内容非常好！', `is_show` = 1
WHERE `comment_id` = 1;

-- 将评论设为不可见（例如屏蔽不当言论）
UPDATE `yesapi_bjy_comments`
SET `is_show` = 0
WHERE `comment_id` = 1;

-- 软删除一条评论
UPDATE `yesapi_bjy_comments`
SET `is_delete` = 1
WHERE `comment_id` = 1;

-- 真正删除评论
DELETE FROM `yesapi_bjy_comments`
WHERE `comment_id` = 1;

-- 查询某篇文章的所有评论（未删除且显示的评论）
SELECT * FROM `yesapi_bjy_comments`
WHERE `article_id` = 1 AND `is_show` = 1 AND `is_delete` = 0
ORDER BY `addtime` ASC;

-- 查询某条评论的所有回复
SELECT * FROM `yesapi_bjy_comments`
WHERE `parent_comment_id` = 1 AND `is_show` = 1 AND `is_delete` = 0
ORDER BY `addtime` ASC;
