package com.lgao.codegen.main.utils;

import com.lgao.codegen.main.config.dbSource.JdbcTemplateMysql;
import com.lgao.codegen.main.config.dbSource.JdbcTemplateOracle;
import com.lgao.codegen.main.config.dbSource.MyJdbc;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;


@Component
public class JdbcUtils {

    /**
     * 本系统数据库数据源
     */
    @Autowired
    private JdbcTemplate jdbcTemplate;


    public HashMap<String, String> getDBInfo(String url) {
        String[] split = url.split(":");
        String host = String.format("%s:%s:%s", split[0], split[1], split[2]);
        String[] portSplit = split[3].split("/");
        String port = portSplit[0];

        String[] databaseSplit = portSplit[1].split("\\?");
        String dbName = databaseSplit[0];
        HashMap<String, String> result = new HashMap<>();
        result.put("url",url);
        result.put("host",host);
        result.put("port",port);
        result.put("dbName",dbName);
        return result;
    }


    public MyJdbc getJdbcTemplateById(Long id){

        String sql = "select * from sys_db_source where id = ?";
        Map<String, Object> map = jdbcTemplate.queryForMap(sql, id);

        String driver = (String) map.get("driver");
        String url = (String) map.get("url");
        String username = (String) map.get("username");
        String password = (String) map.get("password");

        HikariConfig jdbcConfig = new HikariConfig();
        jdbcConfig.setPoolName(getClass().getName());
        jdbcConfig.setDriverClassName(driver);
        jdbcConfig.setJdbcUrl(url);
        jdbcConfig.setUsername(username);
        jdbcConfig.setPassword(password);
        jdbcConfig.setMaximumPoolSize(1);
        jdbcConfig.setIdleTimeout(60);
        jdbcConfig.setMinimumIdle(1);
        //jdbcConfig.setMaxLifetime(30000);
        //jdbcConfig.setConnectionTimeout(180000);
        //jdbcConfig.setIdleTimeout(10000);
        DataSource dataSource = new HikariDataSource(jdbcConfig);


//        DataSource dataSource = DataSourceBuilder.create()
//                .driverClassName(driver).url(url).username(username).password(password).build();

        if(driver.contains("oracle")){
            return new JdbcTemplateOracle(dataSource);
        }else if(driver.contains("mysql")){
            JdbcTemplateMysql myJdbc =  new JdbcTemplateMysql(dataSource);
            myJdbc.setUrl(url);
            myJdbc.setJdbcUtils(this);
            return myJdbc;
        }else if(driver.contains("mariadb")){
            JdbcTemplateMysql myJdbc =  new JdbcTemplateMysql(dataSource);
            myJdbc.setUrl(url);
            myJdbc.setJdbcUtils(this);
            return myJdbc;
        }else {
            return null;
        }

    }

}
