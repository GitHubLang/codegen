package com.lgao.codegen.main.controller;

import com.lgao.codegen.main.config.dbSource.JdbcTemplateMysql;
import com.lgao.codegen.main.entitys.LayuiEntity;
import com.lgao.codegen.main.factory.LayuiFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class MainController {

    @Autowired
    private JdbcTemplateMysql jdbcTemplate;

    @RequestMapping("/")
    public String testIndex(Model model){
        model.addAttribute("s","ssss");
       return "/index.html";
    }

    @RequestMapping("/modular/{page}")
    public String toPage(Model model, @PathVariable("page")String page){
        model.addAttribute("s","ssss");

        return "/modular/" + page + ".html";
    }

    @RequestMapping("/tables/{tableName}")
    @ResponseBody
    public LayuiEntity getTableData(@PathVariable("tableName")String tableName){

        try {

            List<Map<String, Object>> maps = jdbcTemplate.getTableFieldInfo(tableName);
            //Object o = JSON.toJSON(maps);
            //String s = JSON.toJSONString(o, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue,
             //       SerializerFeature.WriteDateUseDateFormat);

            return LayuiFactory.genLayuiEntity(maps);
        }catch (Exception e){
            e.printStackTrace();
            return new LayuiEntity();
        }


    }

    @RequestMapping("/allTables")
    @ResponseBody
    public LayuiEntity getAllTables(){

        try {
            List<Map<String, Object>> maps = jdbcTemplate.getAllTables();
            //Object o = JSON.toJSON(maps);
            //String s = JSON.toJSONString(o, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue,
            //       SerializerFeature.WriteDateUseDateFormat);

            return LayuiFactory.genLayuiEntity(maps);
        }catch (Exception e){
            e.printStackTrace();
            return new LayuiEntity();
        }


    }




}
