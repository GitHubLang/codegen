package com.lgao.codegen.main.entitys;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.JdbcUtils;

import java.sql.ResultSet;

import java.sql.ResultSetMetaData;

import java.sql.SQLException;

import java.util.LinkedHashMap;

import java.util.Map;



/**

 * 将每行映射为MAP对象的RowMapper实现。

 *

 * @author g00106664

 * @version C02 2009-4-27

 * @since OpenEye WIDGET_SRV V100R001C02

 */

@SuppressWarnings("unchecked")
public class AnyMapper implements RowMapper {


    @Override
    public Map mapRow(ResultSet rs, int rowNum) throws SQLException

    {
        ResultSetMetaData rsmd = rs.getMetaData();

        int columnCount = rsmd.getColumnCount();

        Map mapOfColValues = createColumnMap(columnCount);

        for (int i = 1; i <= columnCount; i++)

        {
            String key = getColumnKey(rsmd.getColumnName(i));

            Object obj = getColumnValue(rs, i);

            mapOfColValues.put(key.toLowerCase(), obj);

        }

        return mapOfColValues;

    }



    protected Map createColumnMap(int columnCount)

    {
        return new LinkedHashMap(columnCount);

    }



    protected String getColumnKey(String columnName)

    {
        return columnName;

    }

    protected Object getColumnValue(ResultSet rs, int index)

            throws SQLException

    {
        return JdbcUtils.getResultSetValue(rs, index);
    }

}
