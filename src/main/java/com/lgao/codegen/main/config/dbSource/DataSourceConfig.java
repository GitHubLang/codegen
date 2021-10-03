package com.lgao.codegen.main.config.dbSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * 多数据源配置
 */
@Configuration
public class DataSourceConfig {


    //本系统数据源配置
    @Primary
    @Bean(name = "sysDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource.sysdb")
    public DataSourceProperties sysDataSourceProperties() {
        return new DataSourceProperties();
    }

    //主数据源 本系统数据源配置
    @Primary
    @Bean(name = "sysDataSource")
    public DataSource sysDataSource(@Qualifier("sysDataSourceProperties") DataSourceProperties dataSourceProperties) {
        return dataSourceProperties.initializeDataSourceBuilder().build();
    }

    //主数据源配置 db1数据源配置

    @Bean(name = "oracleDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource.oracle")
    public DataSourceProperties oracleDataSourceProperties() {
        return new DataSourceProperties();
    }

    //主数据源 oracle数据源
    @Bean(name = "oracleDataSource")
    public DataSource oracleDataSource(@Qualifier("oracleDataSourceProperties") DataSourceProperties dataSourceProperties) {
        return dataSourceProperties.initializeDataSourceBuilder().build();
    }

    //第二个mysql数据源配置
    @Bean(name = "mysqlDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource.mysql")
    public DataSourceProperties mysqlDataSourceProperties() {
        return new DataSourceProperties();
    }

    //第二个mysql数据源
    @Bean("mysqlDataSource")
    public DataSource mysqlDataSource(@Qualifier("mysqlDataSourceProperties") DataSourceProperties dataSourceProperties) {
        return dataSourceProperties.initializeDataSourceBuilder().build();
    }

}
