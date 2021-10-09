package com.lgao.codegen.main.config.dbSource;

import java.util.List;
import java.util.Map;

public interface MyJdbc {

    List<Map<String, Object>> getAllTables();

    List<Map<String, Object>> getTableFieldInfo(String tableName);

}
