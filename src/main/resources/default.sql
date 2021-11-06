CREATE TABLE `sys_db_source`  (
  `id` bigint(20) NOT NULL COMMENT '主键',
  `dbname` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '数据库名称',
  `driver` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '驱动',
  `url` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'url',
  `username` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;