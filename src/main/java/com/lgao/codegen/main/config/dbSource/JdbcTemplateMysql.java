package com.lgao.codegen.main.config.dbSource;

import com.lgao.codegen.main.utils.JdbcUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

@Component
public class JdbcTemplateMysql extends JdbcTemplate {

    @Autowired
    JdbcUtils jdbcUtils;

    public JdbcTemplateMysql(@Qualifier("mysqlDataSource") DataSource dataSource) {
        super(dataSource);
    }


    public List<Map<String, Object>> getAllTables(){
        String sql = "select table_name as \"name\", " +
                "case when table_comment is null then table_name else  CONCAT(table_name,table_comment) end as \"comments\"" +
                " from information_schema.tables where table_schema= ? order by table_name";
        return this.queryForList(sql, jdbcUtils.getDBInfo().get("dbName"));
    }


    public List<Map<String, Object>> getTableFieldInfo(String tableName){
        String sql =  "SELECT\n" +
                "    TABLE_NAME AS 'tableName',\n" +
                "    COLUMN_NAME AS 'column',\n" +
                "    COLUMN_NAME AS 'fieldName',\n" +
                "    ORDINAL_POSITION AS 'columnOrder',\n" +
                "    COLUMN_DEFAULT AS 'defaultValue',\n" +
                "    case when IS_NULLABLE='NO' then 'N' else 'Y' end AS 'isnull',\n" +
                "    CONCAT_WS('',DATA_TYPE,'(',CHARACTER_MAXIMUM_LENGTH,NUMERIC_PRECISION,',',NUMERIC_SCALE,')') AS 'dbtype',\n" +
                "    CHARACTER_MAXIMUM_LENGTH AS 'maxLength',\n" +
                "    NUMERIC_PRECISION AS 'numMaxLength',\n" +
                "    NUMERIC_SCALE AS 'numScale',\n" +
                "    COLUMN_TYPE AS 'columnType',\n" +
                "    COLUMN_KEY 'key',\n" +
                "    EXTRA AS 'extra',\n" +
                "    COLUMN_COMMENT AS 'comments'\n" +
                "FROM\n" +
                "    information_schema.`COLUMNS`\n" +
                "WHERE\n" +
                "    TABLE_SCHEMA = ? \n" +
                "\t\tand TABLE_NAME = ? \n" +
                "ORDER BY\n" +
                "    TABLE_NAME,\n" +
                "    ORDINAL_POSITION";
        return this.queryForList(sql,jdbcUtils.getDBInfo().get("dbName"), tableName);
    }

}
