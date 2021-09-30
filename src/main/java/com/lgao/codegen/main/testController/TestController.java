package com.lgao.codegen.main.testController;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Key;
import java.sql.ResultSet;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * @author lgao
 * @version sjv2
 * @des
 * @date 2021/7/21 17:33
 */
@Controller
public class TestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${mydb.sql}")
    String mysql;

    @RequestMapping("/select")
    @ResponseBody
    public Object testIndex(){

          try {
              List<Map<String, Object>> maps = jdbcTemplate.queryForList(mysql);
              Object o = JSON.toJSON(maps);
              String s = JSON.toJSONString(o, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue,
                      SerializerFeature.WriteDateUseDateFormat);
              System.out.println(s);
              return "<pre>"+s+"</pre>";
          }catch (Exception e){
              e.printStackTrace();
              return e.getMessage();
          }
    }

    @RequestMapping("/insert")
    @ResponseBody
    public Object insert(){

        try {
            List<Map<String, Object>> maps = jdbcTemplate.queryForList(mysql);

            String reg = "(?<=from(\\s{1,100}))(.*?(?=\\s))";
            Pattern p = Pattern.compile(reg);
            Matcher m = p.matcher(mysql);
            String tablename = null;
            if(m.find() ==true) {
                tablename = m.group();
            }
            String finalTablename = tablename;
            List<String> collect = maps.stream().map((o) -> {
                String s1 = "insert into "+ finalTablename +" (";
                Set<String> keys = o.keySet();
                for (String key : keys) {
                    s1 += (","+ key);
                }
                s1 += " ) value (";

                for (String key : keys) {
                    if(o.get(key) instanceof Integer||o.get(key) instanceof Long){
                        s1 += (","+ o.get(key));
                    }else {
                        s1 += (", '"+ o.get(key)+"'");
                    }

                }
                s1 += ");";
                s1 = s1.replaceAll("\\(,","(");
                System.out.println(s1);
                return s1;
            }).collect(Collectors.toList());

            Object o = JSON.toJSON(collect);
            String s = JSON.toJSONString(o, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue,
                    SerializerFeature.WriteDateUseDateFormat);
            //System.out.println(s);
            return "<pre>"+s+"</pre>";
        }catch (Exception e){
            e.printStackTrace();
            return e.getMessage();
        }
    }


    @RequestMapping("/a")
    @ResponseBody
    public Object testA(){
        System.out.println("a页");
        return "aaaaaaa";
    }
}
