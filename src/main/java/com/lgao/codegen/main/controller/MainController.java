package com.lgao.codegen.main.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.lgao.codegen.main.config.dbSource.MyJdbc;
import com.lgao.codegen.main.config.mvc.JSONParam;
import com.lgao.codegen.main.entitys.LayuiEntity;
import com.lgao.codegen.main.factory.LayuiFactory;
import com.lgao.codegen.main.utils.JdbcUtils;
import org.beetl.core.Configuration;
import org.beetl.core.GroupTemplate;
import org.beetl.core.Template;
import org.beetl.core.resource.FileResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class MainController {

    /**
     * 本系统数据库数据源
     */
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JdbcUtils jdbcUtils;


    private String template = "/pages/template/";

    private String root = URLDecoder.decode(ResourceUtils.getURL("classpath:").getPath() + template, "UTF-8");

    private FileResourceLoader resourceLoader = new FileResourceLoader(root,"utf-8");

    private Configuration cfg = Configuration.defaultConfiguration();

    private GroupTemplate gt = new GroupTemplate(resourceLoader, cfg);

    public MainController() throws IOException {
    }

    @RequestMapping("/")
    public String testIndex(Model model){
        model.addAttribute("s","ssss");
       return "/index.html";
    }

    @RequestMapping("/modular/{page}")
    public String toPage(Model model, @PathVariable("page") String page){
        model.addAttribute("s","ssss");

        return "/modular/" + page + ".html";
    }

    @RequestMapping("/tables/{tableName}")
    @ResponseBody
    public LayuiEntity getTableData(HttpServletRequest request, @PathVariable("tableName") String tableName){

        try {
            MyJdbc jdbcTemplate = (MyJdbc) request.getSession().getAttribute("dbsource");
            if(jdbcTemplate==null){
                return LayuiFactory.genLayuiEntity();
            }
            List<Map<String, Object>> maps = jdbcTemplate.getTableFieldInfo(tableName);

            return LayuiFactory.genLayuiEntity(maps);
        }catch (Exception e){
            e.printStackTrace();
            return LayuiFactory.genLayuiEntity();
        }


    }

    @RequestMapping("/allDbs")
    @ResponseBody
    public LayuiEntity getAllDbs(){

        try {
            String sql = "select id, dbname from sys_db_source";
            List<Map<String, Object>> maps = jdbcTemplate.queryForList(sql);

            return LayuiFactory.genLayuiEntity(maps);
        }catch (Exception e){
            e.printStackTrace();
            return LayuiFactory.genLayuiEntity();
        }
    }


    /**
     * 设置数据源
     * @param request
     * @param id 配置表id
     * @return
     */
    @RequestMapping("/setDbsource")
    @ResponseBody
    public LayuiEntity setDbsource(HttpServletRequest request, @RequestParam Long id){

        try {

            //
            Map<Long,MyJdbc> dbsourceMap = (Map<Long, MyJdbc>) request.getSession().getAttribute("dbsourceMap");
            if(dbsourceMap==null){
                Map<Long,MyJdbc> map = new HashMap<>();
                MyJdbc jdbcTemplate = jdbcUtils.getJdbcTemplateById(id);
                map.put(id,jdbcTemplate);
                request.getSession().setAttribute("dbsourceMap", map);
                request.getSession().setAttribute("dbsource", jdbcTemplate);
            }else{
                MyJdbc myJdbc = dbsourceMap.get(id);
                if(myJdbc==null){
                    MyJdbc jdbcTemplate = jdbcUtils.getJdbcTemplateById(id);
                    dbsourceMap.put(id,jdbcTemplate);
                    request.getSession().setAttribute("dbsource", jdbcTemplate);
                }else {
                    request.getSession().setAttribute("dbsource", myJdbc);
                }
            }


            return LayuiFactory.genLayuiEntity("sucess");
        }catch (Exception e){
            e.printStackTrace();
            return LayuiFactory.genLayuiEntity("err");
        }
    }



    @RequestMapping("/allTables")
    @ResponseBody
    public LayuiEntity getAllTables(HttpServletRequest request){

        try {
            MyJdbc jdbcTemplate = (MyJdbc) request.getSession().getAttribute("dbsource");
            if(jdbcTemplate==null){
                return LayuiFactory.genLayuiEntity();
            }
            List<Map<String, Object>> maps = jdbcTemplate.getAllTables();

            return LayuiFactory.genLayuiEntity(maps);
        }catch (Exception e){
            e.printStackTrace();
            return LayuiFactory.genLayuiEntity();
        }
    }

    @RequestMapping("/allTemplates")
    @ResponseBody
    public LayuiEntity getAllTemplates(){

        try {
            List<Map<String, Object>> maps = new ArrayList<>();

            File f = new File(root);
            File[] files = f.listFiles();
            for (File f1:
                 files) {
                if(f1.isFile()){
                    Map<String, Object> map = new HashMap<>(1);
                    map.put("fileName",f1.getName());
                    maps.add(map);
                }

            }

            return LayuiFactory.genLayuiEntity(maps);
        }catch (Exception e){
            e.printStackTrace();
            return LayuiFactory.genLayuiEntity();
        }

    }

    @RequestMapping("/setData")
    @ResponseBody
    public LayuiEntity recJson(@RequestParam String templateStr,
                               @JSONParam List<Map<String, Object>> data) {

      String[] templateFileNameArray = templateStr.split(",");

      JSONArray jsonArray = new JSONArray();

        Object o = JSON.toJSON(data);
        String s = JSON.toJSONString(o, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue,
                SerializerFeature.WriteDateUseDateFormat);

        for (String templateFileName : templateFileNameArray) {
            jsonArray.add( getOneTemplateResult(templateFileName, data, s));
        }

        return LayuiFactory.genLayuiEntity(jsonArray);
    }

    public JSONObject getOneTemplateResult(String tempFileName, List<Map<String, Object>> data, String dataJson){


        Template t = gt.getTemplate(tempFileName);
        t.binding("mydata", data);
        t.binding("mydataJson", dataJson);

        String str = t.render();

        JSONObject object = new JSONObject();
        object.put("tempFileName", tempFileName);
        object.put("tempRes", str);

        return object;

    }




}
