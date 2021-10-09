package com.lgao.codegen.main.config.dbSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

@Component("JdbcTemplateOracle")
public class JdbcTemplateOracle extends JdbcTemplate implements MyJdbc{

    public JdbcTemplateOracle(@Qualifier("oracleDataSource")DataSource dataSource) {
        super(dataSource);
    }

    public List<Map<String, Object>> getAllTables(){
        String sql = "select table_name as \"name\"," +
                "case when comments is null then table_name else table_name||' - '||comments  end as \"comments\" " +
                "from user_tab_comments order by table_name";
        return this.queryForList(sql);
    }


    public List<Map<String, Object>> getTableFieldInfo(String tableName){
        String sql =  " SELECT \n" +
                "   a.TABLE_NAME as \"tableName\",\n" +
                "   a.column_name as \"column\",\n" +
                "   a.column_name as \"fieldName\",\n" +
                "    a.data_type || '(' || case when a.data_type='NUMBER' then a.DATA_PRECISION else a.data_length end || ')' as \"dbtype\",\n" +
                "   b.comments as \"comments\",\n" +
                "   a.nullable as \"isnull\"\n" +
                "FROM user_tab_columns a, user_col_comments b\n" +
                "WHERE a.TABLE_NAME = b.table_name\n" +
                "     and b.table_name = ? \n" +
                "     and a.column_name = b.column_name\n" +
                "order by a.table_name";
        return this.queryForList(sql, tableName);
    }

}
